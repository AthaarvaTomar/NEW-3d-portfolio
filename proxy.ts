import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const cleanPath = pathname.replace(/\/+$/, "") || "/";

  // Protected routes:
  // - /resume-editor   (private editor - STRICTLY SEALED WITH AUTHENTICATION)
  // - /resume-editor/* (private editor sub-routes)
  //
  // Public routes:
  // - /resume          (public front-end resume preview in PDF format)
  // - /resume/login    (admin login)
  // - /resume/[slug]   (public slug routes)
  const isProtected =
    cleanPath === "/resume-editor" ||
    cleanPath.startsWith("/resume-editor/");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fallback if environment variables are not yet loaded:
  // ensure protected editor routes redirect to login, while public routes remain accessible.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtected) {
      const loginUrl = new URL("/resume/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Seal the editor strictly behind authentication
  if (isProtected && !user) {
    const loginUrl = new URL("/resume/login", request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/resume-editor",
    "/resume-editor/:path*",
  ],
};
