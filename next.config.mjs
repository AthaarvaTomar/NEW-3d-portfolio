import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  turbopack: {
    // Prevent Turbopack from picking a parent lockfile directory as the workspace root.
    root: __dirname,
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  async headers() {
    const securityHeaders = {
      source: "/(.*)",
      headers: [
        // SAMEORIGIN (not DENY) so the resume page can embed its own PDF;
        // still blocks other sites from framing us (clickjacking protection).
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    };

    // Long-lived caching is for production only. Applying immutable cache to
    // /_next/static in dev causes stale Turbopack chunks after dependency swaps.
    if (process.env.NODE_ENV === "development") {
      return [securityHeaders];
    }

    return [
      securityHeaders,
      {
        source: "/assets/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
