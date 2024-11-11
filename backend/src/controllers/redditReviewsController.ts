// redditService.ts
import { google } from "googleapis";
import OpenAI from "openai";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const customSearch = google.customsearch("v1");
const googleApiKey = process.env.SERP_API_KEY;
const customSearchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_CX;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Function to fetch Reddit review links from Google Custom Search
export async function fetchRedditLinks(query: string): Promise<string[]> {
  try {
    const response = await customSearch.cse.list({
      auth: googleApiKey,
      cx: customSearchEngineId,
      q: `${query} Reddit review`,
    });

    const redditLinks =
      response.data.items
        ?.filter((item) => item.link && item.link.includes("reddit.com"))
        .map((item) => item.link as string) || [];

    return redditLinks.slice(0, 1);
  } catch (error) {
    console.error("Error fetching Reddit links:", error);
    return [];
  }
}

// Function to summarize Reddit content using OpenAI
export async function summarizeRedditContent(urls: string[]): Promise<string> {
  let combinedContent = "";

  for (const url of urls) {
    try {
      const redditData = await axios.get(`${url}.json`);
      const comments = redditData.data[1].data.children
        .map((child: any) => child.data.body)
        .slice(0, 3)
        .join("\n");

      combinedContent += comments + "\n";
    } catch (error) {
      console.error(`Error fetching comments from ${url}:`, error);
    }
  }

  // Summarize using OpenAI
  const summaryResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant that generates summaries for Reddit Reviews.",
      },
      {
        role: "user",
        content: `
         Summarize these Reddit comments:\n\n${combinedContent}. And write some of them down as well.`,
      },
    ],

    max_tokens: 500,
  });
  return summaryResponse.choices[0].message.content || "No summary available.";
}

// Main function to fetch and summarize Reddit reviews
export async function fetchAndSummarizeRedditReviews(
  query: string
): Promise<string> {
  const redditLinks = await fetchRedditLinks(query);
  return await summarizeRedditContent(redditLinks);
}
