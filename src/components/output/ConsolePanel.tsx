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
    <div className="flex h-full flex-col bg-background text-foreground">
      <div className="flex items-center justify-between border-b border-border bg-muted/35 px-3 py-1.5 text-xs text-muted-foreground">
        <span>コンソール</span>
        <span
          className={cn(
            status === "error" && "text-destructive dark:text-red-400",
            status === "timeout" && "text-amber-600 dark:text-amber-300",
            status === "done" && "text-emerald-600 dark:text-emerald-400",
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
          <p className="text-muted-foreground/70">{STATUS_LABEL.idle}</p>
        ) : (
          entries.map((entry, i) => (
            <div
              key={i}
              className={cn(
                "whitespace-pre-wrap break-words",
                entry.kind === "error" && "text-destructive dark:text-red-400",
                entry.kind === "system" && "text-muted-foreground italic",
                entry.kind === "log" && entry.level === "warn" && "text-amber-600 dark:text-amber-300",
                entry.kind === "log" && entry.level === "error" && "text-destructive dark:text-red-400",
                entry.kind === "log" && entry.level === "debug" && "text-muted-foreground",
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
