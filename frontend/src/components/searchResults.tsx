import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface SearchResultsProps {
  streamingContent: string;
  handleBack: () => void;
}

export function SearchResults({
  streamingContent,
  handleBack,
}: SearchResultsProps) {
  return (
    <section className="w-full h-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-800">
      <div className=" px-4 md:px-6">
        <Button onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
        </Button>
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
          Search Results
        </h2>
        <Card className="w-full max-w-3xl mx-auto">
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
                p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-5 mb-4" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-5 mb-4" {...props} />
                ),
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                a: ({ node, ...props }) => (
                  <a className="text-blue-500 hover:underline" {...props} />
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
      </div>
    </section>
  );
}
