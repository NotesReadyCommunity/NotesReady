import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WorkspaceProvider, useWorkspace } from "@/context/WorkspaceContext";
import { MemoryNoteRepository } from "@/core/storage/memory";
import { setNoteRepository } from "@/core/storage";
import { createEmptyNote } from "@/core/models/note";
import { NoteEditor } from "@/components/workspace/NoteEditor";
import { AppHeader } from "@/components/layout/AppHeader";

// Mock router
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/app",
  useParams: () => ({ id: "test-note-1" }),
}));

// Provide a test harness
function TestHarness() {
  const { notes, createNote, recentNotes } = useWorkspace();
  return (
    <div>
      <button onClick={() => createNote()} data-testid="new-note-btn">
        New Note
      </button>
      <div data-testid="notes-count">{notes.length}</div>
      <div data-testid="recent-count">{recentNotes.length}</div>
    </div>
  );
}

describe("Workspace Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    setNoteRepository(null);
  });

  it("creates a note and triggers router push", async () => {
    render(
      <WorkspaceProvider>
        <TestHarness />
      </WorkspaceProvider>
    );

    const btn = screen.getByTestId("new-note-btn");
    fireEvent.click(btn);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("/app/notes/"));
    });
  });

  it("navigates focus from title to content textarea when Enter is pressed", async () => {
    const repo = new MemoryNoteRepository();
    const testNote = createEmptyNote({
      title: "My Note Title",
      content: "Existing content",
    });
    await repo.saveNote(testNote);
    setNoteRepository(repo);

    render(
      <WorkspaceProvider>
        <NoteEditor noteId={testNote.id} />
      </WorkspaceProvider>
    );

    const titleInput = await screen.findByLabelText("Note Title");
    const contentTextarea = screen.getByLabelText("Note Content");

    titleInput.focus();
    expect(document.activeElement).toBe(titleInput);

    fireEvent.keyDown(titleInput, { key: "Enter" });
    expect(document.activeElement).toBe(contentTextarea);
  });

  it("protects against accidental deletion with confirmation dialog", async () => {
    const repo = new MemoryNoteRepository();
    const testNote = createEmptyNote({
      title: "Note to Protect",
      content: "Sensitive content",
    });
    await repo.saveNote(testNote);
    setNoteRepository(repo);

    render(
      <WorkspaceProvider>
        <NoteEditor noteId={testNote.id} />
      </WorkspaceProvider>
    );

    // Initial state: trash button is visible
    const trashBtn = await screen.findByLabelText("Move Note to Trash");
    expect(trashBtn).toBeDefined();

    // Click trash: confirmation alert appears
    fireEvent.click(trashBtn);
    expect(screen.getByText("Move to trash?")).toBeDefined();
    const cancelBtn = screen.getByLabelText("Cancel deletion");
    const confirmBtn = screen.getByLabelText("Confirm move to trash");
    expect(cancelBtn).toBeDefined();
    expect(confirmBtn).toBeDefined();

    // Cancel deletion: confirmation alert disappears, note remains active
    fireEvent.click(cancelBtn);
    expect(screen.queryByText("Move to trash?")).toBeNull();
    const noteStillActive = await repo.getNote(testNote.id);
    expect(noteStillActive?.deletedAt).toBeNull();

    // Click trash again and confirm deletion
    const trashBtnAgain = screen.getByLabelText("Move Note to Trash");
    fireEvent.click(trashBtnAgain);
    const confirmBtnAgain = screen.getByLabelText("Confirm move to trash");
    fireEvent.click(confirmBtnAgain);

    // Verifies router pushed back to /app/notes
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/app/notes");
    });

    // Verifies soft-deleted record retains deletedAt timestamp
    const deletedNote = await repo.getNote(testNote.id);
    expect(deletedNote?.deletedAt).not.toBeNull();
  });
});

describe("AppHeader Synchronization & Storage Indicator", () => {
  it("renders non-note route titles without stale note save status", () => {
    const { rerender } = render(
      <AppHeader
        onToggleMobileMenu={vi.fn()}
        title="All Notes"
        showSaveStatus={false}
        saveStatus="saved"
        isStorageDurable={true}
      />
    );

    expect(screen.getByText("All Notes")).toBeDefined();
    expect(screen.queryByText("Saved locally")).toBeNull();

    rerender(
      <AppHeader
        onToggleMobileMenu={vi.fn()}
        title="Favorites"
        showSaveStatus={false}
        saveStatus="saved"
        isStorageDurable={true}
      />
    );

    expect(screen.getByText("Favorites")).toBeDefined();
    expect(screen.queryByText("Saved locally")).toBeNull();
  });

  it("renders active note title and save status on note route", () => {
    render(
      <AppHeader
        onToggleMobileMenu={vi.fn()}
        title="Project Roadmap"
        showSaveStatus={true}
        saveStatus="saved"
        isStorageDurable={true}
      />
    );

    expect(screen.getByText("Project Roadmap")).toBeDefined();
    expect(screen.getByText("Saved locally")).toBeDefined();
  });

  it("renders storage unavailable warning and suppresses false 'Saved locally' when storage is not durable", () => {
    render(
      <AppHeader
        onToggleMobileMenu={vi.fn()}
        title="Project Roadmap"
        showSaveStatus={true}
        saveStatus="saved"
        isStorageDurable={false}
        storageError="Storage unavailable — notes cannot currently be persisted across reloads."
      />
    );

    expect(screen.getByText("Storage unavailable")).toBeDefined();
    expect(screen.queryByText("Saved locally")).toBeNull();
  });
});
