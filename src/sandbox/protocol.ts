/** main スレッド ⇔ runner worker 間のメッセージ型定義 */

export type LogLevel = "log" | "info" | "warn" | "error" | "debug"

/** main → worker */
export interface RunMessage {
  type: "run"
  /** バンドル済み JS(import は絶対 URL に解決済み) */
  code: string
}

/** worker → main */
export type WorkerEvent =
  | { type: "log"; level: LogLevel; parts: string[] }
  | { type: "done"; durationMs: number }
  | { type: "error"; message: string; stack?: string }

/** runner が UI に届けるイベント(worker イベント + main 側で生成するもの) */
export type RunnerEvent =
  | WorkerEvent
  | { type: "timeout"; timeoutMs: number }
  | { type: "bundle-error"; message: string }
