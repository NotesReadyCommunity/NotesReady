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

  return (
    typeof n.id === "string" &&
    n.id.trim().length > 0 &&
    typeof n.title === "string" &&
    typeof n.content === "string" &&
    isFormatValid &&
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
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    isFavorite: data.isFavorite,
    deletedAt: data.deletedAt,
  };
}
