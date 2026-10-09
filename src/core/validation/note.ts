import { Note, NoteContentFormat } from "../models/note";

const VALID_FORMATS: ReadonlySet<string> = new Set<NoteContentFormat>([
  "plain-text-v1",
  "tiptap-json-v1",
]);

export function isNote(data: unknown): data is Note {
  if (!data || typeof data !== "object") return false;
  const n = data as Partial<Note>;

  const isFormatValid =
    n.format === undefined || VALID_FORMATS.has(n.format as NoteContentFormat);

  const isNotebookIdValid =
    n.notebookId === undefined ||
    n.notebookId === null ||
    (typeof n.notebookId === "string" && n.notebookId.trim().length > 0);

  const isTagsValid =
    n.tags === undefined ||
    (Array.isArray(n.tags) && n.tags.every((t) => typeof t === "string"));

  const isArchivedAtValid =
    n.archivedAt === undefined ||
    n.archivedAt === null ||
    typeof n.archivedAt === "string";

  return (
    typeof n.id === "string" &&
    n.id.trim().length > 0 &&
    typeof n.title === "string" &&
    typeof n.content === "string" &&
    isFormatValid &&
    isNotebookIdValid &&
    isTagsValid &&
    isArchivedAtValid &&
    typeof n.createdAt === "string" &&
    typeof n.updatedAt === "string" &&
    typeof n.isFavorite === "boolean" &&
    (n.deletedAt === null || typeof n.deletedAt === "string")
  );
}

export function sanitizeNote(data: unknown): Note | null {
  if (!isNote(data)) return null;
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    format: data.format ?? "plain-text-v1",
    notebookId: data.notebookId ?? null,
    tags: Array.isArray(data.tags) ? [...data.tags] : [],
    archivedAt: data.archivedAt ?? null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    isFavorite: data.isFavorite,
    deletedAt: data.deletedAt,
  };
}
