"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { extractPlainText } from "@/core/utils/content";
import { NoteContentFormat } from "@/core/models/note";

interface Props {
  children: ReactNode;
  fallbackContent: string;
  format?: NoteContentFormat;
  onFallbackContentChange?: (plainText: string) => void;
}

interface State {
  hasError: boolean;
  errorName: string;
  localText: string | null;
}

export class EditorErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorName: "",
    localText: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      errorName: error.name || "EditorError",
    };
  }

  public componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    // Privacy Rule: Never log note titles, bodies, pasted content, or sensitive user data.
    // Explicitly exclude error.message as it may embed input snippets.
    // Log strictly a generic diagnostic message and safe error name.
    console.error("EditorErrorBoundary caught an unexpected editor error:", {
      name: error?.name || "EditorError",
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorName: "", localText: null });
  };

  private handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    this.setState({ localText: newText });
    this.props.onFallbackContentChange?.(newText);
  };

  public render() {
    if (this.state.hasError) {
      const displayText =
        this.state.localText !== null
          ? this.state.localText
          : extractPlainText(this.props.fallbackContent, this.props.format);

      return (
        <div className="space-y-4 my-4 animate-in fade-in" role="alert">
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>
                Rich editor encountered an unexpected issue ({this.state.errorName}). Switched to safe plain-text mode.
                Your content is fully preserved.
              </span>
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors text-xs font-medium cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Restore Rich Editor</span>
            </button>
          </div>

          <textarea
            value={displayText}
            onChange={this.handleTextChange}
            aria-label="Plain Text Fallback Content"
            placeholder="Write note content..."
            className="w-full min-h-[350px] p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-0)] text-[var(--text-primary)] text-base font-sans outline-none focus:border-[var(--brand-ember,#E85D3F)] resize-y"
          />
        </div>
      );
    }

    return this.props.children;
  }
}
