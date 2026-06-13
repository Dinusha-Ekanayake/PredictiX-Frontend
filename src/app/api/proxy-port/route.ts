import { NextResponse } from "next/server";
import { getActiveBackendPort } from "@/lib/backendScanner";

export async function GET() {
  const port = await getActiveBackendPort();
  return NextResponse.json({ port });
}
