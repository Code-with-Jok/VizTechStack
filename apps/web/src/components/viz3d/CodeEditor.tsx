"use client";

import { useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ code, onChange }: CodeEditorProps) {
  const monaco = useMonaco();
  const editorRef = useRef(null);

  function handleEditorDidMount(editor: any, monacoParam: any) {
    editorRef.current = editor;
    // Set custom theme to match VizTechStack
    monacoParam.editor.defineTheme("viztech-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "c084fc" }, // pulse color (purple)
        { token: "identifier", foreground: "f8fafc" },
        { token: "string", foreground: "10b981" }, // state color (emerald)
        { token: "number", foreground: "f59e0b" }, // hook color (amber)
        // Adjust for JSX
        { token: "tag", foreground: "6366f1" }, // HTML element (indigo)
        { token: "tag.id", foreground: "06b6d4" }, // Custom Component (cyan)
      ],
      colors: {
        "editor.background": "#050810", // near black from css var
        "editor.lineHighlightBackground": "#1e293b50",
      },
    });
    monacoParam.editor.setTheme("viztech-dark");
  }

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-border bg-[#050810]">
      <Editor
        height="100%"
        defaultLanguage="javascript" // Since we use React, javascript or typescript works
        language="javascript"
        value={code}
        onChange={(val) => onChange(val || "")}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--font-inter), monospace",
          padding: { top: 24, bottom: 24 },
          lineHeight: 24,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
        }}
        loading={
          <div className="p-8 text-sm text-muted-foreground animate-pulse">
            Khởi tạo Editor...
          </div>
        }
      />
    </div>
  );
}
