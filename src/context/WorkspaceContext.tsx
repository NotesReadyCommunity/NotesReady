"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Note, createEmptyNote } from "@/core/models/note";
import { getNoteRepository, getStorageError } from "@/core/storage";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

interface WorkspaceContextValue {
  notes: Note[];
  recentNotes: Note[];
  favoriteNotes: Note[];
  isLoading: boolean;
  activeNoteId: string | null;
  saveStatus: SaveStatus;
  currentNoteTitle: string;
  isStorageDurable: boolean;
  storageError: string | null;
  createNote: () => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
  updateNoteInMemory: (updatedNote: Note) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setCurrentNoteTitle: (title: string) => void;
  setActiveNoteId: (id: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [currentNoteTitle, setCurrentNoteTitle] = useState("Workspace");
  const [isStorageDurable, setIsStorageDurable] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);

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

      const [allNotes, recents] = await Promise.all([
        repo.listNotes(),
        repo.listRecentNotes(6),
      ]);

      setNotes(allNotes);
      setRecentNotes(recents);
    } catch (err) {
      console.error("Failed to load notes from storage", err);
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

  // Optimized in-memory note update to avoid full repository re-queries on every keystroke autosave (P2 Fix #6)
  const updateNoteInMemory = useCallback((updatedNote: Note) => {
    setNotes((prevNotes) => {
      const idx = prevNotes.findIndex((n) => n.id === updatedNote.id);
      if (idx === -1) {
        return [updatedNote, ...prevNotes];
      }
      const newNotes = [...prevNotes];
      newNotes[idx] = updatedNote;
      return newNotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });

    setRecentNotes((prevRecents) => {
      const existing = prevRecents.filter((n) => n.id !== updatedNote.id);
      return [updatedNote, ...existing].slice(0, 6);
    });
  }, []);

  const createNote = useCallback(async (): Promise<Note> => {
    const repo = getNoteRepository();
    const newNote = createEmptyNote();
    await repo.saveNote(newNote);
    await refreshNotes();
    setActiveNoteId(newNote.id);
    setCurrentNoteTitle(newNote.title);
    setSaveStatus(repo.isDurable ? "saved" : "error");
    router.push(`/app/notes/${newNote.id}`);
    return newNote;
  }, [refreshNotes, router]);

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

  const favoriteNotes = notes.filter((n) => n.isFavorite);

  return (
    <WorkspaceContext.Provider
      value={{
        notes,
        recentNotes,
        favoriteNotes,
        isLoading,
        activeNoteId,
        saveStatus,
        currentNoteTitle,
        isStorageDurable,
        storageError,
        createNote,
        deleteNote,
        toggleFavorite,
        refreshNotes,
        updateNoteInMemory,
        setSaveStatus,
        setCurrentNoteTitle,
        setActiveNoteId,
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

