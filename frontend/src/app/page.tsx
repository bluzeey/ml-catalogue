"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStreamingContent("");

    try {
      const response = await fetch(
        `http://localhost:8000/api/search?query=${encodeURIComponent(
          searchQuery
        )}&file=trustradius-ml.csv`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("ReadableStream not supported");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let boundary;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
          const chunk = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);

          // Check if the chunk indicates completion
          if (chunk.trim() === "data: [DONE]") {
            setLoading(false);
            return;
          }

          // Process valid JSON data chunks
          if (chunk.startsWith("data: ")) {
            try {
              const jsonData = JSON.parse(chunk.slice(5));
              setStreamingContent((prev) => prev + jsonData.content);
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <Search className="h-6 w-6" />
          <span className="sr-only">AI Platform Catalog</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            About
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Platforms
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Contact
          </Link>
        </nav>
      </header>
      <main className="mx-auto">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  AI Platform Catalog
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Discover and compare enterprise AI and Machine Learning
                  platforms. Get detailed summaries, features, and pricing
                  information.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form onSubmit={handleSearch} className="flex space-x-2">
                  <Input
                    className="flex-1"
                    placeholder="Search AI platforms..."
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
              Search Results
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {streamingContent ? (
                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle>AI-Generated Summary</CardTitle>
                    <CardDescription>
                      Real-time generated summary of the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1 className="text-2xl font-bold mb-2" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="text-xl font-bold mb-2" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-lg font-bold mb-2" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-4" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc pl-5 mb-4" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal pl-5 mb-4" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="mb-1" {...props} />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            className="text-blue-500 hover:underline"
                            {...props}
                          />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className="border-l-4 border-gray-300 pl-4 italic mb-4"
                            {...props}
                          />
                        ),
                        code: ({ node, inline, ...props }) =>
                          inline ? (
                            <code
                              className="bg-gray-100 rounded px-1 py-0.5"
                              {...props}
                            />
                          ) : (
                            <pre className="bg-gray-100 rounded p-2 mb-4 overflow-x-auto">
                              <code {...props} />
                            </pre>
                          ),
                      }}
                    >
                      {streamingContent}
                    </ReactMarkdown>
                  </CardContent>
                </Card>
              ) : (
                <p className="text-center text-gray-500 col-span-full">
                  {loading
                    ? "Generating summary..."
                    : "Search for a platform to see its summary."}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2023 AI Platform Catalog. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
