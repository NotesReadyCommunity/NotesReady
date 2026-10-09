import { NoteContentFormat } from "../models/note";

interface TiptapNodeLike {
  type?: string;
  text?: string;
  content?: TiptapNodeLike[];
}

function traverseNodeText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as TiptapNodeLike;

  if (typeof n.text === "string") {
    return n.text;
  }

  if (Array.isArray(n.content)) {
    const isBlock =
      n.type === "paragraph" ||
      n.type === "heading" ||
      n.type === "blockquote" ||
      n.type === "codeBlock" ||
      n.type === "listItem" ||
      n.type === "taskItem";

    const parts = n.content.map(traverseNodeText).filter(Boolean);
    return isBlock ? parts.join("") + "\n" : parts.join("");
  }

  return "";
}

/**
 * Extracts plain, unformatted human-readable text from note content
 * regardless of whether it is stored as plain-text-v1 or tiptap-json-v1.
 */
export function extractPlainText(
  content: string,
  format?: NoteContentFormat
): string {
  if (!content) return "";

  if (format === "plain-text-v1" || !format) {
    return content;
  }

  if (format === "tiptap-json-v1") {
    try {
      const parsed = JSON.parse(content);
      const text = traverseNodeText(parsed).trim();
      return text;
    } catch {
      // Malformed JSON fallback: return raw content safely
      return content;
    }
  }

  return content;
}

/**
 * Extracts a single-line, trimmed snippet suitable for note-list previews.
 */
export function getNoteSnippet(
  content: string,
  format?: NoteContentFormat,
  maxLength = 120
): string {
  const raw = extractPlainText(content, format);
  const normalized = raw.replace(/\s+/g, " ").trim();
  if (!normalized) return "Empty note";
  if (normalized.length <= maxLength) return normalized;
  return normalized.slice(0, maxLength).trimEnd() + "…";
}

/**
 * In-memory non-destructive converter from legacy plain-text to Tiptap JSON document structure.
 */
export function convertPlainTextToTiptapDoc(plainText: string): {
  type: "doc";
  content: Array<{
    type: "paragraph";
    content?: Array<{ type: "text"; text: string }>;
  }>;
} {
  if (!plainText || plainText.trim() === "") {
    return {
      type: "doc",
      content: [{ type: "paragraph" }],
    };
  }

  const lines = plainText.split(/\r?\n/);
  const content = lines.map((line) => {
    if (!line) {
      return { type: "paragraph" as const };
    }
    return {
      type: "paragraph" as const,
      content: [{ type: "text" as const, text: line }],
    };
  });

  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  };
}

/**
 * Validates that an object has the structural shape of a Tiptap/ProseMirror doc.
 */
export function isValidTiptapDoc(doc: unknown): boolean {
  if (!doc || typeof doc !== "object") return false;
  const d = doc as { type?: unknown; content?: unknown };
  return d.type === "doc" && Array.isArray(d.content);
}
