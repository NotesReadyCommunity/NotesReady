import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArchivePage from "@/app/(workspace)/app/archive/page";
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
  usePathname: () => "/app/archive",
  useParams: () => ({}),
}));

describe("Archive & Unarchive Lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    setNoteRepository(null);
  });

  it("renders empty state when no notes are archived", async () => {
    const repo = new MemoryNoteRepository();
    setNoteRepository(repo);

    render(
      <WorkspaceProvider>
        <ArchivePage />
      </WorkspaceProvider>
    );

    expect(await screen.findByText(/archive is empty/i)).toBeDefined();
  });

  it("displays archived notes and unarchives them", async () => {
    const repo = new MemoryNoteRepository();
    const activeNote = createEmptyNote({ title: "Live Note" });
    const archivedNote = createEmptyNote({
      title: "Archived Project",
      archivedAt: new Date().toISOString(),
    });
    await repo.saveNote(activeNote);
    await repo.saveNote(archivedNote);
    setNoteRepository(repo);

    render(
      <WorkspaceProvider>
        <ArchivePage />
      </WorkspaceProvider>
    );

    expect(await screen.findByText("Archived Project")).toBeDefined();
    expect(screen.queryByText("Live Note")).toBeNull();

    const unarchiveBtn = screen.getByRole("button", { name: /unarchive note archived project/i });
    fireEvent.click(unarchiveBtn);

    await waitFor(() => {
      expect(screen.queryByText("Archived Project")).toBeNull();
    });

    const refreshed = await repo.getNote(archivedNote.id);
    expect(refreshed?.archivedAt).toBeNull();
  });
});
