"use client";

// SignOutButton -- prepared for supabase.auth.signOut()
// TODO: uncomment Supabase/router calls in next phase.

import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  async function handleSignOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign-out error:", err);
    }
    window.location.href = "/resume/login";
  }

  return (
    <button
      id="sign-out-button"
      type="button"
      onClick={handleSignOut}
      className="rounded px-4 py-2 text-sm font-medium"
    >
      Sign Out
    </button>
  );
}
