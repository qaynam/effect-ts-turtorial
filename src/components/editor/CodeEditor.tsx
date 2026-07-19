import { Editor, type OnMount } from "@monaco-editor/react"
import { useEffect, useRef, useState } from "react"
import type { VimAdapterInstance } from "monaco-vim"
import { setupMonaco } from "@/monaco/setup"
import { useTheme } from "@/stores/theme"

// エディタ表示前に型定義の登録を開始しておく(冪等)
void setupMonaco()

export function CodeEditor({
  value,
  onChange,
  onRun,
  vimMode,
}: {
  value: string
  onChange: (code: string) => void
  /** Cmd/Ctrl+Enter で実行 */
  onRun: () => void
  vimMode: boolean
}) {
  const theme = useTheme((s) => s.theme)
  // Monaco の addCommand はマウント時のクロージャを掴むため ref 経由で呼ぶ
  const onRunRef = useRef(onRun)
  onRunRef.current = onRun
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const vimStatusRef = useRef<HTMLDivElement | null>(null)
  const vimModeRef = useRef<VimAdapterInstance | null>(null)
  const [editorReady, setEditorReady] = useState(false)

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    setEditorReady(true)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunRef.current()
    })
    // E2E テストからエディタ内容の書き換え・型エラー取得を行うためのフック
    const hooks = window as unknown as {
      __setEditorValue?: (v: string) => void
      __getMarkers?: () => { message: string; severity: number }[]
    }
    hooks.__setEditorValue = (v) => editor.getModel()?.setValue(v)
    hooks.__getMarkers = () =>
      monaco.editor
        .getModelMarkers({ resource: editor.getModel()!.uri })
        .map((m: { message: string; severity: number }) => ({
          message: m.message,
          severity: m.severity,
        }))
  }

  useEffect(() => {
    if (!vimMode) {
      vimModeRef.current?.dispose()
      vimModeRef.current = null
      return
    }

    if (!editorReady || !editorRef.current || !vimStatusRef.current || vimModeRef.current) {
      return
    }

    let cancelled = false
    void import("monaco-vim").then(({ initVimMode }) => {
      if (cancelled || !editorRef.current || !vimStatusRef.current || vimModeRef.current) {
        return
      }
      vimModeRef.current = initVimMode(editorRef.current, vimStatusRef.current)
      editorRef.current.focus()
    })

    return () => {
      cancelled = true
    }
  }, [editorReady, vimMode])

  useEffect(() => {
    return () => {
      vimModeRef.current?.dispose()
      vimModeRef.current = null
      editorRef.current = null
    }
  }, [])

  return (
    <div className="flex h-full min-h-0 overflow-hidden flex-col">
      <div className="min-h-0 flex-1 overflow-hidden">
        <Editor
          height="100%"
          path="file:///main.ts"
          defaultLanguage="typescript"
          value={value}
          onChange={(code) => onChange(code ?? "")}
          onMount={handleMount}
          theme={theme === "dark" ? "vs-dark" : "light"}
          loading={<p className="text-sm text-muted-foreground">エディタを読み込み中…</p>}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            renderLineHighlight: "none",
            overviewRulerBorder: false,
            padding: { top: 12 },
          }}
        />
      </div>
      {vimMode && (
        <div
          ref={vimStatusRef}
          data-testid="vim-status"
          className="h-6 shrink-0 border-t border-border bg-muted/40 px-3 font-mono text-[11px] leading-6 text-muted-foreground [&_.vim-notification]:text-amber-600 [&_input]:h-4 [&_input]:border-0 [&_input]:bg-transparent [&_input]:font-mono [&_input]:text-foreground [&_input]:outline-none dark:[&_.vim-notification]:text-amber-300"
        />
      )}
    </div>
  )
}
