"use client";

import { useState } from "react";
import { Sparkles, ArrowLeft, Layers, RefreshCw, FileText } from "lucide-react";

interface AiTailorPanelProps {
  initialLatex?: string;
  onGenerated?: (latex: string) => void;
  onBack?: () => void;
}

export function AiTailorPanel({
  initialLatex = "",
  onGenerated,
  onBack,
}: AiTailorPanelProps) {
  // Form state
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [jd, setJd] = useState("");
  const [baseLatex, setBaseLatex] = useState(initialLatex);

  // Loading & status
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  const showStatus = (msg: string, ok = true) => {
    setStatus({ msg, ok });
    setTimeout(() => setStatus(null), 5000);
  };

  const handleGenerate = async () => {
    if (!company.trim() || !position.trim() || !jd.trim()) {
      showStatus("Please fill in Company Name, Position, and Job Description.", false);
      return;
    }

    setGenerating(true);
    showStatus("Generating tailored LaTeX resume with Gemini AI…", true);

    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          position,
          jd,
          baseLatex: baseLatex || initialLatex,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (data.success && data.latex) {
        showStatus("Resume generated successfully! Opening in editor…", true);
        if (onGenerated) {
          onGenerated(data.latex);
        }
      } else {
        showStatus(data.error || "Generation failed. Please try again.", false);
      }
    } catch {
      showStatus("Network error during generation", false);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between px-6 sm:px-10 lg:px-16 py-8 relative">
      <div className="max-w-4xl w-full mx-auto flex flex-col flex-1 justify-center gap-6 py-4">
        {/* Top Header / Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                id="ai-panel-back-btn"
              >
                <ArrowLeft size={14} />
                <span>Back to menu</span>
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-800/50 text-violet-400">
                <Sparkles size={18} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-100">AI Resume Tailor</h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Generate a customized LaTeX resume tailored to any job description using Gemini AI
                </p>
              </div>
            </div>
          </div>

          {status && (
            <span
              className={`text-xs px-3 py-1 rounded-full border ${
                status.ok
                  ? "text-emerald-400 border-emerald-900/50 bg-emerald-950/40"
                  : "text-red-400 border-red-900/50 bg-red-950/40"
              }`}
            >
              {status.msg}
            </span>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Target Company <span className="text-red-400">*</span>
              </label>
              <input
                id="ai-company"
                type="text"
                placeholder="e.g. Google, Stripe, OpenAI"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="bg-neutral-900/80 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Position / Role <span className="text-red-400">*</span>
              </label>
              <input
                id="ai-position"
                type="text"
                placeholder="e.g. Senior Full-Stack Engineer"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="bg-neutral-900/80 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Job Description <span className="text-red-400">*</span>
              </label>
              <span className="text-[11px] text-neutral-500 font-mono">
                {jd.length > 0 ? `${jd.length} chars` : "Paste full JD"}
              </span>
            </div>
            <textarea
              id="ai-jd"
              rows={8}
              placeholder="Paste the target job description, key requirements, and desired qualifications here…"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="bg-neutral-900/80 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all resize-none font-mono leading-relaxed"
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
            <div className="text-xs text-neutral-500 flex items-center gap-1.5">
              <FileText size={14} className="text-neutral-400" />
              <span>Output will immediately load in the Manual LaTeX Editor for compilation & preview.</span>
            </div>

            <button
              id="ai-generate-btn"
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-violet-950/50 transition-all cursor-pointer"
            >
              <Sparkles size={16} className={generating ? "animate-pulse" : ""} />
              {generating ? "Generating Tailored Resume…" : "Generate Resume"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
