import { Note } from "../models/note";

export interface NoteRepository {
  getNote(id: string): Promise<Note | null>;
  saveNote(note: Note): Promise<void>;
  listNotes(): Promise<Note[]>;
  listRecentNotes(limit?: number): Promise<Note[]>;
  deleteNote(id: string): Promise<void>; // soft-delete
  hardDeleteNote(id: string): Promise<void>;
  readonly isDurable: boolean;
}

