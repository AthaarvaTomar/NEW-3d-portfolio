import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileText, Home } from "lucide-react";

export const metadata = {
  title: "Admin | Atharv Tomar",
  description: "Admin panel",
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

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <Home size={18} />
          </Link>
          <span className="text-neutral-700">/</span>
          <span className="text-neutral-200 font-semibold">Admin</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-neutral-400 mb-10">Manage your portfolio and resume content.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/resume-generation"
            className="group flex items-start gap-4 p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-600 hover:bg-neutral-800/50 transition-all"
          >
            <div className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-900/40 text-blue-400 group-hover:bg-blue-900/60 transition-colors">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-100 group-hover:text-white mb-1">Resume Generation</h2>
              <p className="text-sm text-neutral-500">Generate a tailored LaTeX resume for a specific company, position and job description using AI.</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
