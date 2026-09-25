"use client";

import { useState } from "react";
import { PenLine, Sparkles, Home } from "lucide-react";
import { ResumeEditor } from "@/components/resume/ResumeEditor";
import { AiTailorPanel } from "@/components/admin/AiTailorPanel";
import Link from "next/link";

type Mode = "choose" | "manual" | "ai";

interface Props {
  resumeId: string;
  initialLatex: string;
  slug: string;
  initialPdfUrl?: string | null;
}

export function AdminDashboardClient({
  resumeId,
  initialLatex,
  slug,
  initialPdfUrl,
}: Props) {
  const [mode, setMode] = useState<Mode>("choose");
  const [seedLatex, setSeedLatex] = useState<string | null>(null);

  if (mode === "choose") {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center p-6 relative">
        {/* Top left breadcrumb */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <Link
            href="/"
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <Home size={18} />
          </Link>
          <span className="text-neutral-700">/</span>
          <span className="text-neutral-200 font-semibold">Admin</span>
        </div>

        <div className="max-w-xl w-full text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Resume Dashboard</h1>
          <p className="text-neutral-400 text-sm">
            Select an option to begin. AI-generated resumes seamlessly load into the Manual Editor for compilation and review.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-2xl">
          <button
            type="button"
            onClick={() => setMode("manual")}
            className="group flex flex-col items-center text-center gap-4 p-8 border border-neutral-800 bg-neutral-900/60 rounded-2xl hover:bg-neutral-800/80 hover:border-neutral-700 transition-all w-full sm:w-72 cursor-pointer shadow-lg"
            id="menu-manual-btn"
          >
            <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-900/40 text-blue-400 group-hover:scale-110 transition-transform">
              <PenLine size={32} />
            </div>
            <div>
              <span className="font-semibold text-lg text-white block mb-1">Manual Editor</span>
              <span className="text-xs text-neutral-400 leading-relaxed block">
                Edit LaTeX source code directly with live side-by-side PDF preview.
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode("ai")}
            className="group flex flex-col items-center text-center gap-4 p-8 border border-neutral-800 bg-neutral-900/60 rounded-2xl hover:bg-neutral-800/80 hover:border-neutral-700 transition-all w-full sm:w-72 cursor-pointer shadow-lg"
            id="menu-ai-btn"
          >
            <div className="p-4 rounded-xl bg-violet-950/60 border border-violet-900/40 text-violet-400 group-hover:scale-110 transition-transform">
              <Sparkles size={32} />
            </div>
            <div>
              <span className="font-semibold text-lg text-white block mb-1">AI Tailor</span>
              <span className="text-xs text-neutral-400 leading-relaxed block">
                Generate a tailored LaTeX resume from a job description using Gemini AI.
              </span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (mode === "ai") {
    return (
      <AiTailorPanel
        initialLatex={seedLatex ?? initialLatex}
        onGenerated={(latex) => {
          setSeedLatex(latex);
          setMode("manual"); // AI output always lands in the same editor for review
        }}
        onBack={() => setMode("choose")}
      />
    );
  }

  // mode === "manual"
  return (
    <ResumeEditor
      resumeId={resumeId}
      initialDraftLatex={seedLatex ?? initialLatex}
      slug={slug}
      initialPdfUrl={initialPdfUrl}
      onBack={() => setMode("choose")}
    />
  );
}
