import { describe, it, expect } from "vitest";
import {
  getContentSizeBytes,
  checkContentSize,
  formatBytes,
  SOFT_SIZE_LIMIT_BYTES,
  HARD_SIZE_LIMIT_BYTES,
} from "@/core/utils/limits";

describe("Document Size Limits & Measurement", () => {
  it("measures byte size accurately across ASCII and multi-byte characters", () => {
    expect(getContentSizeBytes("abc")).toBe(3);
    // Multi-byte character (emoji / UTF-8)
    expect(getContentSizeBytes("🔥")).toBe(4);
    expect(getContentSizeBytes("")).toBe(0);
  });

  it("formats byte sizes cleanly for human readability", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(500 * 1024)).toBe("500.0 KB");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.00 MB");
  });

  it("flags notes below 500 KB as normal (no warning, no hard limit)", () => {
    const smallText = "A regular note body with a few paragraphs of text.";
    const check = checkContentSize(smallText);

    expect(check.isWarning).toBe(false);
    expect(check.isExceeded).toBe(false);
  });

  it("flags notes between 500 KB and 2 MB as warning", () => {
    // Generate ~512 KB string
    const largeText = "x".repeat(512 * 1024);
    const check = checkContentSize(largeText);

    expect(check.sizeBytes).toBeGreaterThanOrEqual(SOFT_SIZE_LIMIT_BYTES);
    expect(check.isWarning).toBe(true);
    expect(check.isExceeded).toBe(false);
  });

  it("flags notes exceeding 2 MB as exceeded (hard blocking limit)", () => {
    // Generate ~2.1 MB string
    const hugeText = "x".repeat(HARD_SIZE_LIMIT_BYTES + 1024);
    const check = checkContentSize(hugeText);

    expect(check.sizeBytes).toBeGreaterThanOrEqual(HARD_SIZE_LIMIT_BYTES);
    expect(check.isExceeded).toBe(true);
  });
});
