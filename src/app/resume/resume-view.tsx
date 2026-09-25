"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Download, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResumeDoodle from "./resume-doodle";

// Default PDF fallback
const DEFAULT_RESUME_PATH = "/Atharv%20Tomar-Resume.pdf?v=2";

interface ResumeViewProps {
  pdfUrl?: string;
}

export default function ResumeView({ pdfUrl }: ResumeViewProps = {}) {
  const resumePath = pdfUrl || DEFAULT_RESUME_PATH;

  return (
    <div className="flex min-h-screen flex-col font-sans bg-background text-foreground">
      {/* Hide the global nav on mobile, only while this page is mounted */}
      <style
        dangerouslySetInnerHTML={{
          __html:
            "@media (max-width: 767px){ header { display: none !important; } }",
        }}
      />

      {/* Top bar: back (left) + edit / download (right) */}
      <div className="mx-auto w-full max-w-4xl shrink-0 px-4 pt-16 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 flex items-center justify-between gap-4"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to portfolio
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="/resume/login"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors px-2 py-1 rounded-md hover:bg-neutral-800/10"
              title="Admin — requires password"
            >
              <Lock className="h-3 w-3" />
              <span>Admin</span>
            </a>
            <Button asChild>
              <a
                href={resumePath}
                download="Atharv_Tomar_Resume.pdf"
                className="flex gap-2 text-sm transition-colors hover:text-foreground"
              >
                <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                Download PDF
              </a>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* PDF viewer — top padding increased so resume sits in the middle of the dark background */}
      <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-2 pb-6 md:items-start md:px-4 md:pb-24">
        {/* opacity-only animation: a transformed ancestor would trap the fixed doodle FAB */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="aspect-[210/297] w-full overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800/80 shadow-xl pt-12 md:pt-16 px-2 sm:px-4 pb-6"
        >
          <ResumeDoodle
            src={`${resumePath}#toolbar=0&navpanes=0&view=FitH`}
            title="Atharv Tomar — Résumé"
          />
        </motion.div>
      </div>
    </div>
  );
}

