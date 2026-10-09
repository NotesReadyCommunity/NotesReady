import { Notebook } from "../models/notebook";

export function isNotebook(data: unknown): data is Notebook {
  if (!data || typeof data !== "object") return false;
  const nb = data as Partial<Notebook>;

  return (
    typeof nb.id === "string" &&
    nb.id.trim().length > 0 &&
    typeof nb.name === "string" &&
    nb.name.trim().length > 0 &&
    typeof nb.createdAt === "string" &&
    typeof nb.updatedAt === "string"
  );
}

export function sanitizeNotebook(data: unknown): Notebook | null {
  if (!isNotebook(data)) return null;
  return {
    id: data.id,
    name: data.name.trim(),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}
