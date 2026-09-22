"use client";

// /resume/[slug] -- Public resume URL (no authentication required)
// Examples: /resume/flutter-dev, /resume/frontend-developer
// TODO (next phase): fetch resume content from Supabase.

import { useParams } from "next/navigation";

export default function PublicResumePage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Resume</h1>
        <p className="mt-2 text-muted-foreground">
          Slug: <code>{slug}</code>
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          [Scaffold] Resume content will be loaded from Supabase in the next phase.
        </p>
      </div>
    </main>
  );
}
