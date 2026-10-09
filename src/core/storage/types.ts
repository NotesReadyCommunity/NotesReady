import { Note } from "../models/note";
import { Notebook } from "../models/notebook";

export interface NoteRepository {
  getNote(id: string): Promise<Note | null>;
  saveNote(note: Note): Promise<void>;
  listNotes(): Promise<Note[]>;
  listRecentNotes(limit?: number): Promise<Note[]>;
  deleteNote(id: string): Promise<void>; // soft-delete
  hardDeleteNote(id: string): Promise<void>;
  restoreNote(id: string): Promise<void>;
  listTrashedNotes(): Promise<Note[]>;
  archiveNote(id: string): Promise<void>;
  unarchiveNote(id: string): Promise<void>;
  listArchivedNotes(): Promise<Note[]>;
  listNotesByNotebook(notebookId: string): Promise<Note[]>;
  listNotesByTag(tag: string): Promise<Note[]>;

  // Notebook methods
  getNotebook(id: string): Promise<Notebook | null>;
  saveNotebook(notebook: Notebook): Promise<void>;
  listNotebooks(): Promise<Notebook[]>;
  deleteNotebook(id: string): Promise<void>;

  readonly isDurable: boolean;
}

