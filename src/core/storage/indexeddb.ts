import { Note } from "../models/note";
import { NoteRepository } from "./types";
import { isNote } from "../validation/note";

const DB_NAME = "notesready-db";
const DB_VERSION = 1;
const STORE_NAME = "notes";

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
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
            store.createIndex("updatedAt", "updatedAt", { unique: false });
            store.createIndex("isFavorite", "isFavorite", { unique: false });
            store.createIndex("deletedAt", "deletedAt", { unique: false });
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
          if (isNote(result)) {
            resolve(result);
          } else {
            resolve(null);
          }
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
            .filter(isNote)
            .filter((n) => n.deletedAt === null)
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
}

