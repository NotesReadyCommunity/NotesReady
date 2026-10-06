export type UserRole = "owner" | "editor" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  isPersonal: boolean;
  role: UserRole;
  createdAt: string;
}

export interface Folder {
  id: string;
  workspaceId: string;
  name: string;
  parentId?: string;
  color?: string;
  createdAt: string;
}

export interface NoteMetadata {
  id: string;
  workspaceId: string;
  folderId?: string;
  title: string;
  excerpt: string;
  isFavorite: boolean;
  isArchived: boolean;
  isTrash: boolean;
  tags: string[];
  updatedAt: string;
  createdAt: string;
  authorId: string;
}
