// -----------------------------------------------------------------------------
// AUTH GUARD SCAFFOLD — uncomment this block once real Supabase credentials
// are in .env.local and the Supabase project is set up.
//
// import { redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";
//
// export default async function ResumePage() {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/resume/login");
//   return <ResumeDashboard />;   // replace with dashboard component
// }
//
// Until then, the existing public ResumeView renders as before.
// NOTE: /resume will become the private dashboard; the PDF viewer
//       will move to /resume/[slug] (e.g. /resume/atharv-tomar) in
//       the next phase.
// -----------------------------------------------------------------------------

import ResumeView from "./resume-view";

export const metadata = {
  title: "Résumé | Atharv Tomar",
  description:
    "Résumé of Atharv Tomar — Co-Founder & Engineer. View online or download the PDF.",
};

export default function ResumePage() {
  return <ResumeView />;
}
