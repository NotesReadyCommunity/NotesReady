import { Note } from "../models/note";

export function isNote(data: unknown): data is Note {
  if (!data || typeof data !== "object") return false;
  const n = data as Partial<Note>;

  return (
    typeof n.id === "string" &&
    n.id.trim().length > 0 &&
    typeof n.title === "string" &&
    typeof n.content === "string" &&
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
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    isFavorite: data.isFavorite,
    deletedAt: data.deletedAt,
  };
}
