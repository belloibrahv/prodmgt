import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { auth } from "@/lib/auth";
import MarketingNav from "@/components/marketing/MarketingNav";
import Hero from "@/components/marketing/Hero";
import ProductTour from "@/components/marketing/ProductTour";
import Features from "@/components/marketing/Features";
import Bento from "@/components/marketing/Bento";
import { Faq, FinalCta, Footer, Workflow } from "@/components/marketing/Closing";

export const metadata: Metadata = {
  title: { absolute: "TechVaults Project Manager · Run every project from one clear workspace" },
  description:
    "Plan projects, move tasks across the board, hit milestones and report on delivery. Projects, tasks, timeline, documents and reports in one workspace.",
};

export default async function RootPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <MotionConfig reducedMotion="user">
      <div
        id="tva-marketing"
        className="min-h-screen overflow-x-clip bg-tva-surface text-tva-ink"
        style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
      >
        <MarketingNav />
        <main>
          <Hero />
          <ProductTour />
          <Features />
          <Bento />
          <Workflow />
          <Faq />
          <FinalCta />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
