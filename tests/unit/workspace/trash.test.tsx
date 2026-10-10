import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TrashPage from "@/app/(workspace)/app/trash/page";
import { NoteEditor } from "@/components/workspace/NoteEditor";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { MemoryNoteRepository } from "@/core/storage/memory";
import { setNoteRepository } from "@/core/storage";
import { createEmptyNote } from "@/core/models/note";

// Mock router and navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/app/trash",
  useParams: () => ({}),
}));

describe("Trash & Recovery Lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    setNoteRepository(null);
  });

  it("renders empty state when no notes are trashed", async () => {
    const repo = new MemoryNoteRepository();
    setNoteRepository(repo);

    render(
      <WorkspaceProvider>
        <TrashPage />
      </WorkspaceProvider>
    );

    expect(await screen.findByText(/trash is empty/i)).toBeDefined();
  });

  it("displays trashed notes and excludes them from active workspace list", async () => {
    const repo = new MemoryNoteRepository();
    const activeNote = createEmptyNote({ title: "Active Document" });
    const trashedNote = createEmptyNote({
      title: "Discarded Draft",
      deletedAt: new Date().toISOString(),
    });
    await repo.saveNote(activeNote);
    await repo.saveNote(trashedNote);
    setNoteRepository(repo);

    render(
      <WorkspaceProvider>
        <TrashPage />
      </WorkspaceProvider>
    );

    expect(await screen.findByText("Discarded Draft")).toBeDefined();
    expect(screen.queryByText("Active Document")).toBeNull();
  });

  it("restores a trashed note back to active notes", async () => {
    const repo = new MemoryNoteRepository();
    const trashedNote = createEmptyNote({
      title: "Note to recover",
      deletedAt: new Date().toISOString(),
    });
    await repo.saveNote(trashedNote);
    setNoteRepository(repo);

    render(
      <WorkspaceProvider>
        <TrashPage />
      </WorkspaceProvider>
    );

    const restoreBtn = await screen.findByRole("button", { name: /restore note to recover/i });
    fireEvent.click(restoreBtn);

    await waitFor(() => {
      expect(screen.queryByText("Note to recover")).toBeNull();
    });

    const refreshed = await repo.getNote(trashedNote.id);
    expect(refreshed?.deletedAt).toBeNull();
  });

  it("permanently deletes a note after confirmation", async () => {
    const repo = new MemoryNoteRepository();
    const trashedNote = createEmptyNote({
      title: "Permanently gone",
      deletedAt: new Date().toISOString(),
    });
    await repo.saveNote(trashedNote);
    setNoteRepository(repo);

    render(
      <WorkspaceProvider>
        <TrashPage />
      </WorkspaceProvider>
    );

    const deleteBtn = await screen.findByRole("button", { name: /permanently delete permanently gone/i });
    fireEvent.click(deleteBtn);

    const confirmBtn = await screen.findByRole("button", { name: /confirm permanent delete permanently gone/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.queryByText("Permanently gone")).toBeNull();
    });

    const reloaded = await repo.getNote(trashedNote.id);
    expect(reloaded).toBeNull();
  });

  it("empties the entire trash after confirmation", async () => {
    const repo = new MemoryNoteRepository();
    const t1 = createEmptyNote({ title: "Trash 1", deletedAt: new Date().toISOString() });
    const t2 = createEmptyNote({ title: "Trash 2", deletedAt: new Date().toISOString() });
    await repo.saveNote(t1);
    await repo.saveNote(t2);
    setNoteRepository(repo);

    render(
      <WorkspaceProvider>
        <TrashPage />
      </WorkspaceProvider>
    );

    const emptyBtn = await screen.findByRole("button", { name: /empty trash/i });
    fireEvent.click(emptyBtn);

    const confirmBtn = await screen.findByRole("button", { name: /confirm/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/trash is empty/i)).toBeDefined();
    });

    const trashedInRepo = await repo.listTrashedNotes();
    expect(trashedInRepo.length).toBe(0);
  });

  it("renders Trashed Note Banner with read-only controls when viewing a trashed note directly", async () => {
    const repo = new MemoryNoteRepository();
    const trashedNote = createEmptyNote({
      title: "Trashed Doc Direct View",
      content: "Important read-only text",
      deletedAt: new Date().toISOString(),
    });
    await repo.saveNote(trashedNote);
    setNoteRepository(repo);

    render(
      <WorkspaceProvider>
        <NoteEditor noteId={trashedNote.id} />
      </WorkspaceProvider>
    );

    const banner = await screen.findByRole("alert", { name: /trashed note notice/i });
    expect(banner).toBeDefined();
    expect(screen.getByText(/this note is in the trash/i)).toBeDefined();

    // Title input should be disabled
    const titleInput = screen.getByLabelText("Note Title") as HTMLInputElement;
    expect(titleInput.disabled).toBe(true);

    // Can restore note from banner
    const restoreBtn = screen.getByRole("button", { name: /restore note/i });
    expect(restoreBtn).toBeDefined();
  });
});
