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

  it("sanitizes valid note data cleanly", () => {
    const raw = {
      id: "note-123",
      title: "My Note",
      content: "Sample text",
      createdAt: "2026-10-07T10:00:00.000Z",
      updatedAt: "2026-10-07T10:05:00.000Z",
      isFavorite: true,
      deletedAt: null,
      extraJunkField: "malicious",
    };

    const sanitized = sanitizeNote(raw);
    expect(sanitized).not.toBeNull();
    expect(sanitized?.id).toBe("note-123");
    expect(sanitized?.isFavorite).toBe(true);
    expect((sanitized as unknown as Record<string, unknown>).extraJunkField).toBeUndefined();
  });
});
