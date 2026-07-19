/** ユーザーコードを実行する使い捨て Worker。console 出力を main へ転送する。 */
import type { LogLevel, RunMessage, WorkerEvent } from "../protocol"

const MAX_LOG_LINES = 1000

let logCount = 0

function post(event: WorkerEvent): void {
  self.postMessage(event)
}

function emitLog(level: LogLevel, args: unknown[]): void {
  logCount++
  if (logCount > MAX_LOG_LINES) {
    if (logCount === MAX_LOG_LINES + 1) {
      post({
        type: "log",
        level: "warn",
        parts: [`(ログが ${MAX_LOG_LINES} 行を超えたため以降は省略します)`],
      })
    }
    return
  }
  post({ type: "log", level, parts: args.map((a) => inspect(a, 0)) })
}

/** 構造化 clone に頼らず、循環参照にも耐える簡易インスペクタ */
function inspect(value: unknown, depth: number, seen = new Set<object>()): string {
  if (value === null) return "null"
  if (value === undefined) return "undefined"
  switch (typeof value) {
    case "string":
      return depth === 0 ? value : JSON.stringify(value)
    case "number":
    case "boolean":
    case "bigint":
      return String(value)
    case "symbol":
      return value.toString()
    case "function":
      return `[Function: ${value.name || "anonymous"}]`
  }
  const obj = value as object
  if (seen.has(obj)) return "[Circular]"
  if (depth > 4) return "…"
  seen.add(obj)
  try {
    if (obj instanceof Error) {
      return `${obj.name}: ${obj.message}`
    }
    if (Array.isArray(obj)) {
      return `[ ${obj.map((v) => inspect(v, depth + 1, seen)).join(", ")} ]`
    }
    if (obj instanceof Map) {
      const entries = [...obj].map(
        ([k, v]) => `${inspect(k, depth + 1, seen)} => ${inspect(v, depth + 1, seen)}`,
      )
      return `Map(${obj.size}) { ${entries.join(", ")} }`
    }
    if (obj instanceof Set) {
      return `Set(${obj.size}) { ${[...obj].map((v) => inspect(v, depth + 1, seen)).join(", ")} }`
    }
    // effect のデータ型(Option / Either / Exit / Cause など)は
    // Inspectable として toJSON を実装しており、それが最も読みやすい表現になる
    const withToJSON = obj as { toJSON?: () => unknown }
    if (typeof withToJSON.toJSON === "function") {
      try {
        return JSON.stringify(withToJSON.toJSON(), null, depth === 0 ? 2 : undefined) ?? String(obj)
      } catch {
        // fall through
      }
    }
    const entries = Object.entries(obj).map(
      ([k, v]) => `${k}: ${inspect(v, depth + 1, seen)}`,
    )
    const name = obj.constructor && obj.constructor.name !== "Object" ? `${obj.constructor.name} ` : ""
    return `${name}{ ${entries.join(", ")} }`
  } finally {
    seen.delete(obj)
  }
}

function patchConsole(): void {
  for (const level of ["log", "info", "warn", "error", "debug"] as const) {
    const original = console[level].bind(console)
    console[level] = (...args: unknown[]) => {
      original(...args)
      // dev 時に Vite の HMR クライアントが worker 内でもログを出すため除外する
      if (typeof args[0] === "string" && args[0].startsWith("[vite]")) return
      emitLog(level, args)
    }
  }
}

self.addEventListener("unhandledrejection", (event) => {
  event.preventDefault()
  const reason = event.reason
  post({
    type: "error",
    message: reason instanceof Error ? `${reason.name}: ${reason.message}` : inspect(reason, 0),
    stack: reason instanceof Error ? reason.stack : undefined,
  })
})

self.addEventListener("message", (event: MessageEvent<RunMessage>) => {
  if (event.data.type !== "run") return
  void run(event.data.code)
})

async function run(code: string): Promise<void> {
  // ユーザーコード実行の直前にパッチする(worker 起動時の内部ログを拾わない)
  patchConsole()
  const blobUrl = URL.createObjectURL(
    new Blob([code], { type: "text/javascript" }),
  )
  const started = performance.now()
  try {
    await import(/* @vite-ignore */ blobUrl)
    post({ type: "done", durationMs: Math.round(performance.now() - started) })
  } catch (e) {
    post({
      type: "error",
      message: e instanceof Error ? `${e.name}: ${e.message}` : inspect(e, 0),
      stack: e instanceof Error ? e.stack : undefined,
    })
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}
