"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Code,
  List,
  CheckSquare,
  Quote,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

interface EditorBubbleMenuProps {
  editor: Editor | null;
}

interface MenuCoords {
  top: number;
  left: number;
}

export const EditorBubbleMenu: React.FC<EditorBubbleMenuProps> = ({ editor }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<MenuCoords>({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    if (!editor || editor.isDestroyed) {
      setIsVisible(false);
      return;
    }

    const { state, view } = editor;
    const { from, to, empty } = state.selection;

    // Only display when text is actively selected
    if (empty || from === to) {
      setIsVisible(false);
      return;
    }

    try {
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);
      const editorElement = view.dom.closest(".notesready-editor-wrapper");
      const wrapperRect = editorElement ? editorElement.getBoundingClientRect() : { top: 0, left: 0 };

      // Calculate center point horizontally
      const centerX = (start.left + end.right) / 2 - wrapperRect.left;
      // Position 44px above the top selection boundary
      let topY = start.top - wrapperRect.top - 46;

      // If too close to top, place below selection
      if (topY < 0) {
        topY = end.bottom - wrapperRect.top + 8;
      }

      setCoords({ top: topY, left: centerX });
      setIsVisible(true);
    } catch {
      setIsVisible(false);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const handleSelection = () => updateMenuPosition();
    const handleBlur = () => {
      // Delay closing slightly so button clicks register
      setTimeout(() => {
        if (!menuRef.current?.contains(document.activeElement)) {
          setIsVisible(false);
        }
      }, 150);
    };

    editor.on("selectionUpdate", handleSelection);
    editor.on("transaction", handleSelection);
    editor.on("blur", handleBlur);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVisible(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      editor.off("selectionUpdate", handleSelection);
      editor.off("transaction", handleSelection);
      editor.off("blur", handleBlur);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, updateMenuPosition]);

  if (!editor || !isVisible) {
    return null;
  }

  const buttons = [
    {
      label: "Heading 1",
      icon: <Heading1 size={14} />,
      isActive: editor.isActive("heading", { level: 1 }),
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Heading 2",
      icon: <Heading2 size={14} />,
      isActive: editor.isActive("heading", { level: 2 }),
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Heading 3",
      icon: <Heading3 size={14} />,
      isActive: editor.isActive("heading", { level: 3 }),
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Bold",
      icon: <Bold size={14} />,
      isActive: editor.isActive("bold"),
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: <Italic size={14} />,
      isActive: editor.isActive("italic"),
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Inline Code",
      icon: <Code size={14} />,
      isActive: editor.isActive("code"),
      action: () => editor.chain().focus().toggleCode().run(),
    },
    {
      label: "Bullet List",
      icon: <List size={14} />,
      isActive: editor.isActive("bulletList"),
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Task List",
      icon: <CheckSquare size={14} />,
      isActive: editor.isActive("taskList"),
      action: () => editor.chain().focus().toggleTaskList().run(),
    },
    {
      label: "Blockquote",
      icon: <Quote size={14} />,
      isActive: editor.isActive("blockquote"),
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ];

  return (
    <div
      ref={menuRef}
      role="toolbar"
      aria-label="Text Formatting"
      style={{
        position: "absolute",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        transform: "translateX(-50%)",
      }}
      className="z-30 flex items-center gap-0.5 p-1 rounded-xl bg-[var(--surface-1)] dark:bg-[var(--surface-2)] border border-[var(--border-subtle)] shadow-xl backdrop-blur-md select-none transition-all duration-100 animate-in fade-in zoom-in-95"
    >
      {buttons.map((btn, idx) => (
        <button
          key={idx}
          type="button"
          title={btn.label}
          aria-label={btn.label}
          onMouseDown={(e) => {
            // Prevent blur of editor selection on click
            e.preventDefault();
            btn.action();
          }}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center ${
            btn.isActive
              ? "bg-[var(--brand-ember,#E85D3F)] text-white shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] dark:hover:bg-[var(--surface-3)]"
          }`}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
};
