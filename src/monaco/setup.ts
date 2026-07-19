/**
 * Monaco Editor のセットアップ。
 *
 * - CDN ではなくローカルの monaco-editor を使う(オフライン・バージョン固定)
 * - effect / @effect/platform の d.ts(public/generated/types-effect.json)を
 *   仮想 file:///node_modules/ として登録し、型補完・型エラーを有効にする
 */
import { loader } from "@monaco-editor/react"
import * as monaco from "monaco-editor"
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"

self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === "typescript" || label === "javascript") {
      return new tsWorker()
    }
    return new editorWorker()
  },
}

loader.config({ monaco })

let setupPromise: Promise<void> | null = null

/** 冪等。エディタ表示前に呼ぶ(アプリ起動時にウォームアップ推奨) */
export function setupMonaco(): Promise<void> {
  setupPromise ??= doSetup().catch((e) => {
    // 失敗をキャッシュしない(次の呼び出しで再試行できるように)
    setupPromise = null
    throw e
  })
  return setupPromise
}

async function doSetup(): Promise<void> {
  const ts = monaco.typescript.typescriptDefaults

  ts.setCompilerOptions({
    target: monaco.typescript.ScriptTarget.ESNext,
    module: monaco.typescript.ModuleKind.ESNext,
    // ModuleResolutionKind.Bundler (= 100)。monaco の enum には無いが
    // 内包の TypeScript 5.x は対応している
    moduleResolution: 100 as unknown as monaco.typescript.ModuleResolutionKind,
    // ModuleDetectionKind.Force (= 3): import の無いレッスンコードも
    // モジュール扱いにする(グローバルスコープの衝突対策)
    moduleDetection: 3,
    strict: true,
    exactOptionalPropertyTypes: true,
    allowNonTsExtensions: true,
    noEmit: true,
  })
  ts.setEagerModelSync(true)

  const res = await fetch(`${import.meta.env.BASE_URL}generated/types-effect.json`)
  if (!res.ok) {
    throw new Error(
      `型定義の読み込みに失敗しました (${res.status})。pnpm gen を実行してください。`,
    )
  }
  const files: Record<string, string> = await res.json()
  for (const [path, content] of Object.entries(files)) {
    ts.addExtraLib(content, `file://${path}`)
  }
}
