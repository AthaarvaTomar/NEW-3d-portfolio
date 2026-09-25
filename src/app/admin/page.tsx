import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const metadata = {
  title: "Admin Dashboard | Atharv Tomar",
  description: "Resume Admin Panel",
};

export default async function AdminPage() {
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

  // Load active resume for this user from database
  const { data: resume } = await supabase
    .from("resumes")
    .select("id, slug, draft_latex, latex, pdf_url")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  const resumeId = resume?.id || "";
  const slug = resume?.slug || "resume";
  const initialLatex = resume?.draft_latex || resume?.latex || "";
  const initialPdfUrl = resume?.pdf_url || null;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <AdminDashboardClient
        resumeId={resumeId}
        initialLatex={initialLatex}
        slug={slug}
        initialPdfUrl={initialPdfUrl}
      />
    </main>
  );
}
