import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Max timeout for this route
export const maxDuration = 60;

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
  const { latexSource } = body;

  if (typeof latexSource !== "string" || latexSource.trim() === "") {
    return NextResponse.json({ error: "latexSource is required" }, { status: 400 });
  }

  // Build a multipart form with the .tex source file
  const formData = new FormData();
  const texBlob = new Blob([latexSource], { type: "application/x-tex" });
  formData.append("file", texBlob, "resume.tex");

  try {
    // POST to LaTeX.Online — returns the compiled PDF binary directly
    const latexRes = await fetch(
      "https://latex.ytotech.com/builds/sync?compiler=pdflatex",
      {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(45_000),
      }
    );

    if (!latexRes.ok) {
      const errText = await latexRes.text().catch(() => "");
      console.error("LaTeX.Online error:", latexRes.status, errText);
      return NextResponse.json(
        { error: `LaTeX compilation failed (HTTP ${latexRes.status}). Check your LaTeX source for errors.` },
        { status: 422 }
      );
    }

    // Stream the PDF bytes back directly — no storage involved
    const pdfBytes = await latexRes.arrayBuffer();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=\"resume.pdf\"",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Compilation pipeline error:", err);
    return NextResponse.json(
      { error: "Compilation timed out or a network error occurred. Please try again." },
      { status: 504 }
    );
  }
}
