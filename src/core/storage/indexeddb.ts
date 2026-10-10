import { Note } from "../models/note";
import { Notebook } from "../models/notebook";
import { NoteRepository } from "./types";
import { isNote, sanitizeNote } from "../validation/note";
import { isNotebook, sanitizeNotebook } from "../validation/notebook";

const DB_NAME = "notesready-db";
const DB_VERSION = 2;
const STORE_NAME = "notes";
const NOTEBOOKS_STORE = "notebooks";

export class IndexedDBNoteRepository implements NoteRepository {
  readonly isDurable = true;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (typeof window === "undefined" || !window.indexedDB) {
      throw new Error("IndexedDB is not available in current environment");
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const tx = (event.target as IDBOpenDBRequest).transaction;

          // Notes store
          let notesStore: IDBObjectStore;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            notesStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
            notesStore.createIndex("updatedAt", "updatedAt", { unique: false });
            notesStore.createIndex("isFavorite", "isFavorite", { unique: false });
            notesStore.createIndex("deletedAt", "deletedAt", { unique: false });
          } else if (tx) {
            notesStore = tx.objectStore(STORE_NAME);
          } else {
            return;
          }

          // Version 2 additions for notes:
          if (!notesStore.indexNames.contains("notebookId")) {
            notesStore.createIndex("notebookId", "notebookId", { unique: false });
          }
          if (!notesStore.indexNames.contains("archivedAt")) {
            notesStore.createIndex("archivedAt", "archivedAt", { unique: false });
          }

