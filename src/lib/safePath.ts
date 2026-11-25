/**
 * True for a same-site path such as "/admin/tickets?id=1".
 *
 * Rejects "//host" (protocol-relative), absolute URLs, "javascript:" and
 * backslash tricks, so a server-supplied link can only move within the app.
 */
export function isInAppPath(path: unknown): path is string {
  return typeof path === "string" && /^\/(?!\/)[^\s\\]*$/.test(path.trim());
}

/** A chatbot button the browser may act on: an in-app path or a "copy:" action. */
export function isSafeActionButton(btn: unknown): btn is { label: string; path: string } {
  if (!btn || typeof btn !== "object") return false;
  const { label, path } = btn as { label?: unknown; path?: unknown };
  if (typeof label !== "string" || !label.trim() || typeof path !== "string") return false;
  return isInAppPath(path) || /^copy:\S{1,200}$/.test(path);
}
