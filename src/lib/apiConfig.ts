/**
 * Backend endpoints, resolved once from the build-time environment.
 *
 * Every module that talks to the API imports these instead of reading
 * process.env itself, so the fallbacks cannot drift apart. The WebSocket
 * base follows the API base (https -> wss) unless NEXT_PUBLIC_WS_URL is set,
 * so a deployment only has to configure NEXT_PUBLIC_API_URL. Vercel builds
 * refuse to start without it (next.config.ts).
 *
 * This module has no imports on purpose: apiClient and authService both use
 * it, and apiClient already imports authService.
 */

/** Used only when nothing is configured, i.e. local development. */
export const LOCAL_API_URL = "http://127.0.0.1:8000";

function withoutTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export function resolveApiBaseUrl(value: string | undefined = process.env.NEXT_PUBLIC_API_URL): string {
  return withoutTrailingSlash(value?.trim() || LOCAL_API_URL);
}

export function resolveWsBaseUrl(
  explicit: string | undefined = process.env.NEXT_PUBLIC_WS_URL,
  apiBaseUrl: string = resolveApiBaseUrl(),
): string {
  if (explicit?.trim()) return withoutTrailingSlash(explicit.trim());
  return apiBaseUrl.replace(/^http/, "ws");
}

export function resolveChatbotBaseUrl(
  explicit: string | undefined = process.env.NEXT_PUBLIC_CHATBOT_URL,
  apiBaseUrl: string = resolveApiBaseUrl(),
): string {
  return explicit?.trim() ? withoutTrailingSlash(explicit.trim()) : apiBaseUrl;
}

export const API_BASE_URL = resolveApiBaseUrl();
export const WS_BASE_URL = resolveWsBaseUrl();
export const CHATBOT_BASE_URL = resolveChatbotBaseUrl();
