import { describe, it, expect } from "vitest";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { getSchema } from "@tiptap/core";
import { DOMParser as ProseMirrorDOMParser } from "@tiptap/pm/model";

describe("Editor Security & Hostile Paste Sanitization", () => {
  const extensions = [
    StarterKit.configure({
      link: false,
      underline: false,
      strike: false,
      heading: { levels: [1, 2, 3] },
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
  ];

  const schema = getSchema(extensions);
  const parser = ProseMirrorDOMParser.fromSchema(schema);

  function parseHtmlToDoc(html: string) {
    const container = document.createElement("div");
    container.innerHTML = html;
    return parser.parse(container);
  }

  it("strips script tags and executable JavaScript completely", () => {
    const malicious = '<p>Normal text</p><script>alert("xss")</script>';
    const doc = parseHtmlToDoc(malicious);
    const json = doc.toJSON();

    // Verify script does not exist anywhere in document structure
    const jsonStr = JSON.stringify(json);
    expect(jsonStr).not.toContain("script");
    expect(jsonStr).not.toContain("alert");
    expect(doc.textContent).toBe("Normal text");
  });

  it("strips unsafe elements like img with onerror, iframes, and objects", () => {
    const hostile = `
      <p>Before</p>
      <img src="x" onerror="window.location='https://attacker.com'" />
      <iframe src="https://attacker.com"></iframe>
      <object data="evil.swf"></object>
      <p>After</p>
    `;
    const doc = parseHtmlToDoc(hostile);
    const jsonStr = JSON.stringify(doc.toJSON());

    expect(jsonStr).not.toContain("onerror");
    expect(jsonStr).not.toContain("iframe");
    expect(jsonStr).not.toContain("object");
    expect(jsonStr).not.toContain("attacker.com");
    expect(doc.textContent.trim()).toBe("BeforeAfter");
  });

  it("strips disallowed link marks and javascript: URIs", () => {
    const hostileLink = '<p><a href="javascript:alert(1)">Click here</a></p>';
    const doc = parseHtmlToDoc(hostileLink);
    const json = doc.toJSON();

    // The text 'Click here' is preserved, but no link mark exists
    expect(doc.textContent).toBe("Click here");
    const pNode = json.content?.[0];
    const textNode = pNode?.content?.[0];
    expect(textNode?.marks).toBeUndefined();
  });

  it("strips disabled marks like underline and strikethrough", () => {
    const formatted = "<p><u>Underline</u> and <s>Strike</s> and <b>Bold</b></p>";
    const doc = parseHtmlToDoc(formatted);
    const json = doc.toJSON();

    const pNode = json.content?.[0];
    const nodes = pNode?.content || [];

    // 'Underline' has no marks
    const underlineNode = nodes.find((n: { text?: string }) => n.text === "Underline");
    expect(underlineNode?.marks).toBeUndefined();

    // 'Strike' has no marks
    const strikeNode = nodes.find((n: { text?: string }) => n.text === "Strike");
    expect(strikeNode?.marks).toBeUndefined();

    // 'Bold' mark is approved and preserved
    const boldNode = nodes.find((n: { text?: string }) => n.text === "Bold");
    expect(boldNode?.marks).toBeDefined();
    expect(boldNode?.marks?.[0]?.type).toBe("bold");
  });

  it("strips inline event handler attributes like onclick or onload", () => {
    const hostileEvents = '<p onclick="alert(1)" onload="alert(2)">Safe text</p>';
    const doc = parseHtmlToDoc(hostileEvents);
    const jsonStr = JSON.stringify(doc.toJSON());

    expect(jsonStr).not.toContain("onclick");
    expect(jsonStr).not.toContain("onload");
    expect(doc.textContent).toBe("Safe text");
  });
});
