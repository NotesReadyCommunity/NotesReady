export type NoteContentFormat = "plain-text-v1" | "tiptap-json-v1";

export interface Note {
  id: string;
  title: string;
  content: string;
  format?: NoteContentFormat;
  notebookId?: string | null;
  tags?: string[];
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  deletedAt: string | null;
}

export interface CreateNoteInput {
  id?: string;
  title?: string;
  content?: string;
  format?: NoteContentFormat;
  notebookId?: string | null;
  tags?: string[];
  archivedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  isFavorite?: boolean;
  deletedAt?: string | null;
}

export function createEmptyNote(input?: CreateNoteInput): Note {
  const now = new Date().toISOString();
  return {
    id: input?.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`),
    title: input?.title?.trim() || "Untitled note",
    content: input?.content ?? "",
    format: input?.format ?? "tiptap-json-v1",
    notebookId: input?.notebookId ?? null,
    tags: input?.tags ?? [],
    archivedAt: input?.archivedAt ?? null,
    createdAt: input?.createdAt || now,
    updatedAt: input?.updatedAt || now,
    isFavorite: input?.isFavorite ?? false,
    deletedAt: input?.deletedAt ?? null,
  };
}
