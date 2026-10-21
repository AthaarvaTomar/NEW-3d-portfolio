import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * Keep-alive endpoint to prevent Supabase free tier projects from pausing
 * due to 7 days of inactivity.
 *
 * Can be triggered by:
 * 1. Vercel Cron (configured in vercel.json)
 * 2. GitHub Actions schedule (.github/workflows/supabase-keepalive.yml)
 * 3. Free external cron services (cron-job.org / uptimerobot)
 */
export async function GET(request: Request) {
  try {
    // Optional CRON_SECRET security check
    // If CRON_SECRET is set in environment variables, verify the Bearer token
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or keys) are missing.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const startTime = Date.now();

    // Query 1 row from the database to trigger active PostgreSQL & REST API usage.
    // This resets the Supabase 7-day inactivity pause timer.
    const { data, error } = await supabase
      .from("resumes")
      .select("id")
      .limit(1);

    const durationMs = Date.now() - startTime;

    if (error) {
      // If table doesn't exist yet or permissions differ, try an auth ping fallback
      const { error: healthError } = await supabase.auth.getSession();
      if (healthError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            durationMs,
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Supabase keep-alive ping successful! Activity recorded.",
      durationMs,
      rowsCount: data?.length ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
