"use client";

// SignOutButton -- prepared for supabase.auth.signOut()
// TODO: uncomment Supabase/router calls in next phase.

// import { createClient } from "@/lib/supabase/client"; // uncomment when ready
// import { useRouter } from "next/navigation";          // uncomment when ready

export default function SignOutButton() {
  async function handleSignOut() {
    // const supabase = createClient();
    // await supabase.auth.signOut();
    // window.location.href = "/resume/login";
    console.warn("[Scaffold] Sign-out not yet wired up.");
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
