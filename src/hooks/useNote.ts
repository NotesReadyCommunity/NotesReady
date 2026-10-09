"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Note, NoteContentFormat } from "@/core/models/note";
import { getNoteRepository } from "@/core/storage";
import { useWorkspace, SaveStatus } from "@/context/WorkspaceContext";
import { HARD_SIZE_LIMIT_BYTES, getContentSizeBytes } from "@/core/utils/limits";

export function useNote(id: string) {
  const {
    setSaveStatus,
    setCurrentNoteTitle,
    setActiveNoteId,
    updateNoteInMemory,
    setRetrySaveHandler,
    deleteNote: contextDelete,
    toggleFavorite: contextToggle,
  } = useWorkspace();

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [format, setFormat] = useState<NoteContentFormat>("plain-text-v1");
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [status, setLocalStatus] = useState<SaveStatus>("saved");

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestDataRef = useRef<{ title: string; content: string; format: NoteContentFormat }>({
    title: "",
    content: "",
    format: "plain-text-v1",
  });
  const noteRef = useRef<Note | null>(null);
  const saveSeqRef = useRef<number>(0);
  const activeIdRef = useRef<string>(id);

  latestDataRef.current = { title, content, format };
  noteRef.current = note;
  activeIdRef.current = id;

  // Stable save function with sequence counter to prevent stale asynchronous overwrites
  const performSave = useCallback(
    async (currentTitle: string, currentContent: string, currentFormat: NoteContentFormat) => {
      const base = noteRef.current;
      const targetId = activeIdRef.current;
      if (!base || base.id !== targetId) return;

      // Check document hard size limit before saving
      const totalBytes = getContentSizeBytes(currentContent);
      if (totalBytes >= HARD_SIZE_LIMIT_BYTES) {
        setLocalStatus("error");
        setSaveStatus("error");
        return;
      }

      const seq = ++saveSeqRef.current;

      try {
        setLocalStatus("saving");
        setSaveStatus("saving");

        const updated: Note = {
          ...base,
          title: currentTitle.trim() || "Untitled note",
          content: currentContent,
          format: currentFormat,
          updatedAt: new Date().toISOString(),
        };

        const repo = getNoteRepository();
        await repo.saveNote(updated);

        // Check if a newer save was initiated or note was switched
        if (seq !== saveSeqRef.current || targetId !== activeIdRef.current) {
          return;
        }

        setNote(updated);
        setCurrentNoteTitle(updated.title);

        const finalStatus: SaveStatus = repo.isDurable ? "saved" : "error";
        setLocalStatus(finalStatus);
        setSaveStatus(finalStatus);

        // Update in-memory reactive state
        updateNoteInMemory(updated);
      } catch (err) {
        if (seq !== saveSeqRef.current || targetId !== activeIdRef.current) {
          return;
        }

        // Privacy rule: Never log private note titles, content, or payloads
        console.error("Storage transaction failed during note save:", {
          error: err instanceof Error ? err.name : "StorageError",
        });

        // Retain unsaved edits intact in memory and update status to error
        setLocalStatus("error");
        setSaveStatus("error");
      }
    },
    [setCurrentNoteTitle, setSaveStatus, updateNoteInMemory]
  );

  // Retry action: saves latest in-memory content without losing modifications
  const retrySave = useCallback(async () => {
    const { title: t, content: c, format: f } = latestDataRef.current;
    await performSave(t, c, f);
  }, [performSave]);

  // Flush pending save immediately
  const flushPendingSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
      const { title: t, content: c, format: f } = latestDataRef.current;
      performSave(t, c, f);
    }
  }, [performSave]);

  // Register retry handler with workspace context
  useEffect(() => {
    setRetrySaveHandler?.(retrySave);
    return () => {
      setRetrySaveHandler?.(null);
    };
  }, [retrySave, setRetrySaveHandler]);

  // Load note on mount or ID change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsNotFound(false);

    // Flush any pending save from previous note before loading new note
    flushPendingSave();

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
          // Legacy plain-text compatibility: if format is undefined, keep format as plain-text-v1
          const initialFormat = loaded.format ?? "plain-text-v1";
          setFormat(initialFormat);
          setCurrentNoteTitle(loaded.title);
          setActiveNoteId(loaded.id);

          const initialStatus: SaveStatus = repo.isDurable ? "saved" : "error";
          setLocalStatus(initialStatus);
          setSaveStatus(initialStatus);
        }
      } catch (err) {
        if (!isMounted) return;
        // Privacy rule: Log only generic error diagnostic info
        console.error("Failed to load note from repository:", {
          error: err instanceof Error ? err.name : "StorageError",
        });
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
  }, [id, setCurrentNoteTitle, setActiveNoteId, setSaveStatus, flushPendingSave]);

  // Debounced auto-save on title change
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      setCurrentNoteTitle(newTitle || "Untitled note");
      setLocalStatus("unsaved");
      setSaveStatus("unsaved");

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        performSave(newTitle, latestDataRef.current.content, latestDataRef.current.format);
      }, 400);
    },
    [performSave, setCurrentNoteTitle, setSaveStatus]
  );

  // Debounced auto-save on rich content change
  // Note: whenever content is edited in Phase 3 rich editor, format is updated to tiptap-json-v1
  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      setFormat("tiptap-json-v1");
      setLocalStatus("unsaved");
      setSaveStatus("unsaved");

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        performSave(latestDataRef.current.title, newContent, "tiptap-json-v1");
      }, 400);
    },
    [performSave, setSaveStatus]
  );

  // Lifecycle flushing: component unmount
  useEffect(() => {
    return () => {
      flushPendingSave();
    };
  }, [flushPendingSave]);

  // Lifecycle flushing: visibilitychange & pagehide
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        flushPendingSave();
      }
    };

    const handlePageHide = () => {
      flushPendingSave();
    };

    if (typeof window !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("pagehide", handlePageHide);
    }

    return () => {
      if (typeof window !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("pagehide", handlePageHide);
      }
    };
  }, [flushPendingSave]);

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
    format,
    isLoading,
    isNotFound,
    status,
    retrySave,
    flushPendingSave,
    handleTitleChange,
    handleContentChange,
    deleteNote: deleteThisNote,
    toggleFavorite,
  };
}
