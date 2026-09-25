import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResumeGenerationClient } from "@/components/admin/ResumeGenerationClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Resume Generation | Admin",
  description: "Generate a tailored LaTeX resume using AI",
};

export default async function ResumeGenerationPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/resume/login");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/resume/login");
  }

  // Load the user's latest base resume LaTeX to pre-populate the editor
  const { data: resume } = await supabase
    .from("resumes")
    .select("draft_latex, latex")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  const initialLatex = resume?.draft_latex || resume?.latex || "";

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur sticky top-0 z-20">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} />
          Admin
        </Link>
        <span className="text-neutral-700">/</span>
        <span className="text-neutral-200 font-semibold text-sm">Resume Generation</span>
      </header>

      <ResumeGenerationClient initialLatex={initialLatex} />
    </main>
  );
}
