import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorErrorBoundary } from "@/components/editor/EditorErrorBoundary";

describe("Editor Error Boundary & Textarea Fallback", () => {
  it("renders children when no error occurs", () => {
    render(
      <EditorErrorBoundary fallbackContent="Sample text">
        <div data-testid="healthy-editor">Healthy Editor Canvas</div>
      </EditorErrorBoundary>
    );

    expect(screen.getByTestId("healthy-editor")).toBeDefined();
    expect(screen.getByText("Healthy Editor Canvas")).toBeDefined();
  });

  it("catches render errors and displays plain textarea fallback preserving content", () => {
    // Suppress console.error for expected test crash
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const BrokenComponent = () => {
      throw new Error("Simulated ProseMirror crash");
    };

    const onContentChange = vi.fn();
    const fallbackContent = "Preserved unsaved draft content";

    render(
      <EditorErrorBoundary
        fallbackContent={fallbackContent}
        format="plain-text-v1"
        onContentChange={onContentChange}
      >
        <BrokenComponent />
      </EditorErrorBoundary>
    );

    // Verifies fallback alert banner
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText(/Switched to safe plain-text mode/i)).toBeDefined();

    // Verifies accessible fallback textarea with preserved content
    const textarea = screen.getByRole("textbox", {
      name: /Plain Text Fallback Content/i,
    }) as HTMLTextAreaElement;
    expect(textarea).toBeDefined();
    expect(textarea.value).toBe(fallbackContent);

    // Typing in fallback textarea fires onContentChange
    fireEvent.change(textarea, { target: { value: "Updated content in fallback mode" } });
    expect(onContentChange).toHaveBeenCalledWith("Updated content in fallback mode");

    errorSpy.mockRestore();
  });
});
