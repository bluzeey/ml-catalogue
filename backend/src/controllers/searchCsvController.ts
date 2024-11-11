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
  model: "gpt-4o-mini",
  streaming: true,
});

export const searchCsvController = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (typeof query !== "string") {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    // Load CSV data
    const loader = new CSVLoader(`./data/merged_ratings.csv`);
    const docs = await loader.load();

    // Tokenize query for better matching
    const queryTokens = query.split(" ").filter((word) => word.length > 3);
    let matchingDocs = docs.filter((doc) =>
      queryTokens.some((token) =>
        doc.pageContent.toLowerCase().includes(token.toLowerCase())
      )
    );

    // Fallback if no exact match
    if (matchingDocs.length === 0) {
      console.warn("No exact match found; providing general list.");
      matchingDocs = docs.slice(0, 10); // Default to top 10 as a fallback
    }

    // Prepare Content and Fetch Reddit Summary
    const promptContent = matchingDocs
      .map((doc) => doc.pageContent)
      .join("\n\n");
    const redditSummary = await fetchAndSummarizeRedditReviews(query);

    // Prompt Template with OpenAI Preprocessing
    const promptTemplate = `Analyze the following user query: "${query}". Based on the query, do one of the following:
      - If the query asks about a specific model or platform, provide a detailed overview using the content below and relevant Reddit reviews.
      - If the query requests a list of models, list the top options with brief descriptions.
      - If the query asks to compare models, perform a comparison based on the content.

      Content:
      ${promptContent}

      Reddit Summary:
      ${redditSummary}`;

    console.log(promptTemplate);

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
