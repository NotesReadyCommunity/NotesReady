import { describe, it, expect } from "vitest";
import { createEmptyNotebook } from "@/core/models/notebook";
import { isNotebook, sanitizeNotebook } from "@/core/validation/notebook";

describe("Notebook Domain Model & Validation", () => {
  it("creates a valid empty notebook with default name and timestamps", () => {
    const notebook = createEmptyNotebook();

    expect(notebook.id).toBeDefined();
    expect(typeof notebook.id).toBe("string");
    expect(notebook.name).toBe("Untitled Notebook");
    expect(new Date(notebook.createdAt).getTime()).not.toBeNaN();
    expect(new Date(notebook.updatedAt).getTime()).not.toBeNaN();
  });

  it("creates a notebook with custom trimmed name", () => {
    const notebook = createEmptyNotebook({ name: "  Engineering Specs  " });
    expect(notebook.name).toBe("Engineering Specs");
  });

  it("validates notebooks using isNotebook type guard", () => {
    const notebook = createEmptyNotebook({ name: "Research" });
    expect(isNotebook(notebook)).toBe(true);

    // Invalid objects
    expect(isNotebook(null)).toBe(false);
    expect(isNotebook(undefined)).toBe(false);
    expect(isNotebook("not a notebook")).toBe(false);
    expect(isNotebook({ id: "1" })).toBe(false);
    expect(isNotebook({ id: "1", name: "", createdAt: "now", updatedAt: "now" })).toBe(false);
    expect(isNotebook({ id: "1", name: "   ", createdAt: "now", updatedAt: "now" })).toBe(false);
  });

  it("sanitizes valid notebook objects cleanly", () => {
    const raw = {
      id: "nb-123",
      name: "  Product Ideas  ",
      createdAt: "2026-10-09T10:00:00.000Z",
      updatedAt: "2026-10-09T10:05:00.000Z",
      extraField: "ignored",
    };

    const sanitized = sanitizeNotebook(raw);
    expect(sanitized).not.toBeNull();
    expect(sanitized?.id).toBe("nb-123");
    expect(sanitized?.name).toBe("Product Ideas");
    expect((sanitized as unknown as Record<string, unknown>).extraField).toBeUndefined();
  });
});