          // Version 2 additions for notebooks:
          if (!db.objectStoreNames.contains(NOTEBOOKS_STORE)) {
            const nbStore = db.createObjectStore(NOTEBOOKS_STORE, { keyPath: "id" });
            nbStore.createIndex("updatedAt", "updatedAt", { unique: false });
            nbStore.createIndex("name", "name", { unique: false });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          this.dbPromise = null;
          reject(request.error || new Error("Failed to open IndexedDB"));
        };
      });
    }

    return this.dbPromise;
  }

  async getNote(id: string): Promise<Note | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => {
          const result = req.result;
          const sanitized = sanitizeNote(result);
          resolve(sanitized);
        };
        req.onerror = () => reject(req.error || new Error("Failed to read note from IndexedDB"));
      });
    } catch {
      return null;
    }
  }

  async saveNote(note: Note): Promise<void> {
    if (!isNote(note)) {
      throw new Error("Invalid note payload; cannot save to IndexedDB");
    }

    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(note);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction failed while saving note"));
      tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted while saving note"));
    });
  }

  async listNotes(): Promise<Note[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const results: unknown[] = req.result || [];
          const validNotes = results
            .map(sanitizeNote)
            .filter((n): n is Note => n !== null)
            .filter((n) => n.deletedAt === null && (!n.archivedAt || n.archivedAt === null))
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          resolve(validNotes);
        };
        req.onerror = () => reject(req.error || new Error("Failed to list notes from IndexedDB"));
      });
    } catch {
      return [];
    }
  }

  async listRecentNotes(limit = 10): Promise<Note[]> {
    const all = await this.listNotes();
    return all.slice(0, limit);
  }

  async deleteNote(id: string): Promise<void> {
    const existing = await this.getNote(id);
    if (!existing) return;

    const updated: Note = {
      ...existing,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.saveNote(updated);
  }

  async hardDeleteNote(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction failed while deleting note"));
      tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted while deleting note"));
    });
  }

  async restoreNote(id: string): Promise<void> {
    const existing = await this.getNote(id);
    if (!existing) return;

    const updated: Note = {
      ...existing,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    };
    await this.saveNote(updated);
  }

  async listTrashedNotes(): Promise<Note[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const results: unknown[] = req.result || [];
          const trashed = results
            .map(sanitizeNote)
            .filter((n): n is Note => n !== null)
            .filter((n) => n.deletedAt !== null)
            .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? ""));
          resolve(trashed);
        };
        req.onerror = () => reject(req.error || new Error("Failed to list trashed notes from IndexedDB"));
      });
    } catch {
      return [];
    }
  }

  async archiveNote(id: string): Promise<void> {
    const existing = await this.getNote(id);
    if (!existing) return;

    const updated: Note = {
      ...existing,
      archivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.saveNote(updated);
  }

  async unarchiveNote(id: string): Promise<void> {
    const existing = await this.getNote(id);
    if (!existing) return;

    const updated: Note = {
      ...existing,
      archivedAt: null,
      updatedAt: new Date().toISOString(),
    };
    await this.saveNote(updated);
  }

  async listArchivedNotes(): Promise<Note[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const results: unknown[] = req.result || [];
          const archived = results
            .map(sanitizeNote)
            .filter((n): n is Note => n !== null)
            .filter((n) => n.deletedAt === null && n.archivedAt !== null)
            .sort((a, b) => (b.archivedAt ?? "").localeCompare(a.archivedAt ?? ""));
          resolve(archived);
        };
        req.onerror = () => reject(req.error || new Error("Failed to list archived notes from IndexedDB"));
      });
    } catch {
      return [];
    }
  }

  async listNotesByNotebook(notebookId: string): Promise<Note[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const results: unknown[] = req.result || [];
          const notebookNotes = results
            .map(sanitizeNote)
            .filter((n): n is Note => n !== null)
            .filter(
              (n) =>
                n.deletedAt === null &&
                (!n.archivedAt || n.archivedAt === null) &&
                n.notebookId === notebookId
            )
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          resolve(notebookNotes);
        };
        req.onerror = () => reject(req.error || new Error("Failed to list notebook notes from IndexedDB"));
      });
    } catch {
      return [];
    }
  }

  async listNotesByTag(tag: string): Promise<Note[]> {
    const normalizedTag = tag.toLowerCase().trim();
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const results: unknown[] = req.result || [];
          const taggedNotes = results
            .map(sanitizeNote)
            .filter((n): n is Note => n !== null)
            .filter(
              (n) =>
                n.deletedAt === null &&
                (!n.archivedAt || n.archivedAt === null) &&
                n.tags &&
                n.tags.some((t) => t.toLowerCase().trim() === normalizedTag)
            )
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          resolve(taggedNotes);
        };
        req.onerror = () => reject(req.error || new Error("Failed to list tagged notes from IndexedDB"));
      });
    } catch {
      return [];
    }
  }

  // Notebook methods
  async getNotebook(id: string): Promise<Notebook | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(NOTEBOOKS_STORE, "readonly");
        const store = tx.objectStore(NOTEBOOKS_STORE);
        const req = store.get(id);

        req.onsuccess = () => {
          const result = req.result;
          const sanitized = sanitizeNotebook(result);
          resolve(sanitized);
        };
        req.onerror = () => reject(req.error || new Error("Failed to read notebook from IndexedDB"));
      });
    } catch {
      return null;
    }
  }

  async saveNotebook(notebook: Notebook): Promise<void> {
    if (!isNotebook(notebook)) {
      throw new Error("Invalid notebook payload; cannot save to IndexedDB");
    }

    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(NOTEBOOKS_STORE, "readwrite");
      const store = tx.objectStore(NOTEBOOKS_STORE);
      store.put(notebook);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction failed while saving notebook"));
      tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted while saving notebook"));
    });
  }

  async listNotebooks(): Promise<Notebook[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(NOTEBOOKS_STORE, "readonly");
        const store = tx.objectStore(NOTEBOOKS_STORE);
        const req = store.getAll();

        req.onsuccess = () => {
          const results: unknown[] = req.result || [];
          const valid = results
            .map(sanitizeNotebook)
            .filter((nb): nb is Notebook => nb !== null)
            .sort((a, b) => a.name.localeCompare(b.name));
          resolve(valid);
        };
        req.onerror = () => reject(req.error || new Error("Failed to list notebooks from IndexedDB"));
      });
    } catch {
      return [];
    }
  }

  async deleteNotebook(id: string): Promise<void> {
    const db = await this.getDB();

    // In a single multi-store transaction, delete notebook and unassign affected notes
    return new Promise((resolve, reject) => {
      const tx = db.transaction([NOTEBOOKS_STORE, STORE_NAME], "readwrite");
      const nbStore = tx.objectStore(NOTEBOOKS_STORE);
      const noteStore = tx.objectStore(STORE_NAME);

      nbStore.delete(id);

      // Unassign affected notes
      const notesReq = noteStore.getAll();
      notesReq.onsuccess = () => {
        const notes: unknown[] = notesReq.result || [];
        for (const raw of notes) {
          if (isNote(raw) && raw.notebookId === id) {
            const updated: Note = {
              ...raw,
              notebookId: null,
              updatedAt: new Date().toISOString(),
            };
            noteStore.put(updated);
          }
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction failed while deleting notebook"));
      tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted while deleting notebook"));
    });
  }
}
