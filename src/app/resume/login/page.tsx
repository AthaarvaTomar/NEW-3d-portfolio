"use client";

// /resume/login -- Admin login page (public route)
// TODO (next phase): wire up the form to supabase.auth.signInWithPassword()
// and handle the redirect to /resume on success.

import React, { useState } from "react";
// import { createClient } from "@/lib/supabase/client"; // uncomment when ready
// import { useRouter } from "next/navigation";          // uncomment when ready

export default function ResumeLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // -- Uncomment once real Supabase credentials are in .env.local ----------
    // const supabase = createClient();
    // const { error } = await supabase.auth.signInWithPassword({ email, password });
    // if (error) { setError(error.message); setLoading(false); return; }
    // router.push("/resume"); router.refresh();
    // -----------------------------------------------------------------------

    setError("[Scaffold] Supabase credentials not yet configured.");
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSignIn} className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-xl font-semibold">Resume Admin Login</h1>
        {error && (
          <p role="alert" className="text-sm text-red-500">{error}</p>
        )}
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border px-3 py-2"
          />
        </label>
        <button
          id="login-submit"
          type="submit"
          disabled={loading}
          className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {loading ? "Signing in\u2026" : "Sign In"}
        </button>
      </form>
    </main>
  );
}
