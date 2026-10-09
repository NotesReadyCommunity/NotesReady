import { NoteRepository } from "./types";
import { IndexedDBNoteRepository } from "./indexeddb";
import { MemoryNoteRepository } from "./memory";

let storageInstance: NoteRepository | null = null;
let storageError: string | null = null;

export function getStorageError(): string | null {
  return storageError;
}

export function setNoteRepository(repo: NoteRepository | null): void {
  storageInstance = repo;
  storageError = null;
}

export function getNoteRepository(): NoteRepository {
  if (storageInstance) {
    return storageInstance;
  }

  // Non-browser / SSR environment: safe in-memory fallback
  if (typeof window === "undefined") {
    storageInstance = new MemoryNoteRepository();
    return storageInstance;
  }

  // Browser environment: verify IndexedDB availability
  if (!window.indexedDB) {
    storageError = "Storage unavailable — notes cannot currently be persisted across reloads.";
    storageInstance = new MemoryNoteRepository();
    return storageInstance;
  }

  try {
    storageInstance = new IndexedDBNoteRepository();
    storageError = null;
    return storageInstance;
  } catch (err) {
    storageError = err instanceof Error ? err.message : "Storage unavailable — notes cannot currently be persisted across reloads.";
    storageInstance = new MemoryNoteRepository();
    return storageInstance;
  }
}


export * from "./types";
export * from "./memory";
export * from "./indexeddb";
