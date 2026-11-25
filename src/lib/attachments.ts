/**
 * Ticket image attachments: what the file picker offers and the quick checks
 * made before upload, so the user gets an immediate answer.
 *
 * These checks are for the user's convenience only. The API is the authority:
 * it reads the real type from the file's bytes, caps the size and names the
 * stored object (POST /ticket-attachments/upload). SVG is never offered
 * because it can carry script.
 */

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const EXTENSION_BY_TYPE: Readonly<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const ATTACHMENT_ACCEPT = Object.keys(EXTENSION_BY_TYPE).join(",");

/** Returns a user-facing reason the file cannot be attached, or null if it can. */
export function attachmentProblem(file: File): string | null {
  if (!(file.type in EXTENSION_BY_TYPE)) {
    return "Attach a JPG, PNG, WebP or GIF image.";
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return "Images must be 10 MB or smaller.";
  }
  return null;
}
