import Link from "next/link";
import { ExploreTemplates } from "./explore-templates";

export const metadata = {
  title: "Explore Templates — SkillSMITH",
  description: "Browse community skill templates. Find and fork proven SKILL.md files for Claude.",
};

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.5)] hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Back to home
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center font-bold rounded-[40px] text-xs px-4 py-2 bg-[#bfff00] text-[#0a0a0a] hover:brightness-110 transition-all"
          >
            Sign Up Free
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="font-asgardFat text-accent">SKILL</span> Templates
          </h1>
          <p className="text-[rgba(255,255,255,0.5)] mt-2 text-base">
            Browse proven skill templates built by the community. Sign up to fork and customize.
          </p>
        </div>

        <ExploreTemplates />
      </main>
    </div>
  );
}
