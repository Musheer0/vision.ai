"use client"

import dynamic from "next/dynamic"
import * as monaco from "monaco-editor";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

interface CodeInputProps {
  value: string
  onChange: (value: string) => void
  language: string
  path: string
}

export function CodeInput({ value, onChange, language, path }: CodeInputProps) {
  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Editing:</span>
          <span className="font-medium text-foreground">src/{path}</span>
          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
            {language.toUpperCase()}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {value.length} characters • {value.split("\n").length} lines
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 w-full h-full">
        <Editor
          value={value}
          onChange={(val) => onChange(val ?? "")}
          language={language}
          theme="vs-dark"
        path={path}
          options={{
            fontSize: 14,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            minimap: { enabled: false },
            automaticLayout: true,
            tabSize: 2,
            
          }}
            beforeMount={(monaco) => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
  }}

        />
      </div>
    </div>
  )
}
