"use client";

import { useState, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { StreamLanguage } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import {
  Copy,
  Download,
  RefreshCw,
  Save as SaveIcon,
  Send,
  ArrowLeft,
  Check,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import SignOutButton from "@/components/resume/SignOutButton";

interface Props {
  resumeId: string;
  initialDraftLatex: string;
  slug: string;
  initialPdfUrl?: string | null;
}

export function ResumeEditor({
  resumeId,
  initialDraftLatex,
  slug,
  initialPdfUrl,
}: Props) {
  const [latex, setLatex] = useState(initialDraftLatex);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const prevBlobUrl = useRef<string | null>(null);
  // Sanitize fallback URL so blob URLs are replaced by permanent API route
  const sanitizedFallback =
    initialPdfUrl && !initialPdfUrl.startsWith("blob:")
      ? initialPdfUrl
      : `/api/resumes/${resumeId}/pdf`;
  const [staticFallbackUrl] = useState<string | null>(sanitizedFallback);
  const [saving, setSaving] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const slugLink = `${typeof window !== "undefined" ? window.location.origin : ""}/resume`;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft_latex: latex }),
      });
      if (res.ok) {
        showStatus("Draft saved successfully");
      } else {
        const err = await res.json().catch(() => ({}));
        showStatus(err.error || "Failed to save draft");
      }
    } catch (err) {
      console.error("Save failed:", err);
      showStatus("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleRecompile = async () => {
    setCompiling(true);
    showStatus("Compiling LaTeX…");
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latexSource: latex }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showStatus(err.error || "Compilation failed");
        return;
      }
      // Get raw PDF bytes and make a blob URL — no storage required
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
      prevBlobUrl.current = url;
      setPdfUrl(url);
      showStatus("Compiled successfully ✓");
    } catch (err) {
      console.error("Recompile failed:", err);
      showStatus("Network error during compilation");
    } finally {
      setCompiling(false);
    }
  };

  const handleSendToFrontend = async () => {
    setPublishing(true);
    try {
      const permanentPdfUrl = `/api/resumes/${resumeId}/pdf`;
      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latex,
          draft_latex: latex,
          pdf_url: permanentPdfUrl,
          is_public: true,
          promoteDraft: true,
        }),
      });
      if (res.ok) {
        showStatus("Published! Opening front-end preview...");
        window.open("/resume", "_blank");
      } else {
        const err = await res.json().catch(() => ({}));
        showStatus(err.error || "Failed to publish");
      }
    } catch (err) {
      console.error("Publish failed:", err);
      showStatus("Network error while publishing");
    } finally {
      setPublishing(false);
    }
  };

  const handleDownload = () => {
    const downloadTarget = pdfUrl || staticFallbackUrl || `/api/resumes/${resumeId}/pdf`;
    const a = document.createElement("a");
    a.href = downloadTarget;
    a.download = `${slug || "resume"}.pdf`;
    a.target = "_blank";
    a.click();
  };

  const handleCopySlug = async () => {
    try {
      await navigator.clipboard.writeText(slugLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100 antialiased">
      {/* Toolbar */}
      <header className="flex flex-wrap items-center gap-2 p-3 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur z-10">
        <Link
          href="/"
          className="btn text-neutral-400 hover:text-white mr-1"
          title="Back to Home Page"
          id="editor-home-btn"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Home</span>
        </Link>

        <span className="font-semibold text-sm mr-2 text-neutral-200 hidden md:inline">
          {slug}
        </span>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn"
          id="editor-save-btn"
        >
          <SaveIcon size={16} />
          <span>{saving ? "Saving..." : "Save"}</span>
        </button>

        <button
          onClick={handleRecompile}
          disabled={compiling}
          className="btn"
          id="editor-recompile-btn"
        >
          <RefreshCw size={16} className={compiling ? "animate-spin" : ""} />
          <span>{compiling ? "Compiling..." : "Recompile"}</span>
        </button>

        <button
          onClick={handleSendToFrontend}
          disabled={publishing}
          className="btn text-emerald-400 hover:text-emerald-300 border-emerald-900/60 hover:bg-emerald-950/40"
          id="editor-publish-btn"
        >
          <Send size={16} />
          <span>{publishing ? "Publishing..." : "Send to front end"}</span>
        </button>

        {statusMessage && (
          <span className="text-xs text-neutral-400 px-2 py-1 rounded bg-neutral-800 border border-neutral-700 animate-in fade-in">
            {statusMessage}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={!pdfUrl}
            className="btn"
            id="editor-download-btn"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Download</span>
          </button>
          <SignOutButton />
        </div>
      </header>

      {/* Editor + Preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* CodeMirror LaTeX Editor */}
        <div className="w-1/2 h-full overflow-hidden border-r border-neutral-800 flex flex-col bg-neutral-950">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500 px-3 py-1.5 border-b border-neutral-800/80 bg-neutral-900/50 flex justify-between">
            <span>LaTeX Source (Draft)</span>
            <span>UTF-8</span>
          </div>
          <div className="flex-1 overflow-auto">
            <CodeMirror
              value={latex}
              height="100%"
              extensions={[StreamLanguage.define(stex)]}
              onChange={(v) => setLatex(v)}
              theme="dark"
              className="text-sm font-mono h-full"
            />
          </div>
        </div>

        {/* Live PDF Preview */}
        <div className="w-1/2 h-full overflow-hidden bg-neutral-900 flex flex-col">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500 px-3 py-1.5 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
            <span>PDF Preview</span>
            {(pdfUrl || staticFallbackUrl) && (
              <a
                href={pdfUrl || staticFallbackUrl!}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
              >
                Open in tab <ExternalLink size={12} />
              </a>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            {pdfUrl || staticFallbackUrl ? (
              <iframe
                src={pdfUrl || staticFallbackUrl!}
                title="Compiled Resume Preview"
                className="w-full h-full border-0"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2">
                <RefreshCw size={28} className="opacity-40" />
                <p className="text-sm">Click Recompile to preview compiled PDF</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slug link footer */}
      <footer className="flex items-center gap-2 p-3 border-t border-neutral-800 bg-neutral-900/60 backdrop-blur">
        <span className="text-xs text-neutral-400 shrink-0 font-medium">
          Public URL:
        </span>
        <input
          readOnly
          value={slugLink}
          className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-neutral-300 font-mono focus:outline-none focus:border-neutral-700"
        />
        <button
          onClick={handleCopySlug}
          className="btn shrink-0"
          id="editor-copy-slug-btn"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
        <a
          href="/resume"
          target="_blank"
          rel="noreferrer"
          className="btn shrink-0 text-emerald-400 hover:text-emerald-300"
          title="Open Public Front-End Preview"
          id="editor-visit-frontend-btn"
        >
          <ExternalLink size={14} />
          <span className="hidden sm:inline">View on Front End</span>
        </a>
      </footer>
    </div>
  );
}
