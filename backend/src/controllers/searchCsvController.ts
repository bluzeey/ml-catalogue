// searchCsvController.ts
import { Request, Response } from "express";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { fetchAndSummarizeRedditReviews } from "../controllers/redditReviewsController";
import dotenv from "dotenv";

dotenv.config();

// Initialize OpenAI model with LangChain
const openai = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4", // Specify the OpenAI model
  streaming: true, // Enable streaming
});

export const searchCsvController = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (typeof query !== "string") {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    // Step 1: Classify Query Intent
    const intentPrompt = ChatPromptTemplate.fromTemplate(
      `Analyze the following query and classify it into one of the following categories:
      - "specific_model" if it mentions a specific model name clearly (e.g., "Tell me about IBM WatsonX").
      - "list_request" if it asks for a general list or ranking of models (e.g., "top 10 ML models").
      - "comparison" if it asks to compare multiple models.
      - "general_summary" if it seeks an overview of AI/ML platforms.

      Query: "${query}"
      Intent:`
    );

    const intentParser = new StringOutputParser();
    const intentChain = intentPrompt.pipe(openai).pipe(intentParser);
    const intentResponse = await intentChain.invoke({ query });
    let intent = intentResponse.trim();

    // Step 2: Load CSV data
    const loader = new CSVLoader(`./data/merged_ratings.csv`);
    const docs = await loader.load();

    // Step 3: Check if the query directly matches a model in the CSV for specific_model intent
    let matchingDocs;
    if (intent === "specific_model") {
      matchingDocs = docs.filter((doc) =>
        doc.pageContent.toLowerCase().includes(query.toLowerCase())
      );

      // If no exact match, fall back to list request or general summary
      if (matchingDocs.length === 0) {
        matchingDocs = docs;
        intent = "list_request";
      }
    } else if (intent === "list_request") {
      matchingDocs = docs.slice(0, 10); // Example: fetch top 10 models
    } else if (intent === "comparison") {
      const modelsInQuery = query.split(" ").filter((word) => word.length > 3); // Extract possible model names
      matchingDocs = docs.filter((doc) =>
        modelsInQuery.some((model) =>
          doc.pageContent.toLowerCase().includes(model.toLowerCase())
        )
      );
    } else {
      matchingDocs = docs; // Default for "general_summary" or unspecified intent
    }

    if (!matchingDocs || matchingDocs.length === 0) {
      return res
        .status(404)
        .json({ error: "No matching documents found in CSV data" });
    }

    // Step 4: Prepare Content and Fetch Reddit Summary
    const promptContent = matchingDocs
      .map((doc) => doc.pageContent)
      .join("\n\n");
    const redditSummary = await fetchAndSummarizeRedditReviews(query);

    // Step 5: Construct Prompt Based on Intent
    const promptTemplate =
      intent === "list_request"
        ? `List the top AI/ML platforms based on the information below, with brief descriptions:\n\n${promptContent}`
        : intent === "comparison"
        ? `Compare the following AI/ML platforms based on the information below:\n\n${promptContent}`
        : `Generate a detailed summary for the AI/ML platform described below:\n\nInformation:\n${promptContent}\n\nReddit Summary:\n${redditSummary}`;

    const prompt = ChatPromptTemplate.fromTemplate(promptTemplate);
    const parser = new StringOutputParser();
    const chain = prompt.pipe(openai).pipe(parser);

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // Stream response content
    for await (const event of chain.streamEvents(
      { query },
      { version: "v2" }
    )) {
      if (event.event === "on_chat_model_stream") {
        const chunkContent = event.data.chunk?.content || "";
        res.write(`data: ${JSON.stringify({ content: chunkContent })}\n\n`);
      }
    }

    // Finalize the stream
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error generating summary" });
  }
};
