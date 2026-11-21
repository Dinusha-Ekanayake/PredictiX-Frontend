/**
 * Ticket image attachments: what may be uploaded and how the stored name is built.
 *
 * Files go straight from the browser to Supabase Storage, so this is the only
 * place they are checked before upload. SVG is excluded because it can carry
 * script, and the stored extension comes from the file's type rather than its
 * name, so a file called "x.html" can never be stored as HTML.
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

/** Storage object name for an accepted file: unique, with a type-derived extension. */
export function attachmentObjectName(file: File, uniqueId: string): string {
  const extension = EXTENSION_BY_TYPE[file.type] ?? "bin";
  return `${Date.now()}-${uniqueId}.${extension}`;
}
