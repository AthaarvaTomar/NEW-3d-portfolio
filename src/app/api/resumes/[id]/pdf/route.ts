import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const maxDuration = 60;

const BUCKET_NAME = process.env.RESUME_STORAGE_BUCKET || "resume-pdfs";

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  let resume: { id: string; latex: string | null; draft_latex: string | null; is_public: boolean | null; user_id: string | null } | null = null;

  if (id === "public" || id === "active") {
    const { data } = await supabase
      .from("resumes")
      .select("id, latex, draft_latex, is_public, user_id")
      .eq("is_public", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    resume = data;
  } else {
    const { data } = await supabase
      .from("resumes")
      .select("id, latex, draft_latex, is_public, user_id")
      .eq("id", id)
      .maybeSingle();

    resume = data;
  }

  // If no resume row was found by specific ID, fallback to active public resume
  if (!resume && id !== "public" && id !== "active") {
    const { data } = await supabase
      .from("resumes")
      .select("id, latex, draft_latex, is_public, user_id")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    resume = data;
  }

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // Security check: if resume is not public, verify owner authentication
  if (!resume.is_public) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== resume.user_id) {
      return NextResponse.json({ error: "Unauthorized access to private resume" }, { status: 401 });
    }
  }

  const targetId = resume.id;

  // 1. Attempt to serve from Supabase Storage bucket ('resume-pdfs' or fallback 'resumes')
  for (const bucket of [BUCKET_NAME, "resumes"]) {
    try {
      const { data: storageFile, error: storageErr } = await supabase.storage
        .from(bucket)
        .download(`${targetId}.pdf`);

      if (!storageErr && storageFile) {
        const buffer = await storageFile.arrayBuffer();
        return new Response(buffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'inline; filename="resume.pdf"',
            "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      }
    } catch {
      // Try next bucket name
    }
  }

  // 2. Compile LaTeX source on the fly
  const latexSource = resume.latex || resume.draft_latex;

  if (!latexSource || typeof latexSource !== "string" || !latexSource.trim()) {
    return NextResponse.json(
      { error: "No LaTeX content found for this resume" },
      { status: 400 }
    );
  }

  const formData = new FormData();
  const texBlob = new Blob([latexSource], { type: "application/x-tex" });
  formData.append("file", texBlob, "resume.tex");

  try {
    const latexRes = await fetch(
      "https://latex.ytotech.com/builds/sync?compiler=pdflatex",
      {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(45_000),
      }
    );

    if (!latexRes.ok) {
      return NextResponse.json(
        { error: "LaTeX compilation failed" },
        { status: 422 }
      );
    }

    const pdfBytes = await latexRes.arrayBuffer();

    // Try background caching in Supabase Storage if storage bucket exists
    for (const bucket of [BUCKET_NAME, "resumes"]) {
      try {
        const { error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(`${targetId}.pdf`, pdfBytes, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (!uploadErr) break;
      } catch {
        // Ignore background storage caching errors
      }
    }

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="resume.pdf"',
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    console.error("PDF generation pipeline error:", err);
    return NextResponse.json(
      { error: "Failed to render resume PDF" },
      { status: 500 }
    );
  }
}
