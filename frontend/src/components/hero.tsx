import { useState } from "react";
import { SearchBar } from "../components/searchBar";
import { SearchResults } from "../components/searchResults";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setStreamingContent("");
    setShowResults(true);

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

          if (chunk.trim() === "data: [DONE]") {
            setLoading(false);
            setShowResults(true);
            return;
          }

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

  const handleBack = () => {
    setShowResults(false);
    setStreamingContent("");
  };

  return (
    <>
      {!showResults ? (
        <section className="w-screen h-screen flex justify-center items-center bg-gray-50">
          <div className=" px-4 md:px-6">
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
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
                loading={loading}
              />
            </div>
          </div>
        </section>
      ) : (
        <SearchResults
          streamingContent={streamingContent}
          handleBack={handleBack}
        />
      )}
    </>
  );
}
