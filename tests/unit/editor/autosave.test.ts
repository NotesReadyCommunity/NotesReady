import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { useNote } from "@/hooks/useNote";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { setNoteRepository } from "@/core/storage";
import { MemoryNoteRepository } from "@/core/storage/memory";
import { Note } from "@/core/models/note";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/app/notes/note-1",
}));

class TestDurableRepository extends MemoryNoteRepository {
  override readonly isDurable = true;
}

describe("Autosave & Truthful Persistence State Machine", () => {
  let memoryRepo: TestDurableRepository;

  beforeEach(() => {
    memoryRepo = new TestDurableRepository();
    setNoteRepository(memoryRepo);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(WorkspaceProvider, null, children)
  );

  it("loads existing note without prematurely saving to storage", async () => {
    const original: Note = {
      id: "note-1",
      title: "Initial Title",
      content: "Legacy plain text content",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      deletedAt: null,
    };
    await memoryRepo.saveNote(original);

    const saveSpy = vi.spyOn(memoryRepo, "saveNote");

    const { result } = renderHook(() => useNote("note-1"), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.title).toBe("Initial Title");
    expect(result.current.content).toBe("Legacy plain text content");
    expect(result.current.format).toBe("plain-text-v1");

    // CRITICAL: opening the note must NOT write to storage!
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("handles storage failure honestly: updates status to error and preserves unsaved text", async () => {
    const original: Note = {
      id: "note-2",
      title: "Important Note",
      content: "Draft content",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      deletedAt: null,
    };
    await memoryRepo.saveNote(original);

    // Suppress console.error for expected failure
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useNote("note-2"), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Make repository fail on save
    vi.spyOn(memoryRepo, "saveNote").mockRejectedValueOnce(new Error("Disk Full / Quota Exceeded"));

    // User edits content
    act(() => {
      result.current.handleContentChange("New precious edits that failed to save");
    });

    // Let debounce fire
    await act(async () => {
      await new Promise((r) => setTimeout(r, 450));
    });

    // Save status must truthfully reflect error
    expect(result.current.status).toBe("error");

    // The user's unsaved text must be KEPT intact in memory!
    expect(result.current.content).toBe("New precious edits that failed to save");

    errorSpy.mockRestore();
  });

  it("retrying save successfully commits the latest unsaved content", async () => {
    const original: Note = {
      id: "note-3",
      title: "Retry Note",
      content: "Initial text",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      deletedAt: null,
    };
    await memoryRepo.saveNote(original);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useNote("note-3"), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Fail first save
    const saveSpy = vi.spyOn(memoryRepo, "saveNote").mockRejectedValueOnce(new Error("Transient error"));

    act(() => {
      result.current.handleContentChange("Text to retry");
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 450));
    });

    expect(result.current.status).toBe("error");

    // Now restore normal saving behavior and retry
    saveSpy.mockRestore();

    await act(async () => {
      await result.current.retrySave();
    });

    expect(result.current.status).toBe("saved");
    const savedInDb = await memoryRepo.getNote("note-3");
    expect(savedInDb?.content).toBe("Text to retry");
    expect(savedInDb?.format).toBe("tiptap-json-v1");

    errorSpy.mockRestore();
  });
});
