// Wraps /resume/[slug] to prevent static prerendering.
// The root layout preloader uses usePathname() which conflicts with
// static generation under cacheComponents. This layout disables it.

import { Suspense } from "react";

export default function ResumeSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
