export interface Notebook {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotebookInput {
  id?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function createEmptyNotebook(input?: CreateNotebookInput | string): Notebook {
  const now = new Date().toISOString();
  const name = typeof input === "string" ? input : input?.name;
  const customId = typeof input === "object" ? input?.id : undefined;

  return {
    id: customId || (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `nb-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`),
    name: name?.trim() || "Untitled Notebook",
    createdAt: typeof input === "object" && input?.createdAt ? input.createdAt : now,
    updatedAt: typeof input === "object" && input?.updatedAt ? input.updatedAt : now,
  };
}
