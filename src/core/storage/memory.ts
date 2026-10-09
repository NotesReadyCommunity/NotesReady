import { Note } from "../models/note";
import { Notebook } from "../models/notebook";
import { NoteRepository } from "./types";
import { isNote } from "../validation/note";
import { isNotebook } from "../validation/notebook";

export class MemoryNoteRepository implements NoteRepository {
  readonly isDurable: boolean = false;
  private notes: Map<string, Note> = new Map();
  private notebooks: Map<string, Notebook> = new Map();

  async getNote(id: string): Promise<Note | null> {
    const note = this.notes.get(id);
    if (!note) return null;
    return { ...note };
  }

  async saveNote(note: Note): Promise<void> {
    if (!isNote(note)) {
      throw new Error("Invalid note data provided for storage");
    }
    this.notes.set(note.id, { ...note });
  }

  async listNotes(): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter((n) => n.deletedAt === null && (!n.archivedAt || n.archivedAt === null))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async listRecentNotes(limit = 10): Promise<Note[]> {
    const all = await this.listNotes();
    return all.slice(0, limit);
  }

  async deleteNote(id: string): Promise<void> {
    const note = this.notes.get(id);
    if (note) {
      this.notes.set(id, {
        ...note,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async hardDeleteNote(id: string): Promise<void> {
    this.notes.delete(id);
  }

  async restoreNote(id: string): Promise<void> {
    const note = this.notes.get(id);
    if (note) {
      this.notes.set(id, {
        ...note,
        deletedAt: null,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async listTrashedNotes(): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter((n) => n.deletedAt !== null)
      .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? ""));
  }

  async archiveNote(id: string): Promise<void> {
    const note = this.notes.get(id);
    if (note) {
      this.notes.set(id, {
        ...note,
        archivedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async unarchiveNote(id: string): Promise<void> {
    const note = this.notes.get(id);
    if (note) {
      this.notes.set(id, {
        ...note,
        archivedAt: null,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async listArchivedNotes(): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter((n) => n.deletedAt === null && n.archivedAt !== null)
      .sort((a, b) => (b.archivedAt ?? "").localeCompare(a.archivedAt ?? ""));
  }

  async listNotesByNotebook(notebookId: string): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter(
        (n) =>
          n.deletedAt === null &&
          (!n.archivedAt || n.archivedAt === null) &&
          n.notebookId === notebookId
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async listNotesByTag(tag: string): Promise<Note[]> {
    const normalizedTag = tag.toLowerCase().trim();
    return Array.from(this.notes.values())
      .filter(
        (n) =>
          n.deletedAt === null &&
          (!n.archivedAt || n.archivedAt === null) &&
          n.tags &&
          n.tags.some((t) => t.toLowerCase().trim() === normalizedTag)
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  // Notebook methods
  async getNotebook(id: string): Promise<Notebook | null> {
    const nb = this.notebooks.get(id);
    if (!nb) return null;
    return { ...nb };
  }

  async saveNotebook(notebook: Notebook): Promise<void> {
    if (!isNotebook(notebook)) {
      throw new Error("Invalid notebook data provided for storage");
    }
    this.notebooks.set(notebook.id, { ...notebook });
  }

  async listNotebooks(): Promise<Notebook[]> {
    return Array.from(this.notebooks.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  async deleteNotebook(id: string): Promise<void> {
    this.notebooks.delete(id);
    // Unassign notes belonging to this notebook (data safety decision: do not delete notes)
    for (const [noteId, note] of this.notes.entries()) {
      if (note.notebookId === id) {
        this.notes.set(noteId, {
          ...note,
          notebookId: null,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  // Helper for test cleanup/inspection
  clear(): void {
    this.notes.clear();
    this.notebooks.clear();
  }
}
