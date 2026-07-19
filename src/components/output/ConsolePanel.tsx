import { cn } from "@/lib/utils"
import type { LogLevel } from "@/sandbox/protocol"

export type ConsoleEntry =
  | { kind: "log"; level: LogLevel; text: string }
  | { kind: "system"; text: string }
  | { kind: "error"; text: string }

export type RunStatus = "idle" | "bundling" | "running" | "done" | "error" | "timeout"

const STATUS_LABEL: Record<RunStatus, string> = {
  idle: "Run を押すとここに出力が表示されます",
  bundling: "ビルド中…",
  running: "実行中…",
  done: "実行完了",
  error: "エラーで終了しました",
  timeout: "タイムアウトしました",
}

export function ConsolePanel({
  entries,
  status,
  cleared,
}: {
  entries: ConsoleEntry[]
  status: RunStatus
  cleared: boolean
}) {
  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5 text-xs text-zinc-400">
        <span>コンソール</span>
        <span
          className={cn(
            status === "error" && "text-red-400",
            status === "timeout" && "text-amber-400",
            status === "done" && "text-emerald-400",
          )}
        >
          {cleared ? "🎉 クリア!" : STATUS_LABEL[status]}
        </span>
      </div>
      <div
        data-testid="console-output"
        className="flex-1 overflow-auto p-3 font-mono text-[13px] leading-relaxed"
      >
        {entries.length === 0 && status === "idle" ? (
          <p className="text-zinc-600">{STATUS_LABEL.idle}</p>
        ) : (
          entries.map((entry, i) => (
            <div
              key={i}
              className={cn(
                "whitespace-pre-wrap break-words",
                entry.kind === "error" && "text-red-400",
                entry.kind === "system" && "text-zinc-500 italic",
                entry.kind === "log" && entry.level === "warn" && "text-amber-300",
                entry.kind === "log" && entry.level === "error" && "text-red-400",
                entry.kind === "log" && entry.level === "debug" && "text-zinc-400",
              )}
            >
              {entry.text}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
