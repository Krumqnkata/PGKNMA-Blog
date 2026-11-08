import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

export const PRINT_ASSETS_TIMEOUT_MS = 15_000;

// The print view starts as display: none, so the browser would not fetch these on its own.
const PRINT_FONTS = [
  '700 16px "Commissioner"',
  '900 16px "Commissioner"',
  '400 16px "Source Serif 4"',
  '600 16px "Source Serif 4"',
  '700 16px "Source Serif 4"',
  'italic 400 16px "Source Serif 4"',
];

const waitForPrintAssets = async (view: HTMLElement | null) => {
  const images = Array.from(view?.querySelectorAll("img") ?? []);
  const assets = [
    ...images.map((image) => image.decode?.()),
    ...PRINT_FONTS.map((font) => document.fonts?.load(font, "абвabc")),
  ];

  let timeoutId: number | undefined;
  // A broken or very slow image must not block printing the rest of the article.
  await Promise.race([
    Promise.allSettled(assets),
    new Promise((resolve) => {
      timeoutId = window.setTimeout(resolve, PRINT_ASSETS_TIMEOUT_MS);
    }),
  ]);
  window.clearTimeout(timeoutId);
};

/**
 * Mounts the print view on demand, so a normal article visit does not download
 * full-size photos. It stays mounted for the article because some mobile browsers
 * render the page after `afterprint` has already fired.
 */
export function usePostPrint(postId: number | undefined) {
  const viewRef = useRef<HTMLDivElement>(null);
  const [mountedPostId, setMountedPostId] = useState<number | null>(null);
  const [preparingPostId, setPreparingPostId] = useState<number | null>(null);
  const isMounted = postId !== undefined && mountedPostId === postId;
  const isPreparing = postId !== undefined && preparingPostId === postId;

  const startPrint = useCallback(() => {
    if (postId === undefined) return;
    setMountedPostId(postId);
    setPreparingPostId(postId);
  }, [postId]);

  useEffect(() => {
    setPreparingPostId(null);
  }, [postId]);

  useEffect(() => {
    if (!isPreparing) return undefined;
    let cancelled = false;
    void waitForPrintAssets(viewRef.current).then(() => {
      if (cancelled) return;
      try {
        window.print();
      } finally {
        setPreparingPostId(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isPreparing]);

  useEffect(() => {
    if (postId === undefined) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey) return;
      if (event.key.toLowerCase() !== "p") return;
      event.preventDefault();
      startPrint();
    };

    // Printing from the browser menu cannot be delayed: the text is ready, but
    // photos that have not been downloaded yet may be missing from that printout.
    const handleBeforePrint = () => {
      flushSync(() => setMountedPostId(postId));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeprint", handleBeforePrint);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeprint", handleBeforePrint);
    };
  }, [postId, startPrint]);

  return { viewRef, isMounted, isPreparing, startPrint };
}
