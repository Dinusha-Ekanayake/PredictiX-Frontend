import { NextRequest, NextResponse } from "next/server";
import { getActiveBackendPort, clearPortCache } from "@/lib/backendScanner";

async function handleRequest(req: NextRequest, props: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  const port = await getActiveBackendPort();

  // Next.js 15+ has `params` as a promise, earlier versions it is an object
  // We handle both gracefully to prevent build issues
  const params = await props.params;
  let path = params.path.join("/");
  if (req.nextUrl.pathname.endsWith("/")) {
    path += "/";
  }
  const search = req.nextUrl.search;
  
  const backendUrl = `http://127.0.0.1:${port}/${path}${search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");

  const body = req.method !== "GET" && req.method !== "HEAD" ? await req.blob() : undefined;

  try {
    const response = await fetch(backendUrl, {
      method: req.method,
      headers,
      body,
    });

    const resHeaders = new Headers(response.headers);
    resHeaders.delete("content-encoding"); // Let Next.js handle encoding

    return new NextResponse(response.body, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (error: any) {
    console.error("[Proxy] Error connecting to backend:", error.message);
    // Clear cache if the port suddenly closed so next request scans again
    clearPortCache();
    return new NextResponse(JSON.stringify({ error: "Backend unreachable or connection refused" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;
