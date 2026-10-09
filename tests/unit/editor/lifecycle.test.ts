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

  it("handles unmount while a save is in progress, sequencing in-flight save and persisting newer edits without stale overwrites", async () => {
    class ControllableDelayedRepository extends MemoryNoteRepository {
      override readonly isDurable = true;
      private deferredPromise: Promise<void> | null = null;
      private resolveDeferred: (() => void) | null = null;
      public saveHistory: Note[] = [];

      pauseSaves() {
        this.deferredPromise = new Promise<void>((resolve) => {
          this.resolveDeferred = resolve;
        });
      }

      resumeSaves() {
        if (this.resolveDeferred) {
          const res = this.resolveDeferred;
          this.resolveDeferred = null;
          this.deferredPromise = null;
          res();
        }
      }

      override async saveNote(note: Note): Promise<void> {
        if (this.deferredPromise) {
          await this.deferredPromise;
        }
        this.saveHistory.push({ ...note });
        return super.saveNote(note);
      }
    }

    const delayedRepo = new ControllableDelayedRepository();
    setNoteRepository(delayedRepo);

    const initialNote: Note = {
      id: "note-inflight",
      title: "Initial Title",
      content: "Initial Content",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      deletedAt: null,
    };
    await delayedRepo.saveNote(initialNote);

    const { result, unmount } = renderHook(() => useNote("note-inflight"), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Pause storage writes to create an in-flight save
    delayedRepo.pauseSaves();

    // Trigger first edit
    act(() => {
      result.current.handleContentChange("First edit in-flight");
    });

    // Advance 400ms so debounce fires and performSave enters repo.saveNote (where it pauses)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 450));
    });

    // Now a save is actively in-flight. User makes a newer edit right before tab close:
    act(() => {
      result.current.handleContentChange("Second edit made right before closing tab");
    });

    // Close tab / unmount: flushPendingSave runs while first save is still in flight
    let flushFinished = false;
    const flushAction = act(async () => {
      const flush = result.current.flushPendingSave();
      unmount();
      // Resume storage so in-flight save can finish and flush can sequence the second save
      delayedRepo.resumeSaves();
      await flush;
      flushFinished = true;
    });

    await flushAction;
    expect(flushFinished).toBe(true);

    // Verify repository has the latest edits, not the stale first edit
    const finalStored = await delayedRepo.getNote("note-inflight");
    expect(finalStored?.content).toBe("Second edit made right before closing tab");
  });

  it("handles storage failure during lifecycle flush truthfully without claiming saved status", async () => {
    const note: Note = {
      id: "note-flush-fail",
      title: "Title",
      content: "Original Content",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      deletedAt: null,
    };
    await memoryRepo.saveNote(note);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result, unmount } = renderHook(() => useNote("note-flush-fail"), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Make rapid edits
    act(() => {
      result.current.handleContentChange("Unsaved text before crash");
    });

    // Mock failure during saveNote
    vi.spyOn(memoryRepo, "saveNote").mockRejectedValueOnce(new Error("IndexedDB quota exceeded or aborted"));

    // Flush pending save
    await act(async () => {
      await result.current.flushPendingSave();
    });

    // Must truthfully report 'error' and never falsely report 'saved'
    expect(result.current.status).toBe("error");
    // Edits remain intact in memory
    expect(result.current.content).toBe("Unsaved text before crash");

    unmount();

    errorSpy.mockRestore();
  });
});
