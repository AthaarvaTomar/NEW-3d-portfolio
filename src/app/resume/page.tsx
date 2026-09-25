import { createClient } from "@/lib/supabase/server";
import ResumeView from "./resume-view";

export const metadata = {
  title: "Résumé | Atharv Tomar",
  description:
    "Résumé of Atharv Tomar — Co-Founder & Engineer. View online or download the PDF.",
};

export default async function ResumePage() {
  let pdfUrl = "/Atharv%20Tomar-Resume.pdf?v=2";

  try {
    const supabase = await createClient();
    const { data: resume } = await supabase
      .from("resumes")
      .select("id, pdf_url, is_public")
      .eq("is_public", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (resume) {
      if (resume.pdf_url && !resume.pdf_url.startsWith("blob:")) {
        pdfUrl = resume.pdf_url;
      } else if (resume.id) {
        pdfUrl = `/api/resumes/${resume.id}/pdf`;
      }
    }
  } catch {
    // Fallback to default PDF
  }

  return <ResumeView pdfUrl={pdfUrl} />;
}
