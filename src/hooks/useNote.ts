"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Note } from "@/core/models/note";
import { getNoteRepository } from "@/core/storage";
import { useWorkspace, SaveStatus } from "@/context/WorkspaceContext";

export function useNote(id: string) {
  const {
    setSaveStatus,
    setCurrentNoteTitle,
    setActiveNoteId,
    updateNoteInMemory,
    deleteNote: contextDelete,
    toggleFavorite: contextToggle,
  } = useWorkspace();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [status, setLocalStatus] = useState<SaveStatus>("saved");

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestDataRef = useRef({ title: "", content: "" });
  const noteRef = useRef<Note | null>(null);

  latestDataRef.current = { title, content };
  noteRef.current = note;

  // Load note on mount / id change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsNotFound(false);

    async function load() {
      try {
        const repo = getNoteRepository();
        const loaded = await repo.getNote(id);
        if (!isMounted) return;

        if (!loaded || loaded.deletedAt !== null) {
          setIsNotFound(true);
          setNote(null);
        } else {
          setNote(loaded);
          setTitle(loaded.title);
          setContent(loaded.content);
          setCurrentNoteTitle(loaded.title);
          setActiveNoteId(loaded.id);

          const initialStatus: SaveStatus = repo.isDurable ? "saved" : "error";
          setLocalStatus(initialStatus);
          setSaveStatus(initialStatus);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error loading note", err);
        setLocalStatus("error");
        setSaveStatus("error");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [id, setCurrentNoteTitle, setActiveNoteId, setSaveStatus]);

  // Stable save function using noteRef to prevent unmount cycle triggers (P2 Fix #6)
  const performSave = useCallback(
    async (currentTitle: string, currentContent: string) => {
      const base = noteRef.current;
      if (!base) return;

      try {
        setLocalStatus("saving");
        setSaveStatus("saving");

        const updated: Note = {
          ...base,
          title: currentTitle.trim() || "Untitled note",
          content: currentContent,
          updatedAt: new Date().toISOString(),
        };

        const repo = getNoteRepository();
        await repo.saveNote(updated);

        setNote(updated);
        setCurrentNoteTitle(updated.title);

        const finalStatus: SaveStatus = repo.isDurable ? "saved" : "error";
        setLocalStatus(finalStatus);
        setSaveStatus(finalStatus);

        // Update in-memory reactive state without full repository scan
        updateNoteInMemory(updated);
      } catch (err) {
        console.error("Failed to save note", err);
        setLocalStatus("error");
        setSaveStatus("error");
      }
    },
    [setCurrentNoteTitle, setSaveStatus, updateNoteInMemory]
  );

  // Debounced auto-save effect
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      setCurrentNoteTitle(newTitle || "Untitled note");
      setLocalStatus("unsaved");
      setSaveStatus("unsaved");

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        performSave(newTitle, latestDataRef.current.content);
      }, 400);
    },
    [performSave, setCurrentNoteTitle, setSaveStatus]
  );

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      setLocalStatus("unsaved");
      setSaveStatus("unsaved");

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        performSave(latestDataRef.current.title, newContent);
      }, 400);
    },
    [performSave, setSaveStatus]
  );

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        const { title: t, content: c } = latestDataRef.current;
        performSave(t, c);
      }
    };
  }, [performSave]);


  const deleteThisNote = useCallback(async () => {
    await contextDelete(id);
  }, [contextDelete, id]);

  const toggleFavorite = useCallback(async () => {
    await contextToggle(id);
    if (note) {
      setNote({ ...note, isFavorite: !note.isFavorite });
    }
  }, [contextToggle, id, note]);

  return {
    note,
    title,
    content,
    isLoading,
    isNotFound,
    status,
    handleTitleChange,
    handleContentChange,
    deleteNote: deleteThisNote,
    toggleFavorite,
  };
}
