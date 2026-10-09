import { describe, it, expect } from "vitest";
import {
  extractPlainText,
  getNoteSnippet,
  convertPlainTextToTiptapDoc,
  isValidTiptapDoc,
} from "@/core/utils/content";

describe("Content Utilities (Plain-Text Extraction & Migration)", () => {
  it("extracts plain text from plain-text-v1 and undefined format", () => {
    const raw = "Hello world!\nLine 2";
    expect(extractPlainText(raw, "plain-text-v1")).toBe(raw);
    expect(extractPlainText(raw, undefined)).toBe(raw);
    expect(extractPlainText("")).toBe("");
  });

  it("extracts plain text from valid tiptap-json-v1 content", () => {
    const tiptapDoc = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Meeting Agenda" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Discussed " },
            { type: "text", marks: [{ type: "bold" }], text: "Q4 Roadmap" },
            { type: "text", text: " and goals." },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Item one" }],
                },
              ],
            },
          ],
        },
      ],
    };

    const jsonStr = JSON.stringify(tiptapDoc);
    const extracted = extractPlainText(jsonStr, "tiptap-json-v1");
    expect(extracted).toContain("Meeting Agenda");
    expect(extracted).toContain("Discussed Q4 Roadmap and goals.");
    expect(extracted).toContain("Item one");
  });

  it("handles malformed JSON gracefully in extractPlainText", () => {
    const malformed = "{ this is not valid json }";
    expect(extractPlainText(malformed, "tiptap-json-v1")).toBe(malformed);
  });

  it("generates clean note snippets", () => {
    const tiptapDoc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "A quick brown fox jumps over the lazy dog." }],
        },
      ],
    };

    const jsonStr = JSON.stringify(tiptapDoc);
    const snippet = getNoteSnippet(jsonStr, "tiptap-json-v1", 20);
    expect(snippet).toBe("A quick brown fox ju…");

    // Empty note snippet
    expect(getNoteSnippet("", "plain-text-v1")).toBe("Empty note");
    expect(getNoteSnippet(JSON.stringify({ type: "doc", content: [] }), "tiptap-json-v1")).toBe("Empty note");
  });

  it("converts plain text to a valid in-memory Tiptap document without mutating storage", () => {
    const doc = convertPlainTextToTiptapDoc("Line 1\nLine 2");
    expect(isValidTiptapDoc(doc)).toBe(true);
    expect(doc.type).toBe("doc");
    expect(doc.content).toHaveLength(2);
    expect(doc.content[0].type).toBe("paragraph");
    expect(doc.content[0].content?.[0].text).toBe("Line 1");
    expect(doc.content[1].content?.[0].text).toBe("Line 2");

    // Empty plain text conversion
    const emptyDoc = convertPlainTextToTiptapDoc("");
    expect(isValidTiptapDoc(emptyDoc)).toBe(true);
    expect(emptyDoc.content).toHaveLength(1);
    expect(emptyDoc.content[0].type).toBe("paragraph");
  });
});
