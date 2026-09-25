import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { config } from "@/data/config";

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { company, position, jd, baseLatex } = body;

  if (!company || !position || !jd) {
    return NextResponse.json(
      { error: "company, position, and jd are all required" },
      { status: 400 }
    );
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const systemPrompt = `You are an expert resume writer and LaTeX specialist for ${config.author}.
Your job is to tailor an existing LaTeX resume to a specific job opportunity.

RULES:
- Return ONLY valid, complete LaTeX source code — no markdown, no code fences, no explanation.
- Keep all personal details (name, email, phone, LinkedIn, GitHub) exactly as they appear in the base resume.
- Reorder and emphasize experience bullet points that match the job description keywords.
- Add or promote relevant skills that match the JD without inventing experience.
- Keep the overall document structure and LaTeX packages identical.
- Do not truncate or omit any section — output the complete .tex file.`;

  const userPrompt = `Target Company: ${company}
Target Position: ${position}

Job Description:
${jd}

Base LaTeX Resume:
${baseLatex || "(No base resume provided — generate a clean professional resume from scratch.)"}

Generate a tailored LaTeX resume for this role. Output ONLY the raw LaTeX source.`;

  const MODELS = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.6-flash",
  ];

  const geminiBody = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
  });

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  let geminiRes: Response | null = null;
  let usedModel = MODELS[0];

  try {
    for (let i = 0; i < MODELS.length; i++) {
      usedModel = MODELS[i];
      const modelUrl = `https://generativelanguage.googleapis.com/v1beta/models/${usedModel}:generateContent?key=${geminiApiKey}`;

      try {
        geminiRes = await fetch(modelUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: geminiBody,
          signal: AbortSignal.timeout(30_000),
        });

        if (geminiRes.ok) {
          break; // Model responded successfully!
        }

        // On 503 (high demand), 429 (rate limit), or 404 (model retired), fall back to next model
        if (geminiRes.status === 503 || geminiRes.status === 429 || geminiRes.status === 404) {
          const errData = await geminiRes.json().catch(() => ({}));
          console.warn(
            `Gemini model ${usedModel} returned ${geminiRes.status} (${errData?.error?.message || "busy"}). Trying fallback…`
          );
          if (i < MODELS.length - 1) {
            await sleep(500);
            continue;
          }
        } else {
          break;
        }
      } catch (fetchErr) {
        console.warn(`Fetch error for model ${usedModel}:`, fetchErr);
        if (i < MODELS.length - 1) {
          await sleep(500);
          continue;
        }
      }
    }

    if (!geminiRes || !geminiRes.ok) {
      const status = geminiRes?.status ?? 0;
      const errText = await geminiRes?.text().catch(() => "") ?? "";
      console.error("Gemini API error:", status, errText);

      const userMsg =
        status === 503
          ? "Gemini is currently overloaded. Please try again in a few seconds."
          : status === 429
          ? "Gemini rate limit reached. Please wait a moment and try again."
          : `Gemini API error: ${status}`;

      return NextResponse.json({ error: userMsg }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    let latex: string =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!latex.trim()) {
      return NextResponse.json(
        { error: "Gemini returned an empty response." },
        { status: 502 }
      );
    }

    // Strip markdown code fences if Gemini wrapped the output anyway
    latex = latex
      .replace(/^```(?:latex|tex)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    // Persist the generation to the DB
    const { data: saved, error: saveError } = await supabase
      .from("generated_resumes")
      .insert({
        user_id: user.id,
        company,
        position,
        jd,
        latex,
      })
      .select("id")
      .single();

    if (saveError) {
      // Log but don't fail — still return the latex to the client
      console.error("Failed to save generated resume to DB:", saveError.message);
    }

    return NextResponse.json({
      success: true,
      latex,
      id: saved?.id ?? null,
    });
  } catch (err) {
    console.error("Gemini request failed:", err);
    return NextResponse.json(
      { error: "Request to Gemini timed out or failed. Please try again." },
      { status: 504 }
    );
  }
}
