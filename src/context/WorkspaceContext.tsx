"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Note, createEmptyNote } from "@/core/models/note";
import { Notebook, createEmptyNotebook } from "@/core/models/notebook";
import { getNoteRepository, getStorageError } from "@/core/storage";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

interface WorkspaceContextValue {
  notes: Note[];
  recentNotes: Note[];
  favoriteNotes: Note[];
  notebooks: Notebook[];
  trashedNotes: Note[];
  archivedNotes: Note[];
  isLoading: boolean;
  activeNoteId: string | null;
  saveStatus: SaveStatus;
  currentNoteTitle: string;
  isStorageDurable: boolean;
  storageError: string | null;
  retrySave?: () => Promise<void>;
  setRetrySaveHandler: (fn: (() => Promise<void>) | null) => void;
  createNote: (input?: { notebookId?: string | null; tags?: string[] }) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
  updateNoteInMemory: (updatedNote: Note) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setCurrentNoteTitle: (title: string) => void;
  setActiveNoteId: (id: string | null) => void;

  // Phase 4 Organization Actions
  createNotebook: (name: string) => Promise<Notebook>;
  renameNotebook: (id: string, name: string) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  permanentlyDeleteNote: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  archiveNote: (id: string) => Promise<void>;
  unarchiveNote: (id: string) => Promise<void>;
  moveNoteToNotebook: (noteId: string, notebookId: string | null) => Promise<void>;
  setNoteTags: (noteId: string, tags: string[]) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [trashedNotes, setTrashedNotes] = useState<Note[]>([]);
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [currentNoteTitle, setCurrentNoteTitle] = useState("Workspace");
  const [isStorageDurable, setIsStorageDurable] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [retryHandler, setRetryHandler] = useState<(() => Promise<void>) | null>(null);

