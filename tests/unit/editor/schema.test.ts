import { describe, it, expect } from "vitest";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { getSchema } from "@tiptap/core";

describe("Tiptap Schema & Extension Boundaries", () => {
  const extensions = [
    StarterKit.configure({
      link: false,
      underline: false,
      strike: false,
      heading: {
        levels: [1, 2, 3],
      },
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Placeholder.configure({ placeholder: "Start writing..." }),
  ];

  const schema = getSchema(extensions);

  it("contains only approved marks: bold, italic, code", () => {
    const markNames = Object.keys(schema.marks);
    expect(markNames.sort()).toEqual(["bold", "code", "italic"].sort());

    // Explicitly verify disabled / deferred features are absent
    expect(schema.marks.link).toBeUndefined();
    expect(schema.marks.underline).toBeUndefined();
    expect(schema.marks.strike).toBeUndefined();
  });

  it("contains approved block nodes and list nodes", () => {
    const nodeNames = Object.keys(schema.nodes);

    expect(nodeNames).toContain("doc");
    expect(nodeNames).toContain("paragraph");
    expect(nodeNames).toContain("text");
    expect(nodeNames).toContain("heading");
    expect(nodeNames).toContain("blockquote");
    expect(nodeNames).toContain("codeBlock");
    expect(nodeNames).toContain("horizontalRule");
    expect(nodeNames).toContain("bulletList");
    expect(nodeNames).toContain("orderedList");
    expect(nodeNames).toContain("listItem");
    expect(nodeNames).toContain("taskList");
    expect(nodeNames).toContain("taskItem");

    // Deferred features must remain absent
    expect(schema.nodes.table).toBeUndefined();
    expect(schema.nodes.image).toBeUndefined();
  });

  it("restricts heading levels strictly to H1, H2, H3", () => {
    const heading = schema.nodes.heading;
    expect(heading).toBeDefined();
    // Default levels in attributes
    const levelAttr = heading.spec.attrs?.level;
    expect(levelAttr?.default).toBe(1);
  });
});
