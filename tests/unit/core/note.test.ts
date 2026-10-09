import { describe, it, expect } from "vitest";
import { createEmptyNote } from "@/core/models/note";
import { isNote, sanitizeNote } from "@/core/validation/note";

describe("Note Domain Model & Validation", () => {
  it("creates a valid empty note with default title and timestamps", () => {
    const note = createEmptyNote();

    expect(note.id).toBeDefined();
    expect(typeof note.id).toBe("string");
    expect(note.id.length).toBeGreaterThan(0);
    expect(note.title).toBe("Untitled note");
    expect(note.content).toBe("");
    expect(note.isFavorite).toBe(false);
    expect(note.deletedAt).toBeNull();
    expect(new Date(note.createdAt).getTime()).not.toBeNaN();
    expect(new Date(note.updatedAt).getTime()).not.toBeNaN();
  });

  it("creates a note with custom initial title and content", () => {
    const note = createEmptyNote({
      title: "Architecture Decisions",
      content: "Notes on local-first storage.",
    });

    expect(note.title).toBe("Architecture Decisions");
    expect(note.content).toBe("Notes on local-first storage.");
  });

  it("validates valid notes using isNote type-guard", () => {
    const note = createEmptyNote();
    expect(isNote(note)).toBe(true);
  });

  it("rejects invalid or corrupted note objects", () => {
    expect(isNote(null)).toBe(false);
    expect(isNote(undefined)).toBe(false);
    expect(isNote("not an object")).toBe(false);
    expect(isNote({ id: "123" })).toBe(false); // missing title, content, timestamps
    expect(
      isNote({
        id: "123",
        title: "Test",
        content: "Content",
        createdAt: "2026-10-07T00:00:00.000Z",
        // missing updatedAt
      })
    ).toBe(false);
  });

  it("validates notes with format markers and legacy undefined format", () => {
    const base = {
      id: "note-legacy",
      title: "Legacy Note",
      content: "Plain text note body",
      createdAt: "2026-10-07T10:00:00.000Z",
      updatedAt: "2026-10-07T10:00:00.000Z",
      isFavorite: false,
      deletedAt: null,
    };

    // Legacy note without format property must be valid
    expect(isNote(base)).toBe(true);

    // Explicit plain-text-v1 format
    expect(isNote({ ...base, format: "plain-text-v1" })).toBe(true);

    // Explicit tiptap-json-v1 format
    expect(isNote({ ...base, format: "tiptap-json-v1" })).toBe(true);

    // Invalid formats must be rejected
    expect(isNote({ ...base, format: "markdown" })).toBe(false);
    expect(isNote({ ...base, format: "html" })).toBe(false);
    expect(isNote({ ...base, format: 123 })).toBe(false);
    expect(isNote({ ...base, format: null })).toBe(false);
  });

  it("sanitizes valid note data cleanly while preserving format", () => {
    const raw = {
      id: "note-123",
      title: "My Note",
      content: "Sample text",
      format: "tiptap-json-v1",
      createdAt: "2026-10-07T10:00:00.000Z",
      updatedAt: "2026-10-07T10:05:00.000Z",
      isFavorite: true,
      deletedAt: null,
      extraJunkField: "malicious",
    };

    const sanitized = sanitizeNote(raw);
    expect(sanitized).not.toBeNull();
    expect(sanitized?.id).toBe("note-123");
    expect(sanitized?.format).toBe("tiptap-json-v1");
    expect(sanitized?.isFavorite).toBe(true);
    expect((sanitized as unknown as Record<string, unknown>).extraJunkField).toBeUndefined();

    // Legacy note without format sanitizes to plain-text-v1
    const rawLegacy = {
      id: "note-legacy",
      title: "Old Note",
      content: "Old body",
      createdAt: "2026-10-07T10:00:00.000Z",
      updatedAt: "2026-10-07T10:05:00.000Z",
      isFavorite: false,
      deletedAt: null,
    };
    const sanitizedLegacy = sanitizeNote(rawLegacy);
    expect(sanitizedLegacy?.format).toBe("plain-text-v1");
  });
});
