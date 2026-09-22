import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { resumeId, latexSource, target = "draft" } = body;

  if (!resumeId || typeof resumeId !== "string") {
    return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
  }

  if (typeof latexSource !== "string") {
    return NextResponse.json({ error: "latexSource is required" }, { status: 400 });
  }

  // Verify ownership of the resume
  const { data: resume, error: fetchError } = await supabase
    .from("resumes")
    .select("id, user_id, slug, pdf_url")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // Determine PDF URL:
  // If an external compiler endpoint or custom PDF URL is set, we can use it.
  // By default, fallback to the pre-compiled public PDF or existing pdf_url.
  const fallbackPdfUrl = process.env.DEFAULT_RESUME_PDF_URL || "/Atharv Tomar-Resume.pdf";
  const pdfUrl = resume.pdf_url || fallbackPdfUrl;

  // Prepare database updates according to compilation target
  const updates: Record<string, unknown> = {
    pdf_url: pdfUrl,
    updated_at: new Date().toISOString(),
  };

  if (target === "publish") {
    updates.latex = latexSource;
    updates.draft_latex = latexSource;
    updates.is_public = true;
  } else {
    // Draft compilation
    updates.draft_latex = latexSource;
  }

  const { error: updateError } = await supabase
    .from("resumes")
    .update(updates)
    .eq("id", resumeId)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    pdfUrl,
    target,
  });
}
