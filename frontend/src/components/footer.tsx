import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background py-6 px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        {/* Left Section */}
        <div className="flex flex-col sm:flex-row items-center sm:space-x-4 text-center sm:text-left space-y-2 sm:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ML Catalogue. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Powered by AI Platform Catalog
          </p>
        </div>

        {/* Right Section */}
        <nav className="flex gap-4 sm:gap-6 mt-4 sm:mt-0">
          <Link
            className="text-sm font-medium hover:text-primary hover:underline underline-offset-4 transition-colors"
            href="#"
          >
            Terms of Service
          </Link>
          <Link
            className="text-sm font-medium hover:text-primary hover:underline underline-offset-4 transition-colors"
            href="#"
          >
            Privacy Policy
          </Link>
          <Link
            className="text-sm font-medium hover:text-primary hover:underline underline-offset-4 transition-colors"
            href="#"
          >
            Contact Us
          </Link>
        </nav>
      </div>
    </footer>
  );
}
