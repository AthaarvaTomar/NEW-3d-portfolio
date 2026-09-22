import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getSupabaseServerClient() {
  return createClient();
}

const DEFAULT_STARTER_LATEX = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{top=1in, bottom=1in, left=1in, right=1in}

\\begin{document}
\\section*{New Resume}
Your resume content goes here.
\\end{document}`;

// GET: List all resumes for the logged-in user
export async function GET() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("resumes")
    .select("id, name, slug, target_company, is_template, is_public, pdf_url, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST: Create a new resume or clone from a template
export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, target_company, slug, is_template, template_id } = body;

  if (!name) {
    return NextResponse.json({ error: "Resume name is required" }, { status: 400 });
  }

  let seedLatex = DEFAULT_STARTER_LATEX;

  // If cloning from an existing template row
  if (template_id) {
    const { data: templateRow } = await supabase
      .from("resumes")
      .select("latex")
      .eq("id", template_id)
      .single();

    if (templateRow?.latex) {
      seedLatex = templateRow.latex;
    }
  }

  const generatedSlug =
    slug ||
    `${name}-${target_company || "general"}-${Date.now().toString().slice(-4)}`
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const newResume = {
    user_id: user.id,
    name,
    slug: generatedSlug,
    target_company: target_company || null,
    is_template: Boolean(is_template),
    is_public: false,
    latex: seedLatex,
    draft_latex: seedLatex,
  };

  const { data, error } = await supabase
    .from("resumes")
    .insert([newResume])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
