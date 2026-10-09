"use client";

import React, { useImperativeHandle, forwardRef, useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { NoteContentFormat } from "@/core/models/note";
import { convertPlainTextToTiptapDoc } from "@/core/utils/content";
import { checkContentSize, ContentSizeCheck } from "@/core/utils/limits";
import { EditorBubbleMenu } from "./EditorBubbleMenu";
import { EditorSizeWarning } from "./EditorSizeWarning";

export interface RichEditorRef {
  focus: () => void;
}

interface RichEditorProps {
  content: string;
  format?: NoteContentFormat;
  onContentChange: (jsonString: string) => void;
  disabled?: boolean;
}

export const RichEditor = forwardRef<RichEditorRef, RichEditorProps>(
  ({ content, format, onContentChange, disabled = false }, ref) => {
    const [sizeCheck, setSizeCheck] = useState<ContentSizeCheck>(() => checkContentSize(content));

    // Convert initial content in-memory without mutating persistence layer
    const initialContent = useMemo(() => {
      if (!content || content.trim() === "") {
        return { type: "doc", content: [{ type: "paragraph" }] };
      }

      if (format === "tiptap-json-v1") {
        try {
          return JSON.parse(content);
        } catch {
          return convertPlainTextToTiptapDoc(content);
        }
      }

      // Legacy plain-text-v1 or undefined format: in-memory conversion only
      return convertPlainTextToTiptapDoc(content);
    }, [content, format]);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          // Strict spec compliance: Underline, Link, and Strikethrough are disabled
          link: false,
          underline: false,
          strike: false,
          heading: {
            levels: [1, 2, 3],
          },
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        Placeholder.configure({
          placeholder: "Start writing immediately...",
          emptyEditorClass: "is-editor-empty",
        }),
      ],
      content: initialContent,
      editable: !disabled,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          "aria-label": "Note Content",
          role: "textbox",
          class:
            "notesready-prose prose-neutral outline-none min-h-[350px] text-base sm:text-lg leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-sans focus:outline-none",
        },
      },
      onUpdate: ({ editor: currentEditor }) => {
        const json = currentEditor.getJSON();
        const jsonString = JSON.stringify(json);
        const check = checkContentSize(jsonString);
        setSizeCheck(check);

        // Hard limit protection: block persistence if 2 MB limit is exceeded
        if (check.isExceeded) {
          return;
        }

        onContentChange(jsonString);
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          if (editor) {
            editor.view.dom.focus();
            editor.commands.focus("end");
          }
        },
      }),
      [editor]
    );

    // Update editable state if disabled changes
    useEffect(() => {
      if (editor && editor.isEditable === disabled) {
        editor.setEditable(!disabled);
      }
    }, [editor, disabled]);

    return (
      <div className="relative notesready-editor-wrapper">
        <EditorSizeWarning check={sizeCheck} />
        <EditorBubbleMenu editor={editor} />
        <EditorContent editor={editor} />
      </div>
    );
  }
);

RichEditor.displayName = "RichEditor";
