let cachedPort: number | null = null;

const PORTS_TO_TRY = [8002, 8000, 8001, 8003, 8004, 8005, 8006, 8007, 8008, 8080];

export async function getActiveBackendPort(): Promise<number> {
  if (cachedPort) return cachedPort;

  for (const port of PORTS_TO_TRY) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/docs`, {
        method: "HEAD",
        cache: "no-store",
      });
      // FastAPI usually responds with 200 to /docs, but even 405 means the server is up
      if (res.ok || res.status === 405) {
        cachedPort = port;
        console.log(`[Proxy Scanner] Discovered backend running on port ${port}`);
        return port;
      }
    } catch (err) {
      // Port is likely closed (Connection Refused), continue scanning
    }
  }

  // Fallback if none found
  console.log(`[Proxy Scanner] Could not discover backend port. Defaulting to 8002.`);
  return 8002;
}

export function clearPortCache() {
  cachedPort = null;
}
