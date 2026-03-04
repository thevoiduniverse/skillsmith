"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";

const CHROME_HEIGHT = 360; // nav + title + segmented control + bottom floating bar + 40px gap
const MIN_HEIGHT = 250;

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MonacoMarkdownEditor({ value, onChange }: MonacoEditorProps) {
  const editorRef = useRef<unknown>(null);
  const [editorHeight, setEditorHeight] = useState(500);

  useEffect(() => {
    const calc = () => setEditorHeight(Math.max(window.innerHeight - CHROME_HEIGHT, MIN_HEIGHT));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Define custom dark theme to match app
    monaco.editor.defineTheme("skillsmith-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "888888" },
        { token: "keyword", foreground: "BFFF00" },
      ],
      colors: {
        "editor.background": "#141414",
        "editor.foreground": "#FAFAFA",
        "editor.lineHighlightBackground": "#1C1C1C",
        "editor.selectionBackground": "#BFFF0033",
        "editorCursor.foreground": "#BFFF00",
        "editorLineNumber.foreground": "#888888",
        "editorLineNumber.activeForeground": "#FAFAFA",
        "editor.inactiveSelectionBackground": "#BFFF0020",
        "editorWidget.background": "#141414",
        "editorWidget.border": "#2A2A2A",
      },
    });
    monaco.editor.setTheme("skillsmith-dark");
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <Editor
        height={`${editorHeight}px`}
        defaultLanguage="markdown"
        value={value}
        onChange={(val) => onChange(val || "")}
        onMount={handleMount}
        options={{
          fontSize: 14,
          fontFamily: "var(--font-jetbrains), monospace",
          minimap: { enabled: false },
          lineNumbers: "on",
          wordWrap: "on",
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: "line",
          bracketPairColorization: { enabled: true },
          tabSize: 2,
        }}
        loading={
          <div className="h-full flex items-center justify-center bg-surface text-text-secondary text-sm">
            Loading editor...
          </div>
        }
      />
    </div>
  );
}
