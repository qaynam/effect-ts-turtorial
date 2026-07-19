/**
 * 実行のオーケストレーション: バンドル → 使い捨て Worker で実行 →
 * イベント転送 → タイムアウト管理。
 *
 * done 後も timeoutMs まで Worker を生かしておく(fork した Fiber が
 * 後からログを出すレッスンがあるため)。timeout イベントを出すのは
 * done 前に時間切れになった場合のみ。
 */
import { bundleUserCode } from "./bundler"
import type { RunnerEvent, RunMessage } from "./protocol"

export interface RunHandle {
  /** 実行を強制停止する(Stop ボタン・レッスン遷移・再実行時) */
  stop(): void
}

export interface RunOptions {
  timeoutMs?: number
  onEvent: (event: RunnerEvent) => void
}

const DEFAULT_TIMEOUT_MS = 5000

export function runUserCode(source: string, options: RunOptions): RunHandle {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  let worker: Worker | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let stopped = false
  let finished = false

  const cleanup = () => {
    if (timer !== null) clearTimeout(timer)
    timer = null
    worker?.terminate()
    worker = null
  }

  const stop = () => {
    if (stopped) return
    stopped = true
    cleanup()
  }

  void (async () => {
    const bundled = await bundleUserCode(source)
    if (stopped) return
    if (!bundled.ok) {
      stopped = true
      options.onEvent({ type: "bundle-error", message: bundled.message })
      return
    }

    worker = new Worker(new URL("./worker/runner-worker.ts", import.meta.url), {
      type: "module",
    })
    worker.addEventListener("message", (event: MessageEvent<RunnerEvent>) => {
      if (stopped) return
      if (event.data.type === "done" || event.data.type === "error") {
        finished = true
      }
      options.onEvent(event.data)
    })
    worker.addEventListener("error", (event) => {
      if (stopped) return
      finished = true
      options.onEvent({ type: "error", message: event.message })
      stop()
    })

    timer = setTimeout(() => {
      if (!finished) {
        options.onEvent({ type: "timeout", timeoutMs })
      }
      stop()
    }, timeoutMs)

    const message: RunMessage = { type: "run", code: bundled.code }
    worker.postMessage(message)
  })()

  return { stop }
}
