import * as React from "react";

/**
 * A blob: URL for previewing a local file, released when the file changes or
 * the component unmounts.
 *
 * Calling URL.createObjectURL during render makes a new URL on every render
 * and never frees the old ones, so each keystroke in a form holding an image
 * leaks another copy of it until the page is closed.
 */
export function useObjectUrl(file: Blob | null | undefined): string | null {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}
