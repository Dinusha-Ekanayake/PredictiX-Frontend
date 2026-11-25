import { NextResponse } from "next/server";
import { getActiveBackendPort } from "@/lib/backendScanner";

// Local development helper only. In a production build it does not exist.
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }
  const port = await getActiveBackendPort();
  return NextResponse.json({ port });
}
