import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { EditorErrorBoundary } from "@/components/editor/EditorErrorBoundary";

describe("Privacy & Telemetry Audit (Zero Content in Logs)", () => {
  it("never logs private note titles, bodies, or pasted text on editor crash", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const sensitiveNoteTitle = "Top Secret Mergers & Acquisitions 2026";
    const sensitiveBodyContent = "Confidential financial numbers: Revenue $50M, profit $12M";

    const CrashingEditor = () => {
      throw new Error("ProseMirror simulated crash");
    };

    render(
      <EditorErrorBoundary
        fallbackContent={sensitiveBodyContent}
        format="plain-text-v1"
      >
        <CrashingEditor />
      </EditorErrorBoundary>
    );

    // Verify console.error was called for diagnostics
    expect(errorSpy).toHaveBeenCalled();

    // Check all logged arguments
    for (const call of errorSpy.mock.calls) {
      const callString = JSON.stringify(call);
      expect(callString).not.toContain(sensitiveNoteTitle);
      expect(callString).not.toContain(sensitiveBodyContent);
      expect(callString).not.toContain("Confidential");
      expect(callString).not.toContain("financial");
    }

    errorSpy.mockRestore();
  });
});
