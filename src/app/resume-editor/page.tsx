// /resume-editor -- Private LaTeX resume editor (requires authentication)
// Protected by middleware.ts. TODO: implement full editor UI in next phase.

export default function ResumeEditorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Resume Editor</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          [Scaffold] The LaTeX resume editor will be implemented in the next phase.
        </p>
      </div>
    </main>
  );
}
