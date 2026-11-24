import type { NextConfig } from "next";
import path from "path";

function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * On Vercel, refuse to build without a usable backend URL. NEXT_PUBLIC_*
 * values are inlined at build time, so a missing one would otherwise ship a
 * bundle that silently calls http://127.0.0.1:8000 on every visitor's machine.
 */
function assertDeploymentConfig(): void {
  if (process.env.VERCEL !== "1") return;
  const api = process.env.NEXT_PUBLIC_API_URL;
  const origin = originOf(api);
  if (!origin) {
    throw new Error("NEXT_PUBLIC_API_URL must be set to the backend URL (e.g. https://api.example.com) in the Vercel project settings.");
  }
  if (process.env.VERCEL_ENV === "production" && !origin.startsWith("https://")) {
    throw new Error(`NEXT_PUBLIC_API_URL must use https in production (got ${origin}); browsers block mixed content.`);
  }
}

assertDeploymentConfig();

const isDev = process.env.NODE_ENV !== "production";
const apiOrigin = originOf(process.env.NEXT_PUBLIC_API_URL) ?? "http://127.0.0.1:8000";
const wsOrigin = originOf(process.env.NEXT_PUBLIC_WS_URL);
const supabaseOrigin = originOf(process.env.NEXT_PUBLIC_SUPABASE_URL);

const connectSources = [
  "'self'",
  apiOrigin,
  apiOrigin.replace(/^http/, "ws"),
  wsOrigin,
  supabaseOrigin,
  supabaseOrigin?.replace(/^https/, "wss"),
].filter(Boolean);

// Sent in report-only mode: the browser logs anything the policy would block
// without blocking it. Once the console shows no reports across the app it can
// be switched to the enforcing Content-Security-Policy header.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  `connect-src ${connectSources.join(" ")}`,
  "worker-src 'self' blob:",
  "frame-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,

  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.56.1",
  ],

  turbopack: {
    root: path.join(__dirname),
  },

  // Remote images come from this project's Supabase Storage (asset photos,
  // avatars) and Google profile photos. Listing the hosts stops the image optimizer being used to
  // fetch arbitrary URLs. data: avatars do not go through the optimizer.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: supabaseOrigin ? new URL(supabaseOrigin).hostname : "*.supabase.co" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },

  // Do not advertise the framework in an X-Powered-By header.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;