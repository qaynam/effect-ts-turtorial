import { Editor, type OnMount } from "@monaco-editor/react"
import { useRef } from "react"
import { setupMonaco } from "@/monaco/setup"

// エディタ表示前に型定義の登録を開始しておく(冪等)
void setupMonaco()

export function CodeEditor({
  value,
  onChange,
  onRun,
}: {
  value: string
  onChange: (code: string) => void
  /** Cmd/Ctrl+Enter で実行 */
  onRun: () => void
}) {
  // Monaco の addCommand はマウント時のクロージャを掴むため ref 経由で呼ぶ
  const onRunRef = useRef(onRun)
  onRunRef.current = onRun

  const handleMount: OnMount = (editor, monaco) => {
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

  return (
    <Editor
      path="file:///main.ts"
      defaultLanguage="typescript"
      value={value}
      onChange={(code) => onChange(code ?? "")}
      onMount={handleMount}
      theme="vs-dark"
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
  )
}
