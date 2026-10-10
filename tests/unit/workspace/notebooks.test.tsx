import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotebookDetailPage from "@/app/(workspace)/app/notebooks/[id]/page";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { MemoryNoteRepository } from "@/core/storage/memory";
import { setNoteRepository } from "@/core/storage";
import { createEmptyNote } from "@/core/models/note";
import { createEmptyNotebook } from "@/core/models/notebook";

let mockParamsId = "test-nb-1";

// Mock router and navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => `/app/notebooks/${mockParamsId}`,
  useParams: () => ({ id: mockParamsId }),
}));

describe("Notebooks Organization & Hierarchy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    setNoteRepository(null);
  });

  it("renders notebook detail and filtered notes for the notebook", async () => {
    const repo = new MemoryNoteRepository();
    const nb = createEmptyNotebook({ id: "test-nb-1", name: "Research Project" });
    const noteInNb = createEmptyNote({
      title: "Field Study Notes",
      notebookId: "test-nb-1",
    });
    const noteOutside = createEmptyNote({
      title: "Random Thought",
      notebookId: null,
    });
    await repo.saveNotebook(nb);
    await repo.saveNote(noteInNb);
    await repo.saveNote(noteOutside);
    setNoteRepository(repo);

    render(
      <WorkspaceProvider>
        <NotebookDetailPage />
      </WorkspaceProvider>
    );

    expect(await screen.findByText("Research Project")).toBeDefined();
    expect(screen.getByText("Field Study Notes")).toBeDefined();
    expect(screen.queryByText("Random Thought")).toBeNull();
  });

  it("allows renaming a notebook", async () => {
    const repo = new MemoryNoteRepository();
    const nb = createEmptyNotebook({ id: "test-nb-1", name: "Initial Title" });
    await repo.saveNotebook(nb);
    setNoteRepository(repo);

    render(
      <WorkspaceProvider>
        <NotebookDetailPage />
      </WorkspaceProvider>
    );

    const renameBtn = await screen.findByRole("button", { name: /rename notebook/i });
    fireEvent.click(renameBtn);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Updated Title" } });

    const saveBtn = screen.getByRole("button", { name: /save name/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText("Updated Title")).toBeDefined();
    });

    const updated = await repo.getNotebook("test-nb-1");
    expect(updated?.name).toBe("Updated Title");
  });

  it("deleting a notebook unassigns notes safely without deleting them", async () => {
    const repo = new MemoryNoteRepository();
    const nb = createEmptyNotebook({ id: "test-nb-1", name: "To Delete" });
    const noteInNb = createEmptyNote({
      title: "Safe Note",
      notebookId: "test-nb-1",
    });
    await repo.saveNotebook(nb);
    await repo.saveNote(noteInNb);
    setNoteRepository(repo);

    render(
      <WorkspaceProvider>
        <NotebookDetailPage />
      </WorkspaceProvider>
    );

    const deleteBtn = await screen.findByRole("button", { name: /delete notebook/i });
    fireEvent.click(deleteBtn);

    const confirmBtn = await screen.findByRole("button", { name: /confirm delete notebook/i });
    fireEvent.click(confirmBtn);

    await waitFor(async () => {
      const reloadedNb = await repo.getNotebook("test-nb-1");
      expect(reloadedNb).toBeNull();
    });

    // Note must still exist with notebookId set to null
    const reloadedNote = await repo.getNote(noteInNb.id);
    expect(reloadedNote).not.toBeNull();
    expect(reloadedNote?.title).toBe("Safe Note");
    expect(reloadedNote?.notebookId).toBeNull();
  });
});
