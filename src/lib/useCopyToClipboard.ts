'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseCopyToClipboardReturn {
  copiedCode: string | null;
  copyToClipboard: (text: string, onSuccess?: () => void) => Promise<boolean>;
}

/**
 * Reusable clipboard copy hook with automatic unmount timer cleanup.
 * Prevents React state update warnings when navigating away within resetDelayMs.
 */
export function useCopyToClipboard(resetDelayMs: number = 2500): UseCopyToClipboardReturn {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copyToClipboard = useCallback(
    async (text: string, onSuccess?: () => void): Promise<boolean> => {
      try {
        if (typeof window !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          setCopiedCode(text);
          if (onSuccess) onSuccess();

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            setCopiedCode(null);
          }, resetDelayMs);

          return true;
        }
        return false;
      } catch (err) {
        console.error('[useCopyToClipboard] Failed to copy to clipboard', err);
        return false;
      }
    },
    [resetDelayMs]
  );

  return { copiedCode, copyToClipboard };
}
