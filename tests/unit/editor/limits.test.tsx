import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import {
  getContentSizeBytes,
  checkContentSize,
  formatBytes,
  SOFT_SIZE_LIMIT_BYTES,
  HARD_SIZE_LIMIT_BYTES,
} from "@/core/utils/limits";
import { EditorSizeWarning } from "@/components/editor/EditorSizeWarning";
import { createSizeLimitExtension } from "@/components/editor/sizeLimitExtension";

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

  it("verifies exact boundary values around 500 KB and 2 MB limits", () => {
    // Exactly 1 byte below soft limit
    const belowSoft = checkContentSize("a".repeat(SOFT_SIZE_LIMIT_BYTES - 1));
    expect(belowSoft.isWarning).toBe(false);
    expect(belowSoft.isExceeded).toBe(false);

    // Exactly at soft limit boundary (500 KB)
    const atSoft = checkContentSize("a".repeat(SOFT_SIZE_LIMIT_BYTES));
    expect(atSoft.isWarning).toBe(true);
    expect(atSoft.isExceeded).toBe(false);

    // Exactly 1 byte below hard limit
    const belowHard = checkContentSize("a".repeat(HARD_SIZE_LIMIT_BYTES - 1));
    expect(belowHard.isWarning).toBe(true);
    expect(belowHard.isExceeded).toBe(false);

    // Exactly at hard limit boundary (2 MB)
    const atHard = checkContentSize("a".repeat(HARD_SIZE_LIMIT_BYTES));
    expect(atHard.isWarning).toBe(false);
    expect(atHard.isExceeded).toBe(true);

    // 1 byte above hard limit
    const aboveHard = checkContentSize("a".repeat(HARD_SIZE_LIMIT_BYTES + 1));
    expect(aboveHard.isWarning).toBe(false);
    expect(aboveHard.isExceeded).toBe(true);
  });
});

describe("EditorSizeWarning Component UX", () => {
  it("renders nothing when content is below the 500 KB warning threshold", () => {
    const check = checkContentSize("Normal note text");
    const { container } = render(<EditorSizeWarning check={check} isBlocked={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders polite warning banner when content is between 500 KB and 2 MB", () => {
    const check = checkContentSize("a".repeat(500 * 1024));
    render(<EditorSizeWarning check={check} isBlocked={false} />);

    const alert = screen.getByRole("status");
    expect(alert).toBeDefined();
    expect(alert.textContent).toContain("Large note");
    expect(alert.textContent).toContain("500 KB recommended limit");
  });

  it("renders assertive alert and clear recovery guidance when an edit is blocked by the 2 MB hard limit", () => {
    const check = checkContentSize("Normal content");
    render(<EditorSizeWarning check={check} isBlocked={true} />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeDefined();
    expect(alert.textContent).toContain("Addition Blocked: Exceeds 2 MB Limit");
    expect(alert.textContent).toContain("The typed or pasted content was blocked because it would exceed the 2 MB hard limit.");
    expect(alert.textContent).toContain("Your existing content is fully preserved. Please delete or trim text before adding more.");
  });

  it("renders assertive alert when existing document already exceeds 2 MB", () => {
    const check = checkContentSize("a".repeat(HARD_SIZE_LIMIT_BYTES + 100));
    render(<EditorSizeWarning check={check} isBlocked={false} />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeDefined();
    expect(alert.textContent).toContain("Maximum Note Size Limit Exceeded");
    expect(alert.textContent).toContain("Please trim or delete excess content to resume normal editing.");
  });
});

describe("ProseMirror Size Limit Enforcement & Recovery", () => {
  it("rejects transactions that would exceed the size limit, preserving last valid document intact", () => {
    const onBlockedChange = vi.fn();
    // Use smaller limit for fast test execution: 1,000 bytes
    const testLimitBytes = 1000;
    const sizeExt = createSizeLimitExtension({
      maxSizeBytes: testLimitBytes,
      onBlockedChange,
    });

    const editor = new Editor({
      extensions: [StarterKit, sizeExt],
      content: "<p>Original safe text that must be preserved.</p>",
    });

    const initialJson = editor.getJSON();
    expect(initialJson).toBeDefined();

    // Attempt oversized insert that pushes document well past limit
    const oversizedString = "A".repeat(testLimitBytes + 500);
    const didApply = editor.commands.insertContent(oversizedString);

    // Command should fail or transaction should be dropped
    expect(onBlockedChange).toHaveBeenCalledWith(true);

    // Verify document was NOT corrupted or enlarged; original safe content remains intact
    const afterAttemptJson = editor.getJSON();
    expect(afterAttemptJson).toEqual(initialJson);
    expect(editor.getText()).toBe("Original safe text that must be preserved.");

    editor.destroy();
  });

  it("permits reductions even when oversized, allowing user recovery and clearing blocked state", () => {
    const onBlockedChange = vi.fn();
    const testLimitBytes = 1000;
    const sizeExt = createSizeLimitExtension({
      maxSizeBytes: testLimitBytes,
      onBlockedChange,
    });

    // Start with document slightly under limit
    const mediumText = "B".repeat(600);
    const editor = new Editor({
      extensions: [StarterKit, sizeExt],
      content: `<p>${mediumText}</p>`,
    });

    // Attempt expansion past limit: blocked
    editor.commands.insertContent("C".repeat(800));
    expect(onBlockedChange).toHaveBeenCalledWith(true);

    // User recovers by deleting text (reduction)
    editor.commands.clearContent();
    editor.commands.insertContent("Small replacement text");

    // Blocked state clears once within limit
    expect(onBlockedChange).toHaveBeenCalledWith(false);
    expect(editor.getText()).toBe("Small replacement text");

    editor.destroy();
  });
});
