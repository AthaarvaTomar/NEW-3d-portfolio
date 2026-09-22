"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function ResumeLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Instantiate lazily so this only runs on the client — never during SSR
  // prerendering where NEXT_PUBLIC_* vars may be absent (Vercel build phase).
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createBrowserClient(url, key);
  }, []);

  // Always sign out any existing session when this page loads.
  // This ensures credentials are required every single time.
  useEffect(() => {
    supabase?.auth.signOut().catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    window.location.href = "/resume-editor";
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-background">
      <form onSubmit={handleSignIn} className="flex w-full max-w-sm flex-col gap-4 p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Resume Admin Login</h1>
          <a href="/" className="text-xs text-muted-foreground hover:text-foreground">
            Home &rarr;
          </a>
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
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
          disabled={loading || !supabase}
          className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
