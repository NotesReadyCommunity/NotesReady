import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, renderHook, act } from "@testing-library/react";
import { EditorErrorBoundary } from "@/components/editor/EditorErrorBoundary";
import { useNote } from "@/hooks/useNote";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { setNoteRepository } from "@/core/storage";
import { MemoryNoteRepository } from "@/core/storage/memory";
import { Note } from "@/core/models/note";
import { convertPlainTextToTiptapDoc, isValidTiptapDoc } from "@/core/utils/content";

class TestDurableRepository extends MemoryNoteRepository {
  override readonly isDurable = true;
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/app/notes/note-fallback",
}));

describe("Editor Error Boundary & Plain-Text Fallback Format", () => {
  let memoryRepo: TestDurableRepository;

  beforeEach(() => {
    memoryRepo = new TestDurableRepository();
    setNoteRepository(memoryRepo);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(WorkspaceProvider, null, children)
  );

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
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const BrokenComponent = () => {
      throw new Error("Simulated ProseMirror crash");
    };

    const onFallbackContentChange = vi.fn();
    const fallbackContent = "Preserved unsaved draft content";

    render(
      <EditorErrorBoundary
        fallbackContent={fallbackContent}
        format="plain-text-v1"
        onFallbackContentChange={onFallbackContentChange}
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

    // Typing in fallback textarea fires onFallbackContentChange
    fireEvent.change(textarea, { target: { value: "Updated content in fallback mode" } });
    expect(onFallbackContentChange).toHaveBeenCalledWith("Updated content in fallback mode");

    errorSpy.mockRestore();
  });

  it("persists fallback edits with explicit plain-text-v1 format, avoiding JSON corruption", async () => {
    const original: Note = {
      id: "note-fallback-1",
      title: "Fallback Note",
      content: "Initial plain text",
      format: "plain-text-v1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      deletedAt: null,
    };
    await memoryRepo.saveNote(original);

    const { result } = renderHook(() => useNote("note-fallback-1"), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Edit content via handleFallbackContentChange
    act(() => {
      result.current.handleFallbackContentChange("Plain text line 1\nPlain text line 2");
    });

    // Wait for debounce save
    await act(async () => {
      await new Promise((r) => setTimeout(r, 450));
    });

    expect(result.current.status).toBe("saved");
    expect(result.current.format).toBe("plain-text-v1");

    // Check storage record directly: format MUST be plain-text-v1, not tiptap-json-v1
    const stored = await memoryRepo.getNote("note-fallback-1");
    expect(stored?.content).toBe("Plain text line 1\nPlain text line 2");
    expect(stored?.format).toBe("plain-text-v1");

    // Reopening the note: convertPlainTextToTiptapDoc converts without JSON parse error
    const inMemoryDoc = convertPlainTextToTiptapDoc(stored!.content);
    expect(isValidTiptapDoc(inMemoryDoc)).toBe(true);
    expect(inMemoryDoc.content).toHaveLength(2);

    // Reopening the saved note in a fresh useNote instance loads cleanly without corruption
    const { result: reloaded } = renderHook(() => useNote("note-fallback-1"), { wrapper });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(reloaded.current.content).toBe("Plain text line 1\nPlain text line 2");
    expect(reloaded.current.format).toBe("plain-text-v1");
    expect(reloaded.current.status).toBe("saved");
  });

  it("supports save failure and retry in fallback mode", async () => {
    const original: Note = {
      id: "note-fallback-retry",
      title: "Fallback Retry Note",
      content: "Initial text",
      format: "plain-text-v1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      deletedAt: null,
    };
    await memoryRepo.saveNote(original);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useNote("note-fallback-retry"), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Force failure on save
    const saveSpy = vi.spyOn(memoryRepo, "saveNote").mockRejectedValueOnce(new Error("Storage unavailable"));

    act(() => {
      result.current.handleFallbackContentChange("Unsaved fallback edits");
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 450));
    });

    // Status truthfully reflects error and text is preserved in memory
    expect(result.current.status).toBe("error");
    expect(result.current.content).toBe("Unsaved fallback edits");

    // Restore saving and retry
    saveSpy.mockRestore();

    await act(async () => {
      await result.current.retrySave();
    });

    expect(result.current.status).toBe("saved");
    const stored = await memoryRepo.getNote("note-fallback-retry");
    expect(stored?.content).toBe("Unsaved fallback edits");
    expect(stored?.format).toBe("plain-text-v1");

    errorSpy.mockRestore();
  });
});
