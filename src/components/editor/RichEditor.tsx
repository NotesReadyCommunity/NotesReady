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
import { createSizeLimitExtension } from "./sizeLimitExtension";
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
    const [isBlocked, setIsBlocked] = useState<boolean>(false);

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

    // Extension enforcing hard size limit at the ProseMirror transaction level.
    // Prevents edits/pastes that would exceed 2 MB from ever entering the document,
    // safely preserving the last valid document intact while still permitting
    // deletions (reductions) so the user can easily recover.
    const sizeLimitExtension = useMemo(() => {
      return createSizeLimitExtension({
        onBlockedChange: setIsBlocked,
      });
    }, []);

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
        sizeLimitExtension,
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

        // If document is within allowed limit, persist changes
        if (!check.isExceeded) {
          setIsBlocked(false);
          onContentChange(jsonString);
        }
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
        <EditorSizeWarning check={sizeCheck} isBlocked={isBlocked} />
        <EditorBubbleMenu editor={editor} />
        <EditorContent editor={editor} />
      </div>
    );
  }
);

RichEditor.displayName = "RichEditor";
