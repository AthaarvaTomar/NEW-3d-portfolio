import { type NextRequest, NextResponse } from "next/server";
// import { createServerClient } from "@supabase/ssr"; // uncomment when ready

/**
 * Middleware -- Scaffold / genuine no-op stub
 *
 * All redirect/auth logic is commented out.
 * Safe against empty NEXT_PUBLIC_SUPABASE_URL -- no network calls.
 *
 * TO ACTIVATE (next phase):
 * 1. Fill in NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 2. Uncomment the createServerClient block and auth-check block below
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // -- Uncomment once real Supabase credentials are in .env.local ----------
  //
  // const supabase = createServerClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //   {
  //     cookies: {
  //       getAll() { return request.cookies.getAll(); },
  //       setAll(cookiesToSet) {
  //         cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
  //         cookiesToSet.forEach(({ name, value, options }) =>
  //           response.cookies.set(name, value, options)
  //         );
  //       },
  //     },
  //   }
  // );
  //
  // // Refresh session and protect private routes
  // const { data: { user } } = await supabase.auth.getUser();
  // const { pathname } = request.nextUrl;
  // const isPrivate = pathname === "/resume" || pathname.startsWith("/resume-editor");
  // if (isPrivate && !user) {
  //   const loginUrl = request.nextUrl.clone();
  //   loginUrl.pathname = "/resume/login";
  //   return NextResponse.redirect(loginUrl);
  // }
  //
  // -----------------------------------------------------------------------

  return response;
}

export const config = {
  matcher: [
    // /resume          (private dashboard)
    // /resume-editor   (private editor)
    // /resume-editor/* (any sub-path)
    // Excluded (public): /resume/login, /resume/[slug], all portfolio routes
    "/resume",
    "/resume-editor",
    "/resume-editor/:path*",
  ],
};