  const refreshNotes = useCallback(async () => {
    try {
      const repo = getNoteRepository();
      const durable = repo.isDurable;
      setIsStorageDurable(durable);

      const initErr = getStorageError();
      if (!durable && typeof window !== "undefined") {
        setStorageError(initErr || "Storage unavailable — notes cannot currently be persisted across reloads.");
        setSaveStatus("error");
      } else {
        setStorageError(null);
      }

      const [allNotes, recents, allNotebooks, trashed, archived] = await Promise.all([
        repo.listNotes(),
        repo.listRecentNotes(6),
        repo.listNotebooks(),
        repo.listTrashedNotes(),
        repo.listArchivedNotes(),
      ]);

      setNotes(allNotes);
      setRecentNotes(recents);
      setNotebooks(allNotebooks);
      setTrashedNotes(trashed);
      setArchivedNotes(archived);
    } catch (err) {
      console.error("Failed to load notes from storage:", {
        error: err instanceof Error ? err.name : "StorageError",
      });
      setIsStorageDurable(false);
      setStorageError("Failed to access local storage.");
      setSaveStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  // Optimized in-memory note update to avoid full repository re-queries on every keystroke autosave
  const updateNoteInMemory = useCallback((updatedNote: Note) => {
    setNotes((prevNotes) => {
      // If note was trashed or archived, filter it out from active notes list
      if (updatedNote.deletedAt !== null || (updatedNote.archivedAt && updatedNote.archivedAt !== null)) {
        return prevNotes.filter((n) => n.id !== updatedNote.id);
      }

      const idx = prevNotes.findIndex((n) => n.id === updatedNote.id);
      if (idx === -1) {
        return [updatedNote, ...prevNotes];
      }
      const newNotes = [...prevNotes];
      newNotes[idx] = updatedNote;
      return newNotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });

    setRecentNotes((prevRecents) => {
      if (updatedNote.deletedAt !== null || (updatedNote.archivedAt && updatedNote.archivedAt !== null)) {
        return prevRecents.filter((n) => n.id !== updatedNote.id);
      }
      const existing = prevRecents.filter((n) => n.id !== updatedNote.id);
      return [updatedNote, ...existing].slice(0, 6);
    });
  }, []);

  const createNote = useCallback(
    async (input?: { notebookId?: string | null; tags?: string[] }): Promise<Note> => {
      const repo = getNoteRepository();
      const newNote = createEmptyNote({
        notebookId: input?.notebookId ?? null,
        tags: input?.tags ?? [],
      });
      await repo.saveNote(newNote);
      await refreshNotes();
      setActiveNoteId(newNote.id);
      setCurrentNoteTitle(newNote.title);
      setSaveStatus(repo.isDurable ? "saved" : "error");
      router.push(`/app/notes/${newNote.id}`);
      return newNote;
    },
    [refreshNotes, router]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      const repo = getNoteRepository();
      await repo.deleteNote(id);
      await refreshNotes();
      setActiveNoteId((prev) => (prev === id ? null : prev));
      setCurrentNoteTitle("All Notes");
      router.push("/app/notes");
    },
    [refreshNotes, router]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const repo = getNoteRepository();
      const note = await repo.getNote(id);
      if (note) {
        const updated: Note = {
          ...note,
          isFavorite: !note.isFavorite,
          updatedAt: new Date().toISOString(),
        };
        await repo.saveNote(updated);
        await refreshNotes();
      }
    },
    [refreshNotes]
  );

  // Phase 4 Notebook actions
  const createNotebook = useCallback(
    async (name: string): Promise<Notebook> => {
      const repo = getNoteRepository();
      const nb = createEmptyNotebook({ name });
      await repo.saveNotebook(nb);
      await refreshNotes();
      return nb;
    },
    [refreshNotes]
  );

  const renameNotebook = useCallback(
    async (id: string, name: string) => {
      const repo = getNoteRepository();
      const existing = await repo.getNotebook(id);
      if (existing) {
        const updated: Notebook = {
          ...existing,
          name: name.trim() || existing.name,
          updatedAt: new Date().toISOString(),
        };
        await repo.saveNotebook(updated);
        await refreshNotes();
      }
    },
    [refreshNotes]
  );

  const deleteNotebook = useCallback(
    async (id: string) => {
      const repo = getNoteRepository();
      await repo.deleteNotebook(id);
      await refreshNotes();
    },
    [refreshNotes]
  );

  // Phase 4 Trash actions
  const restoreNote = useCallback(
    async (id: string) => {
      const repo = getNoteRepository();
      await repo.restoreNote(id);
      await refreshNotes();
    },
    [refreshNotes]
  );

  const permanentlyDeleteNote = useCallback(
    async (id: string) => {
      const repo = getNoteRepository();
      await repo.hardDeleteNote(id);
      await refreshNotes();
    },
    [refreshNotes]
  );

  const emptyTrash = useCallback(async () => {
    const repo = getNoteRepository();
    const trashed = await repo.listTrashedNotes();
    await Promise.all(trashed.map((n) => repo.hardDeleteNote(n.id)));
    await refreshNotes();
  }, [refreshNotes]);

  // Phase 4 Archive actions
  const archiveNote = useCallback(
    async (id: string) => {
      const repo = getNoteRepository();
      await repo.archiveNote(id);
      await refreshNotes();
    },
    [refreshNotes]
  );

  const unarchiveNote = useCallback(
    async (id: string) => {
      const repo = getNoteRepository();
      await repo.unarchiveNote(id);
      await refreshNotes();
    },
    [refreshNotes]
  );

  // Move note to notebook
  const moveNoteToNotebook = useCallback(
    async (noteId: string, notebookId: string | null) => {
      const repo = getNoteRepository();
      const note = await repo.getNote(noteId);
      if (note) {
        const updated: Note = {
          ...note,
          notebookId,
          updatedAt: new Date().toISOString(),
        };
        await repo.saveNote(updated);
        await refreshNotes();
      }
    },
    [refreshNotes]
  );

  // Set note tags
  const setNoteTags = useCallback(
    async (noteId: string, tags: string[]) => {
      const repo = getNoteRepository();
      const note = await repo.getNote(noteId);
      if (note) {
        const updated: Note = {
          ...note,
          tags,
          updatedAt: new Date().toISOString(),
        };
        await repo.saveNote(updated);
        await refreshNotes();
      }
    },
    [refreshNotes]
  );

  const favoriteNotes = notes.filter((n) => n.isFavorite);

  return (
    <WorkspaceContext.Provider
      value={{
        notes,
        recentNotes,
        favoriteNotes,
        notebooks,
        trashedNotes,
        archivedNotes,
        isLoading,
        activeNoteId,
        saveStatus,
        currentNoteTitle,
        isStorageDurable,
        storageError,
        retrySave: retryHandler ?? undefined,
        setRetrySaveHandler: setRetryHandler,
        createNote,
        deleteNote,
        toggleFavorite,
        refreshNotes,
        updateNoteInMemory,
        setSaveStatus,
        setCurrentNoteTitle,
        setActiveNoteId,
        createNotebook,
        renameNotebook,
        deleteNotebook,
        restoreNote,
        permanentlyDeleteNote,
        emptyTrash,
        archiveNote,
        unarchiveNote,
        moveNoteToNotebook,
        setNoteTags,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return ctx;
}
