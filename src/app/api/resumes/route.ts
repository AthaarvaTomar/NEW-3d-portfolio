import { NextResponse } from "next/server";

// GET /api/resumes  -- list resumes (placeholder)
// POST /api/resumes -- create a resume (placeholder)
// TODO: connect to Supabase + auth in next phase.

export async function GET() {
  return NextResponse.json(
    { message: "[Scaffold] Resume list -- not yet implemented." },
    { status: 200 }
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "[Scaffold] Resume create -- not yet implemented." },
    { status: 200 }
  );
}
