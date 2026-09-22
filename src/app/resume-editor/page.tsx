import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResumeEditor } from "@/components/resume/ResumeEditor";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

const DEFAULT_STARTER_LATEX = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{top=1in, bottom=1in, left=1in, right=1in}

\\begin{document}
\\section*{Atharv Tomar - Résumé}
Co-Founder \\& Engineer

\\subsection*{Experience}
Built responsive web applications, real-time collaboration engines, and interactive portfolio systems.

\\subsection*{Skills}
TypeScript, Next.js, React, Node.js, Supabase, Tailwind CSS, Python.
\\end{document}`;

export const metadata = {
  title: "LaTeX Resume Editor | Atharv Tomar",
  description: "Live LaTeX resume editor and compiler",
};

export default async function ResumeEditorPage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/resume/login");
  }

  let resume;

  if (id) {
    const { data, error } = await supabase
      .from("resumes")
      .select("id, name, slug, draft_latex, latex, pdf_url")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      resume = data;
    }
  }

  // If no ID passed or ID not found, load the latest resume for this user
  if (!resume) {
    const { data: resumes } = await supabase
      .from("resumes")
      .select("id, name, slug, draft_latex, latex, pdf_url")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (resumes && resumes.length > 0) {
      resume = resumes[0];
    } else {
      // Auto-create a starter resume row
      const newResume = {
        user_id: user.id,
        name: "Main Resume",
        slug: "atharv-tomar",
        draft_latex: DEFAULT_STARTER_LATEX,
        latex: DEFAULT_STARTER_LATEX,
        is_public: true,
        pdf_url: "/Atharv Tomar-Resume.pdf",
      };

      const { data: created } = await supabase
        .from("resumes")
        .insert([newResume])
        .select()
        .single();

      if (created) {
        resume = created;
      }
    }
  }

  if (!resume) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-neutral-950 text-neutral-200">
        <div className="max-w-md w-full text-center space-y-4 p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
          <h1 className="text-xl font-semibold text-rose-400">Unable to load resume</h1>
          <p className="text-sm text-neutral-400">
            Could not retrieve or create a resume for your account.
          </p>
          <div className="pt-2">
            <Link
              href="/resume"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Return to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const initialDraftLatex = resume.draft_latex || resume.latex || DEFAULT_STARTER_LATEX;

  return (
    <ResumeEditor
      resumeId={resume.id}
      initialDraftLatex={initialDraftLatex}
      slug={resume.slug}
      initialPdfUrl={resume.pdf_url}
    />
  );
}
