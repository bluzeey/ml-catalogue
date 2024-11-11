"use client";
import Header from "../components/header";
import Footer from "../components/footer";
import Hero from "../components/hero";

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen ">
      <Header />
      <Hero />
      <Footer />
    </div>
  );
}
