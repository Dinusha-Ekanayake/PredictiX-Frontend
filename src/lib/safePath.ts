/**
 * True for a same-site path such as "/admin/tickets?id=1".
 *
 * Rejects "//host" (protocol-relative), absolute URLs, "javascript:" and
 * backslash tricks, so a server-supplied link can only move within the app.
 */
export function isInAppPath(path: unknown): path is string {
  return typeof path === "string" && /^\/(?!\/)[^\s\\]*$/.test(path.trim());
}
