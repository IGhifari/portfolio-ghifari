import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Copies text to clipboard and exposes a transient `copied` flag.
 */
export function useClipboardCopy(resetMs = 2200) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(
    async (text) => {
      try {
        if (!navigator?.clipboard?.writeText) return false;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetMs]
  );

  return { copied, copy };
}
