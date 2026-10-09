import { Note } from "../models/note";
import { NoteRepository } from "./types";
import { isNote } from "../validation/note";

export class MemoryNoteRepository implements NoteRepository {
  readonly isDurable = false;
  private notes: Map<string, Note> = new Map();


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
      .filter((n) => n.deletedAt === null)
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

  // Helper for test cleanup/inspection
  clear(): void {
    this.notes.clear();
  }
}
