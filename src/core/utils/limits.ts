/**
 * NotesReady Document Size Limits & Measurement
 *
 * Empirical Benchmark:
 * - A standard text note is ~500 to 2,000 words (~3KB to 12KB).
 * - A heavy note is ~20,000 words (~120KB JSON).
 * - A large document is ~80,000 words (~500KB JSON).
 *
 * Limits:
 * - Soft Warning Limit: 500 KB (~100,000 words). Non-blocking UX banner.
 * - Hard Limit: 2 MB (~400,000 words). Blocks save / input expansion to prevent memory degradation.
 */

export const SOFT_SIZE_LIMIT_BYTES = 500 * 1024; // 500 KB
export const HARD_SIZE_LIMIT_BYTES = 2 * 1024 * 1024; // 2 MB

export interface ContentSizeCheck {
  sizeBytes: number;
  isWarning: boolean;
  isExceeded: boolean;
  formattedSize: string;
}

export function getContentSizeBytes(content: string): number {
  if (!content) return 0;
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(content).length;
  }
  return Buffer.from(content).length;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function checkContentSize(content: string): ContentSizeCheck {
  const sizeBytes = getContentSizeBytes(content);
  const isWarning = sizeBytes >= SOFT_SIZE_LIMIT_BYTES && sizeBytes < HARD_SIZE_LIMIT_BYTES;
  const isExceeded = sizeBytes >= HARD_SIZE_LIMIT_BYTES;

  return {
    sizeBytes,
    isWarning,
    isExceeded,
    formattedSize: formatBytes(sizeBytes),
  };
}
