import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { AppSidebar } from "@/components/layout/AppSidebar";
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
  usePathname: () => "/app",
  useParams: () => ({}),
}));

describe("AppSidebar Navigation Integrity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    setNoteRepository(null);
  });

  const renderSidebar = async (props: { onCloseMobile?: () => void } = {}) => {
    const result = render(
      <WorkspaceProvider>
        <AppSidebar {...props} />
      </WorkspaceProvider>
    );
    // Allow initial WorkspaceProvider refreshNotes to settle
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /new note/i })).toBeDefined();
    });
    return result;
  };

  it("renders functional navigation links with correct destinations", async () => {
    await renderSidebar();

    // Main nav links
    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink.getAttribute("href")).toBe("/app");

    const allNotesLink = screen.getByRole("link", { name: /all notes/i });
    expect(allNotesLink.getAttribute("href")).toBe("/app/notes");

    const favoritesLink = screen.getByRole("link", { name: /favorites/i });
    expect(favoritesLink.getAttribute("href")).toBe("/app/favorites");

    const sharedLink = screen.getByRole("link", { name: /shared/i });
    expect(sharedLink.getAttribute("href")).toBe("/app/shared");

    // Brand logo link to /app
    const logoLink = screen.getByRole("link", { name: /notesready/i });
    expect(logoLink.getAttribute("href")).toBe("/app");
  });

  it("triggers note creation and closes mobile drawer on New Note click", async () => {
    const onCloseMobile = vi.fn();
    const repo = new MemoryNoteRepository();
    setNoteRepository(repo);

    await renderSidebar({ onCloseMobile });

    const newNoteBtn = screen.getByRole("button", { name: /new note/i });
    fireEvent.click(newNoteBtn);

    await waitFor(() => {
      expect(onCloseMobile).toHaveBeenCalledTimes(1);
    });
  });

  it("renders real recent notes linking directly to note pages", async () => {
    const repo = new MemoryNoteRepository();
    const note1 = createEmptyNote({ title: "Architecture RFC" });
    const note2 = createEmptyNote({ title: "Design Principles" });
    await repo.saveNote(note1);
    await repo.saveNote(note2);
    setNoteRepository(repo);

    render(
      <WorkspaceProvider>
        <AppSidebar />
      </WorkspaceProvider>
    );

    const rfcLink = await screen.findByRole("link", { name: /architecture rfc/i });
    expect(rfcLink.getAttribute("href")).toBe(`/app/notes/${note1.id}`);

    const designLink = await screen.findByRole("link", { name: /design principles/i });
    expect(designLink.getAttribute("href")).toBe(`/app/notes/${note2.id}`);
  });

  it("does not route Quick Search to generic pages and presents it as an unavailable/planned feature", async () => {
    await renderSidebar();

    // Quick Search must NOT be a link to /app/notes or /app
    const quickSearchText = screen.getByText("Quick Search");
    const quickSearchContainer = quickSearchText.closest("[aria-disabled='true']");
    expect(quickSearchContainer).not.toBeNull();
    expect(quickSearchContainer?.closest("a")).toBeNull();

    // Verify clear planned status
    expect(within(quickSearchContainer as HTMLElement).getByText(/soon/i)).toBeDefined();
  });

  it("does not route Notebooks to generic pages and presents it as an unavailable/planned feature without fake notebook links", async () => {
    await renderSidebar();

    // No fake "General Knowledge" notebook pretending to exist
    expect(screen.queryByText("General Knowledge")).toBeNull();

    // Notebooks section item must NOT be a link to /app/notes or /app
    const notebooksItems = screen.getAllByText("Notebooks");
    // Find the item with aria-disabled
    const disabledNotebookItem = notebooksItems
      .map((el) => el.closest("[aria-disabled='true']"))
      .find((el) => el !== null);

    expect(disabledNotebookItem).not.toBeNull();
    expect(disabledNotebookItem?.closest("a")).toBeNull();
    expect(within(disabledNotebookItem as HTMLElement).getByText(/soon/i)).toBeDefined();
  });

  it("does not route Settings to workspace home and presents it as an unavailable/planned feature", async () => {
    await renderSidebar();

    // Settings must NOT be a link to /app
    const settingsText = screen.getByText("Settings");
    const settingsContainer = settingsText.closest("[aria-disabled='true']");
    expect(settingsContainer).not.toBeNull();
    expect(settingsContainer?.closest("a")).toBeNull();
    expect(within(settingsContainer as HTMLElement).getByText(/soon/i)).toBeDefined();
  });

  it("does not route Trash to All Notes and presents it as an unavailable/planned feature", async () => {
    await renderSidebar();

    // Trash must NOT be a link to /app/notes
    const trashText = screen.getByText("Trash");
    const trashContainer = trashText.closest("[aria-disabled='true']");
    expect(trashContainer).not.toBeNull();
    expect(trashContainer?.closest("a")).toBeNull();
    expect(within(trashContainer as HTMLElement).getByText(/soon/i)).toBeDefined();
  });

  it("ensures no interactive elements are nested inside links", async () => {
    const { container } = await renderSidebar();

    const allLinks = container.querySelectorAll("a");
    allLinks.forEach((link) => {
      // No buttons or role="button" nested inside links
      expect(link.querySelector("button")).toBeNull();
      expect(link.querySelector("[role='button']")).toBeNull();
    });
  });

  it("invokes mobile close callback when functional links are clicked", async () => {
    const onCloseMobile = vi.fn();
    await renderSidebar({ onCloseMobile });

    const allNotesLink = screen.getByRole("link", { name: /all notes/i });
    const clickEvent1 = new MouseEvent("click", { bubbles: true, cancelable: true });
    clickEvent1.preventDefault();
    allNotesLink.dispatchEvent(clickEvent1);
    expect(onCloseMobile).toHaveBeenCalledTimes(1);

    const favoritesLink = screen.getByRole("link", { name: /favorites/i });
    const clickEvent2 = new MouseEvent("click", { bubbles: true, cancelable: true });
    clickEvent2.preventDefault();
    favoritesLink.dispatchEvent(clickEvent2);
    expect(onCloseMobile).toHaveBeenCalledTimes(2);
  });
});
