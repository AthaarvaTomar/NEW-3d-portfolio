import { NextResponse, type NextRequest } from "next/server";

// GET    /api/resumes/[slug] -- fetch a single resume (placeholder)
// PUT    /api/resumes/[slug] -- update a resume (placeholder)
// DELETE /api/resumes/[slug] -- delete a resume (placeholder)
// TODO: connect to Supabase + auth in next phase.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return NextResponse.json({ message: "[Scaffold] Not implemented.", slug });
}

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return NextResponse.json({ message: "[Scaffold] Not implemented.", slug });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return NextResponse.json({ message: "[Scaffold] Not implemented.", slug });
}
