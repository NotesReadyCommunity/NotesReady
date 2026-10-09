import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { useNote } from "@/hooks/useNote";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { setNoteRepository } from "@/core/storage";
import { MemoryNoteRepository } from "@/core/storage/memory";
import { Note } from "@/core/models/note";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/app/notes/note-life",
}));

class TestDurableRepository extends MemoryNoteRepository {
  override readonly isDurable = true;
}

describe("Editor Lifecycle Flushing (Unmount, pagehide, visibilitychange)", () => {
  let memoryRepo: TestDurableRepository;

  beforeEach(() => {
    memoryRepo = new TestDurableRepository();
    setNoteRepository(memoryRepo);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(WorkspaceProvider, null, children)
  );

  it("flushes pending edits immediately on component unmount before debounce finishes", async () => {
    const note: Note = {
      id: "note-unmount",
      title: "Title Before",
      content: "Content Before",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      deletedAt: null,
    };
    await memoryRepo.saveNote(note);

    const { result, unmount } = renderHook(() => useNote("note-unmount"), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Make rapid edits
    act(() => {
      result.current.handleContentChange("Edits made right before closing tab");
    });

    // Unmount immediately without waiting 400ms for debounce
    await act(async () => {
      unmount();
      await new Promise((r) => setTimeout(r, 50));
    });

    // Verify repository received the flushed write
    const saved = await memoryRepo.getNote("note-unmount");
    expect(saved?.content).toBe("Edits made right before closing tab");
    expect(saved?.format).toBe("tiptap-json-v1");
  });

  it("flushes pending edits immediately on pagehide event", async () => {
    const note: Note = {
      id: "note-pagehide",
      title: "Title",
      content: "Original Content",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      deletedAt: null,
    };
    await memoryRepo.saveNote(note);

    const { result } = renderHook(() => useNote("note-pagehide"), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    act(() => {
      result.current.handleContentChange("Content typed right before navigation");
    });

    // Dispatch pagehide event
    await act(async () => {
      window.dispatchEvent(new Event("pagehide"));
      await new Promise((r) => setTimeout(r, 50));
    });

    const saved = await memoryRepo.getNote("note-pagehide");
    expect(saved?.content).toBe("Content typed right before navigation");
  });

  it("flushes pending edits when document visibility changes to hidden", async () => {
    const note: Note = {
      id: "note-vis",
      title: "Title",
      content: "Original Content",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      deletedAt: null,
    };
    await memoryRepo.saveNote(note);

    const { result } = renderHook(() => useNote("note-vis"), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    act(() => {
      result.current.handleContentChange("Edits before switching browser tabs");
    });

    // Simulate switching browser tabs
    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      writable: true,
      configurable: true,
    });

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
      await new Promise((r) => setTimeout(r, 50));
    });

    const saved = await memoryRepo.getNote("note-vis");
    expect(saved?.content).toBe("Edits before switching browser tabs");
  });
});
