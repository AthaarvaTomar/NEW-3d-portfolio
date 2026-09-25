"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { StreamLanguage } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import {
  Sparkles,
  RefreshCw,
  ExternalLink,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  FileCode2,
  Layers,
  FileText,
  Send,
} from "lucide-react";

interface GeneratedResume {
  id: string;
  company: string;
  position: string;
  jd: string;
  latex: string;
  created_at: string;
}

interface Props {
  initialLatex: string;
}

const ITEMS_PER_PAGE = 6;

export function ResumeGenerationClient({ initialLatex }: Props) {
  // --- Section refs for smooth scrolling ---
  const formSectionRef = useRef<HTMLDivElement>(null);
  const editorSectionRef = useRef<HTMLDivElement>(null);
  const historySectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- Form state ---
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [jd, setJd] = useState("");
  const [autoCompile, setAutoCompile] = useState(true);

  // --- Editor / preview state ---
  const [latex, setLatex] = useState(initialLatex);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // --- Loading states ---
  const [generating, setGenerating] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // --- UI state ---
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  // --- History state ---
  const [history, setHistory] = useState<GeneratedResume[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Revoke old blob URL on change to avoid memory leaks
  const prevBlobUrl = useRef<string | null>(null);

  const showStatus = useCallback((msg: string, ok = true) => {
    setStatus({ msg, ok });
    setTimeout(() => setStatus(null), 5000);
  }, []);

  // ── Compile LaTeX → blob URL (no storage) ─────────────────────────────────
  const compile = useCallback(
    async (source: string): Promise<boolean> => {
      setCompiling(true);
      showStatus("Compiling LaTeX…", true);
      try {
        const res = await fetch("/api/compile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latexSource: source }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          showStatus(err.error || "Compilation failed", false);
          return false;
        }

        // Get raw PDF bytes and make a blob URL for the iframe
        const pdfBlob = await res.blob();
        const url = URL.createObjectURL(pdfBlob);

        // Revoke previous blob URL to free memory
        if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
        prevBlobUrl.current = url;

        setPdfBlobUrl(url);
        showStatus("Compiled ✓", true);
        return true;
      } catch {
        showStatus("Network error during compilation", false);
        return false;
      } finally {
        setCompiling(false);
      }
    },
    [showStatus]
  );

  const handlePublishToFrontend = async () => {
    setPublishing(true);
    showStatus("Publishing resume to portfolio…", true);
    try {
      const getRes = await fetch("/api/resumes");
      const resumes = await getRes.json().catch(() => []);
      let activeResumeId = Array.isArray(resumes) && resumes.length > 0 ? resumes[0].id : null;

      if (!activeResumeId) {
        const createRes = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Main Resume", is_public: true }),
        });
        const created = await createRes.json().catch(() => ({}));
        if (created?.id) activeResumeId = created.id;
      }

      if (!activeResumeId) {
        showStatus("Failed to find active resume", false);
        return;
      }

      const permanentPdfUrl = `/api/resumes/${activeResumeId}/pdf`;
      const updateRes = await fetch(`/api/resumes/${activeResumeId}`, {
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

      if (updateRes.ok) {
        showStatus("Published! Opening front-end preview…", true);
        window.open("/resume", "_blank");
      } else {
        const err = await updateRes.json().catch(() => ({}));
        showStatus(err.error || "Failed to publish", false);
      }
    } catch {
      showStatus("Network error while publishing", false);
    } finally {
      setPublishing(false);
    }
  };

  // ── Generate via Gemini ────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!company.trim() || !position.trim() || !jd.trim()) {
      showStatus("Please fill in Company, Position, and Job Description.", false);
      return;
    }
    setGenerating(true);
    showStatus("Generating tailored resume with AI…", true);
    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, position, jd, baseLatex: latex }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success && data.latex) {
        setLatex(data.latex);
        showStatus("Resume generated ✓", true);
        // Smoothly scroll down to the editor section
        scrollToSection(editorSectionRef);
        loadHistory();
        setCurrentPage(1);
        if (autoCompile) await compile(data.latex);
      } else {
        showStatus(data.error || "Generation failed", false);
      }
    } catch {
      showStatus("Network error during generation", false);
    } finally {
      setGenerating(false);
    }
  };

  // ── History ────────────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/generated-resumes");
      const data = await res.json();
      if (data.data) setHistory(data.data);
    } catch {
      // Silently fail — history is non-critical
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch("/api/generated-resumes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setHistory((h) => h.filter((r) => r.id !== id));
      showStatus("Resume deleted from history", true);
    } catch {
      showStatus("Failed to delete resume", false);
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewHistory = async (entry: GeneratedResume) => {
    setViewingId(entry.id);
    setLatex(entry.latex);
    setCompany(entry.company || "");
    setPosition(entry.position || "");
    setJd(entry.jd || "");
    scrollToSection(editorSectionRef);
    await compile(entry.latex);
    setViewingId(null);
  };

  // Pagination calculation
  const totalItems = history.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedHistory = history.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [history.length, totalPages, currentPage]);

  const isWorking = generating || compiling;

  return (
    <div className="flex flex-col bg-neutral-950 text-neutral-100">
      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: FORM (Full Screen Height)
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={formSectionRef}
        className="min-h-[calc(100vh-57px)] flex flex-col justify-between px-6 sm:px-10 lg:px-16 py-8 border-b border-neutral-800 bg-neutral-950 relative"
      >
        <div className="max-w-5xl w-full mx-auto flex flex-col flex-1 justify-center gap-6 py-4">
          {/* Header & Section Nav */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-neutral-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-800/50 text-violet-400">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-100">
                    AI Resume Generation
                  </h1>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Tailor your LaTeX resume for specific job descriptions using Gemini AI
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
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

              <button
                onClick={() => scrollToSection(editorSectionRef)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <span>LaTeX Editor</span>
                <ArrowDown size={13} />
              </button>
              <button
                onClick={() => scrollToSection(historySectionRef)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <span>Generations List</span>
                {history.length > 0 && (
                  <span className="bg-violet-900/60 text-violet-300 border border-violet-700/50 text-[10px] rounded-full px-1.5 font-medium">
                    {history.length}
                  </span>
                )}
                <ArrowDown size={13} />
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="gen-company"
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
                  id="gen-position"
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
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
                id="gen-jd"
                rows={9}
                placeholder="Paste the full job description, requirements, and responsibilities here…"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                className="bg-neutral-900/80 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all resize-none font-mono leading-relaxed"
              />
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
              {/* Auto-compile toggle */}
              <label
                htmlFor="auto-compile-toggle"
                className="flex items-center gap-3 cursor-pointer select-none group"
              >
                <div
                  className={`relative w-10 rounded-full transition-colors duration-200 ${
                    autoCompile ? "bg-violet-600" : "bg-neutral-700"
                  }`}
                  style={{ height: "22px" }}
                >
                  <input
                    id="auto-compile-toggle"
                    type="checkbox"
                    className="sr-only"
                    checked={autoCompile}
                    onChange={(e) => setAutoCompile(e.target.checked)}
                  />
                  <div
                    className={`absolute top-0.5 rounded-full bg-white shadow transition-transform duration-200 ${
                      autoCompile ? "translate-x-[20px]" : "translate-x-0.5"
                    }`}
                    style={{ width: "18px", height: "18px" }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">
                    Auto-compile after generation
                  </span>
                  <span className="text-xs text-neutral-500">
                    Immediately render PDF preview once generated
                  </span>
                </div>
              </label>

              <div className="flex items-center gap-3">
                <button
                  id="gen-submit-btn"
                  onClick={handleGenerate}
                  disabled={isWorking}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-violet-950/50 transition-all"
                >
                  <Sparkles size={16} className={generating ? "animate-pulse" : ""} />
                  {generating ? "Generating Tailored Resume…" : "Generate Resume"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint indicator */}
        <div className="flex justify-center pt-2 pb-1">
          <button
            onClick={() => scrollToSection(editorSectionRef)}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <span>Scroll to LaTeX Editor & Preview</span>
            <ArrowDown size={13} className="animate-bounce" />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: LATEX EDITOR & LIVE PREVIEW (Full Screen Height)
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={editorSectionRef}
        id="editor-section"
        className="h-[calc(100vh-57px)] flex flex-col border-b border-neutral-800 bg-neutral-950"
      >
        {/* Navigation Toolbar between sections */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
              <FileCode2 size={15} className="text-violet-400" />
              <span>LaTeX Editor & Live Preview</span>
            </div>

            {(position || company) && (
              <span className="text-xs text-neutral-400 hidden md:inline">
                — {[position, company].filter(Boolean).join(" @ ")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollToSection(formSectionRef)}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <ArrowUp size={12} />
              <span>Form</span>
            </button>
            <button
              onClick={() => scrollToSection(historySectionRef)}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <span>Generations</span>
              {history.length > 0 && (
                <span className="bg-violet-900/60 text-violet-300 border border-violet-700/50 text-[10px] rounded-full px-1.5 font-medium">
                  {history.length}
                </span>
              )}
              <ArrowDown size={12} />
            </button>
          </div>
        </div>

        {/* Split pane: Left = CodeMirror, Right = PDF Preview */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left: LaTeX editor */}
          <div
            className="flex flex-col border-r border-neutral-800 bg-neutral-950"
            style={{ width: "50%" }}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800/80 bg-neutral-900/50 shrink-0">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                LaTeX Source
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => compile(latex)}
                  disabled={compiling || publishing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-violet-600 hover:text-white transition-colors disabled:opacity-40"
                >
                  <RefreshCw size={12} className={compiling ? "animate-spin" : ""} />
                  {compiling ? "Compiling…" : "Compile"}
                </button>

                <button
                  onClick={handlePublishToFrontend}
                  disabled={publishing || compiling}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 hover:bg-emerald-900/50 hover:text-emerald-300 transition-colors disabled:opacity-40"
                  title="Publish this compiled LaTeX resume to the public front-end portfolio"
                >
                  <Send size={12} />
                  <span>{publishing ? "Publishing…" : "Send to front end"}</span>
                </button>
              </div>
            </div>

            {/* CodeMirror */}
            <div className="flex-1 overflow-auto min-h-0">
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

          {/* Right: PDF preview */}
          <div className="flex flex-col bg-neutral-900" style={{ width: "50%" }}>
            <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-900/50 shrink-0">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                PDF Preview
              </span>
              {pdfBlobUrl && (
                <a
                  href={pdfBlobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  Open in tab <ExternalLink size={11} />
                </a>
              )}
            </div>

            <div className="flex-1 overflow-hidden relative min-h-0">
              {compiling && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-neutral-900/80 backdrop-blur-sm gap-3">
                  <RefreshCw size={28} className="animate-spin text-violet-400" />
                  <p className="text-sm text-neutral-300 font-medium">Compiling LaTeX…</p>
                </div>
              )}
              {pdfBlobUrl ? (
                <iframe
                  src={pdfBlobUrl}
                  title="Compiled Resume Preview"
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-3 px-8 text-center">
                  <RefreshCw size={32} className="opacity-25" />
                  <p className="text-sm max-w-sm">
                    {generating
                      ? "Generating resume with AI… PDF will appear automatically."
                      : 'Fill in the form above and click "Generate", or click "Compile" to preview current LaTeX.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: PREVIOUS GENERATIONS PAGINATED LIST (Full Screen Height)
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={historySectionRef}
        id="history-section"
        className="min-h-[calc(100vh-57px)] flex flex-col justify-between px-6 sm:px-10 lg:px-16 py-8 bg-neutral-950"
      >
        <div className="max-w-6xl w-full mx-auto flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-neutral-800 pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-800/50 text-violet-400">
                  <Layers size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-neutral-100">
                      Previous Generations
                    </h2>
                    {totalItems > 0 && (
                      <span className="bg-violet-900/60 text-violet-300 border border-violet-700/50 text-xs font-semibold rounded-full px-2.5 py-0.5">
                        {totalItems} {totalItems === 1 ? "version" : "versions"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Browse and load previously generated resumes back into the editor and live preview
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadHistory()}
                disabled={historyLoading}
                title="Refresh list"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-40"
              >
                <RefreshCw size={12} className={historyLoading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => scrollToSection(editorSectionRef)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <ArrowUp size={12} />
                <span>Back to Editor</span>
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 flex flex-col">
            {historyLoading && history.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-16 text-neutral-500 gap-3">
                <RefreshCw size={24} className="animate-spin text-violet-400" />
                <p className="text-sm">Loading past generations…</p>
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-16 text-neutral-500 border border-dashed border-neutral-800 rounded-2xl gap-3 text-center px-6">
                <FileText size={32} className="opacity-30" />
                <p className="text-sm font-medium text-neutral-400">
                  No previous generations found
                </p>
                <p className="text-xs text-neutral-600 max-w-sm">
                  When you generate tailored resumes using the form above, each version will be saved here so you can revisit and recompile anytime.
                </p>
                <button
                  onClick={() => scrollToSection(formSectionRef)}
                  className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 transition-colors"
                >
                  <Sparkles size={13} className="text-violet-400" />
                  <span>Go to Form</span>
                </button>
              </div>
            ) : (
              <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-900/40 shadow-sm divide-y divide-neutral-800/80">
                {paginatedHistory.map((entry) => {
                  const isCurrent = latex === entry.latex;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between gap-4 p-4 transition-colors ${
                        isCurrent ? "bg-violet-950/20" : "hover:bg-neutral-900/60"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-sm font-semibold text-neutral-100">
                            {entry.position || "Untitled Position"}
                          </h3>
                          <span className="text-sm text-neutral-400">
                            @ <span className="text-neutral-200 font-medium">{entry.company || "Unknown"}</span>
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] text-violet-300 font-medium border border-violet-800/60 bg-violet-950/60 rounded-full px-2 py-0.5">
                              Active in Editor
                            </span>
                          )}
                        </div>

                        {entry.jd && (
                          <p className="text-xs text-neutral-400 mt-1 line-clamp-1 font-mono">
                            {entry.jd.slice(0, 140)}...
                          </p>
                        )}

                        <p className="text-[11px] text-neutral-500 mt-1.5">
                          {new Date(entry.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleViewHistory(entry)}
                          disabled={!!viewingId || compiling}
                          title="Load LaTeX into editor and preview"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-violet-600 text-neutral-200 hover:text-white transition-all disabled:opacity-40 shadow-sm"
                        >
                          {viewingId === entry.id ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <Eye size={12} />
                          )}
                          <span>{viewingId === entry.id ? "Loading…" : "Load in Editor"}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                          title="Delete generation"
                          className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/30 transition-colors disabled:opacity-40"
                        >
                          {deletingId === entry.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-4 mt-6 pt-4 border-t border-neutral-800 text-xs text-neutral-400">
              <div>
                Showing{" "}
                <span className="text-neutral-200 font-medium">{startIndex + 1}</span>{" "}
                to{" "}
                <span className="text-neutral-200 font-medium">
                  {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}
                </span>{" "}
                of <span className="text-neutral-200 font-medium">{totalItems}</span>{" "}
                generations
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 hover:text-white disabled:opacity-30 disabled:hover:bg-neutral-900 disabled:hover:text-neutral-400 transition-colors"
                >
                  <ChevronLeft size={13} />
                  <span>Prev</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
                      pageNum === safeCurrentPage
                        ? "bg-violet-600 text-white"
                        : "border border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 hover:text-white disabled:opacity-30 disabled:hover:bg-neutral-900 disabled:hover:text-neutral-400 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scroll back to top indicator */}
        <div className="flex justify-center pt-6 pb-2">
          <button
            onClick={() => scrollToSection(formSectionRef)}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <ArrowUp size={13} />
            <span>Back to Top (Form)</span>
          </button>
        </div>
      </section>
    </div>
  );
}
