// searchCsvController.ts
import { Request, Response } from "express";
import csvService from "../services/csvService";
import { fetchAndSummarizeRedditReviews } from "../controllers/redditReviewsController";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const searchCsvController = async (req: Request, res: Response) => {
  const { query, file } = req.query;

  if (typeof query !== "string" || typeof file !== "string") {
    return res
      .status(400)
      .json({ error: "Query and file parameters are required" });
  }

  try {
    const filePath = `./data/${file}`;
    const platformData = await csvService.findByName(query, filePath);

    if (!platformData) {
      return res.status(404).json({ error: "Platform not found" });
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // Fetch and summarize Reddit reviews
    const redditSummary = await fetchAndSummarizeRedditReviews(query);

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that generates summaries for AI/ML platforms.",
        },
        {
          role: "user",
          content: `
          Generate a one-page summary for the AI/ML platform described below:
          
          Name: ${platformData["What is the name of this AI/ML software platform?"]}
          Features: ${platformData["What are the features of this platform?"]}
          Key Differentiators: ${platformData["What are the key differentiators of this platform?"]}
          Client Industries: ${platformData["Which client industries are using this platform?"]}
          Pricing Information: ${platformData["What is the pricing information for this platform?"]}
          Deployment Options: ${platformData["What are the deployment options for this platform?"]}
          Customer Reviews and Ratings: ${platformData["What are the customer reviews and ratings of this platform?"]}
          Reddit Summary: ${redditSummary}
        `,
        },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error generating summary" });
  }
};
