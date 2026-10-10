"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Note, NoteContentFormat } from "@/core/models/note";
import { getNoteRepository } from "@/core/storage";
import { useWorkspace, SaveStatus } from "@/context/WorkspaceContext";
import { HARD_SIZE_LIMIT_BYTES, getContentSizeBytes } from "@/core/utils/limits";

export function useNote(id: string) {
  const router = useRouter();
  const {
    setSaveStatus,
    setCurrentNoteTitle,
    setActiveNoteId,
    updateNoteInMemory,
    setRetrySaveHandler,
    deleteNote: contextDelete,
    toggleFavorite: contextToggle,
    restoreNote: contextRestore,
    permanentlyDeleteNote: contextHardDelete,
    archiveNote: contextArchive,
    unarchiveNote: contextUnarchive,
  } = useWorkspace();

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [format, setFormat] = useState<NoteContentFormat>("plain-text-v1");
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isTrashed, setIsTrashed] = useState(false);
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

  // In-flight save tracking and committed snapshot tracking to prevent stale saves
  // and ensure in-progress saves during lifecycle unmount/pagehide are properly sequenced.
  const inFlightPromiseRef = useRef<Promise<void> | null>(null);
  const lastCommittedRef = useRef<{ title: string; content: string; format: NoteContentFormat } | null>(null);

  latestDataRef.current = { title, content, format };
  noteRef.current = note;
  activeIdRef.current = id;

  // Stable save function with sequence counter to prevent stale asynchronous overwrites
  const performSave = useCallback(
    async (
      currentTitle: string,
      currentContent: string,
      currentFormat: NoteContentFormat
    ): Promise<void> => {
      const base = noteRef.current;
      const targetId = activeIdRef.current;
      if (!base || base.id !== targetId) return;

      // Trashed notes cannot be edited or autosaved
      if (base.deletedAt !== null) return;

      // Check document hard size limit before saving
      const totalBytes = getContentSizeBytes(currentContent);
      if (totalBytes > HARD_SIZE_LIMIT_BYTES) {
        setLocalStatus("error");
        setSaveStatus("error");
        return;
      }

      const seq = ++saveSeqRef.current;

      setLocalStatus("saving");
      setSaveStatus("saving");

      const saveOperation = (async () => {
        try {
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
          lastCommittedRef.current = {
            title: updated.title,
            content: updated.content,
            format: updated.format ?? "plain-text-v1",
          };

          const finalStatus: SaveStatus = repo.isDurable ? "saved" : "error";
          setLocalStatus(finalStatus);
          setSaveStatus(finalStatus);

          // Update in-memory reactive state
          updateNoteInMemory(updated);
        } catch (err) {
          if (seq !== saveSeqRef.current || targetId !== activeIdRef.current) {
            return;
          }

          // Privacy rule: Never log private note titles, content, or payloads.
          // Only log generic diagnostic error names.
          console.error("Storage transaction failed during note save:", {
            error: err instanceof Error ? err.name : "StorageError",
          });

          // Retain unsaved edits intact in memory and update status to error
          setLocalStatus("error");
          setSaveStatus("error");
        } finally {
          if (seq === saveSeqRef.current) {
            inFlightPromiseRef.current = null;
          }
        }
      })();

      inFlightPromiseRef.current = saveOperation;
      return saveOperation;
    },
    [setCurrentNoteTitle, setSaveStatus, updateNoteInMemory]
  );

  // Retry action: saves latest in-memory content without losing modifications
  const retrySave = useCallback(async () => {
    const { title: t, content: c, format: f } = latestDataRef.current;
    await performSave(t, c, f);
  }, [performSave]);

  // Flush pending save immediately, correctly handling both pending timers and in-flight saves
  const flushPendingSave = useCallback(async (): Promise<void> => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    // If a save is already in-flight:
    if (inFlightPromiseRef.current) {
      try {
        await inFlightPromiseRef.current;
      } catch {
        // In-flight error is handled by performSave's own catch block
      }

      // Re-evaluate whether unsaved edits remain after the in-flight save committed
      const latest = latestDataRef.current;
      const committed = lastCommittedRef.current;
      const stillHasUnsavedEdits =
        !committed ||
        committed.title !== latest.title.trim() ||
        committed.content !== latest.content ||
        committed.format !== latest.format;

      if (stillHasUnsavedEdits && noteRef.current && noteRef.current.deletedAt === null) {
        return await performSave(latest.title, latest.content, latest.format);
      }
      return;
    }

    // No save in-flight, but unsaved edits exist:
    const { title: t, content: c, format: f } = latestDataRef.current;
    const committed = lastCommittedRef.current;
    const hasUnsavedEdits =
      !committed ||
      committed.title !== t.trim() ||
      committed.content !== c ||
      committed.format !== f;

    if (hasUnsavedEdits && noteRef.current && noteRef.current.deletedAt === null) {
      return await performSave(t, c, f);
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
    setIsTrashed(false);

    // Flush any pending save from previous note before loading new note
    flushPendingSave();

    async function load() {
      try {
        const repo = getNoteRepository();
        const loaded = await repo.getNote(id);
        if (!isMounted) return;

        if (!loaded) {
          setIsNotFound(true);
          setIsTrashed(false);
          setNote(null);
        } else if (loaded.deletedAt !== null) {
          // Trashed note: user can view in read-only and restore
          setIsNotFound(false);
          setIsTrashed(true);
          setNote(loaded);
          setTitle(loaded.title);
          setContent(loaded.content);
          const initialFormat = loaded.format ?? "plain-text-v1";
          setFormat(initialFormat);
          setCurrentNoteTitle(loaded.title);
          setActiveNoteId(loaded.id);
          setLocalStatus("saved");
          setSaveStatus("saved");
        } else {
          setIsNotFound(false);
          setIsTrashed(false);
          setNote(loaded);
          setTitle(loaded.title);
          setContent(loaded.content);
          // Legacy plain-text compatibility: if format is undefined, keep format as plain-text-v1
          const initialFormat = loaded.format ?? "plain-text-v1";
          setFormat(initialFormat);
          setCurrentNoteTitle(loaded.title);
          setActiveNoteId(loaded.id);
          lastCommittedRef.current = {
            title: loaded.title,
            content: loaded.content,
            format: initialFormat,
          };

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

  // Debounced auto-save on rich content change (format becomes tiptap-json-v1)
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

  // Debounced auto-save on plain-text fallback content change (format remains plain-text-v1)
  const handleFallbackContentChange = useCallback(
    (newPlainText: string) => {
      setContent(newPlainText);
      setFormat("plain-text-v1");
      setLocalStatus("unsaved");
      setSaveStatus("unsaved");

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        performSave(latestDataRef.current.title, newPlainText, "plain-text-v1");
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

  // Phase 4 restore and permanent delete actions
  const handleRestoreNote = useCallback(async () => {
    await contextRestore(id);
    setIsTrashed(false);
    const repo = getNoteRepository();
    const reloaded = await repo.getNote(id);
    if (reloaded) {
      setNote(reloaded);
    }
  }, [contextRestore, id]);

  const handlePermanentDelete = useCallback(async () => {
    await contextHardDelete(id);
    router.push("/app/trash");
  }, [contextHardDelete, id, router]);

  const handleToggleArchive = useCallback(async () => {
    if (!note) return;
    if (note.archivedAt) {
      await contextUnarchive(id);
      setNote({ ...note, archivedAt: null });
    } else {
      await contextArchive(id);
      setNote({ ...note, archivedAt: new Date().toISOString() });
    }
  }, [contextArchive, contextUnarchive, id, note]);

  const setNotebookId = useCallback(
    async (nbId: string | null) => {
      if (!note) return;
      const repo = getNoteRepository();
      const updated = { ...note, notebookId: nbId, updatedAt: new Date().toISOString() };
      await repo.saveNote(updated);
      setNote(updated);
      updateNoteInMemory(updated);
    },
    [note, updateNoteInMemory]
  );

  const setTags = useCallback(
    async (newTags: string[]) => {
      if (!note) return;
      const repo = getNoteRepository();
      const updated = { ...note, tags: newTags, updatedAt: new Date().toISOString() };
      await repo.saveNote(updated);
      setNote(updated);
      updateNoteInMemory(updated);
    },
    [note, updateNoteInMemory]
  );

  return {
    note,
    title,
    content,
    format,
    isLoading,
    isNotFound,
    isTrashed,
    status,
    retrySave,
    flushPendingSave,
    handleTitleChange,
    handleContentChange,
    handleFallbackContentChange,
    deleteNote: deleteThisNote,
    toggleFavorite,
    restoreNote: handleRestoreNote,
    permanentlyDeleteNote: handlePermanentDelete,
    toggleArchive: handleToggleArchive,
    setNotebookId,
    setTags,
  };
}
