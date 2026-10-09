export type NoteContentFormat = "plain-text-v1" | "tiptap-json-v1";

export interface Note {
  id: string;
  title: string;
  content: string;
  format?: NoteContentFormat;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  deletedAt: string | null;
}

export interface CreateNoteInput {
  title?: string;
  content?: string;
  format?: NoteContentFormat;
}

export function createEmptyNote(input?: CreateNoteInput): Note {
  const now = new Date().toISOString();
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: input?.title?.trim() || "Untitled note",
    content: input?.content ?? "",
    format: input?.format ?? "tiptap-json-v1",
    createdAt: now,
    updatedAt: now,
    isFavorite: false,
    deletedAt: null,
  };
}
