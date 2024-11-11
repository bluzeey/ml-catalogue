import Link from "next/link";
import { Search } from "lucide-react";

export default function Header() {
  return (
    <header className="px-6 lg:px-8 py-4 flex items-center justify-between border-b">
      <Link className="flex items-center justify-center space-x-2" href="#">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900">
          <Search className="h-5 w-5 text-gray-100" />
        </div>
        <span className="text-xl font-semibold">ML Catalogue</span>
        <span className="sr-only">AI Platform Catalog</span>
      </Link>
      <nav className="flex gap-6 sm:gap-8">
        <Link
          className="text-sm sm:text-base font-medium hover:text-primary hover:underline underline-offset-4 transition-colors"
          href="#"
        >
          About
        </Link>
        <Link
          className="text-sm sm:text-base font-medium hover:text-primary hover:underline underline-offset-4 transition-colors"
          href="#"
        >
          Platforms
        </Link>
        <Link
          className="text-sm sm:text-base font-medium hover:text-primary hover:underline underline-offset-4 transition-colors"
          href="#"
        >
          Contact
        </Link>
      </nav>
    </header>
  );
}
