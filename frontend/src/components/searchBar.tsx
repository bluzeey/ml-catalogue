import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  loading: boolean;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  handleSearch,
  loading,
}: SearchBarProps) {
  return (
    <form onSubmit={handleSearch} className="w-full max-w-sm space-y-2">
      <div className="relative">
        <Input
          className="pr-10 bg-white"
          placeholder="Search AI platforms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              //onReset(); // Removed onReset functionality
            }
          }}
        />
        <Button
          type="submit"
          disabled={loading}
          className="absolute inset-y-0 right-0 px-3 flex items-center justify-center bg-white hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Button>
      </div>
    </form>
  );
}
