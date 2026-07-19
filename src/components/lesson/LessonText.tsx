import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { codeToHtml } from "shiki"
import { ArrowLeftRight, ArrowRight, ExternalLink, WrapText } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Lesson } from "@/content/types"
import { cn } from "@/lib/utils"

type DiffChunk = {
  kind: "context" | "add" | "remove"
  text: string
}

type DiffRow = {
  kind: "context" | "add" | "remove"
  code: string
}

function parseDiffChunks(raw: string): DiffChunk[] {
  const chunks: DiffChunk[] = []
  const re = /(\+\+\+|~~~)([\s\S]*?)\1/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) chunks.push({ kind: "context", text: raw.slice(last, m.index) })
    chunks.push({ kind: m[1] === "+++" ? "add" : "remove", text: m[2] })
    last = m.index + m[0].length
  }
  if (last < raw.length) chunks.push({ kind: "context", text: raw.slice(last) })
  return chunks
}

function parseDiffRows(raw: string): { hasDiff: boolean; rows: DiffRow[] } {
  const hasDiff = /(\+\+\+|~~~)/.test(raw)
  if (!hasDiff) {
    return {
      hasDiff: false,
      rows: raw.split("\n").map((code) => ({ kind: "context", code })),
    }
  }

  const lines: DiffChunk[][] = [[]]
  for (const chunk of parseDiffChunks(raw)) {
    const parts = chunk.text.split("\n")
    parts.forEach((part, index) => {
      if (index > 0) lines.push([])
      if (part.length > 0) lines[lines.length - 1].push({ ...chunk, text: part })
    })
  }

  const rows = lines.flatMap((line): DiffRow[] => {
    const hasAdd = line.some((chunk) => chunk.kind === "add")
    const hasRemove = line.some((chunk) => chunk.kind === "remove")
    const withoutAdd = line
      .filter((chunk) => chunk.kind !== "add")
      .map((chunk) => chunk.text)
      .join("")
    const withoutRemove = line
      .filter((chunk) => chunk.kind !== "remove")
      .map((chunk) => chunk.text)
      .join("")

    if (hasAdd && hasRemove) {
      return [
        { kind: "remove", code: withoutAdd },
        { kind: "add", code: withoutRemove },
      ]
    }
    if (hasAdd) return [{ kind: "add", code: withoutRemove }]
    if (hasRemove) return [{ kind: "remove", code: withoutAdd }]
    return [{ kind: "context", code: withoutRemove }]
  })

  return { hasDiff, rows }
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
}

function diffSymbol(kind: DiffRow["kind"]): string {
  if (kind === "add") return "+"
  if (kind === "remove") return "-"
  return " "
}

function renderDiffHtml(html: string, rows: DiffRow[]): string {
  const document = new DOMParser().parseFromString(html, "text/html")
  const pre = document.querySelector("pre")
  const lineElements = Array.from(document.querySelectorAll("span.line"))
  const className = pre?.getAttribute("class") ?? "shiki"
  const style = pre?.getAttribute("style") ?? null
  const styleAttribute = style === null ? "" : ` style="${escapeAttribute(style)}"`
  const body = rows
    .map((row, index) => {
      const code = lineElements[index]?.innerHTML || "&nbsp;"
      return `<div class="diff-line diff-line-${row.kind}"><span class="diff-gutter" aria-hidden="true">${diffSymbol(
        row.kind,
      )}</span><span class="diff-code">${code}</span></div>`
    })
    .join("")

  return `<pre class="${escapeAttribute(className)}"${styleAttribute}><code>${body}</code></pre>`
}

function ShikiBlock({ code: raw, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<string | null>(null)
  const [wrap, setWrap] = useState(false)
  const { hasDiff, rows } = parseDiffRows(raw)
  useEffect(() => {
    let cancelled = false
    const parsed = parseDiffRows(raw)
    const code = parsed.rows.map((row) => row.code).join("\n")
    codeToHtml(code, {
      lang,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    })
      .then((h) => {
        if (!cancelled) setHtml(parsed.hasDiff ? renderDiffHtml(h, parsed.rows) : h)
      })
      .catch(() => {
        if (!cancelled) setHtml(null)
      })
    return () => {
      cancelled = true
    }
  }, [raw, lang])

  const toggleLabel = wrap ? "横スクロールで表示" : "折り返して表示"
  const toolbar = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            aria-label={toggleLabel}
            aria-pressed={wrap}
            className="absolute right-2 top-2 z-10 border-border/70 bg-background/90 text-muted-foreground shadow-sm backdrop-blur hover:bg-background hover:text-foreground"
            onClick={() => setWrap((current) => !current)}
          >
            {wrap ? <ArrowLeftRight /> : <WrapText />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{toggleLabel}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  if (html === null) {
    return (
      <div className="code-block-frame group/code relative">
        {toolbar}
        <pre
          className={cn(
            "rounded-lg border bg-muted/40 px-4 py-2 pr-12 text-[13px] leading-[1.6]",
            wrap
              ? "overflow-x-hidden whitespace-pre-wrap break-words"
              : "overflow-x-auto whitespace-pre",
          )}
        >
          <code>
            {hasDiff
              ? rows.map((row) => `${diffSymbol(row.kind)} ${row.code}`).join("\n")
              : raw}
          </code>
        </pre>
      </div>
    )
  }
  return (
    <div className="code-block-frame group/code relative">
      {toolbar}
      <div
        className={cn(
          "shiki-block rounded-lg border text-[13px] leading-[1.6]",
          hasDiff
            ? "shiki-block-diff [&_pre]:p-0"
            : "[&_pre]:py-2 [&_pre]:pl-4 [&_pre]:pr-12",
          wrap && "shiki-wrap",
          wrap
            ? "overflow-x-hidden [&_pre]:whitespace-pre-wrap [&_pre]:break-words"
            : "overflow-x-auto [&_pre]:whitespace-pre",
        )}
        // shiki が生成した信頼できる HTML のみを描画する
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export function LessonText({ lesson, next }: { lesson: Lesson; next?: Lesson }) {
  return (
    <article className="prose-tutorial w-full max-w-none px-6 py-8 md:px-8 lg:px-10">
      <h1 className="mb-4 mt-2 text-2xl font-bold tracking-tight">{lesson.meta.title}</h1>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className ?? "")
            const text = String(children).replace(/\n$/, "")
            if (match) {
              return <ShikiBlock code={text} lang={match[1]} />
            }
            return (
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
                {text}
              </code>
            )
          },
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              {children}
            </a>
          ),
        }}
      >
        {lesson.body}
      </ReactMarkdown>

      {lesson.meta.docs && lesson.meta.docs.length > 0 && (
        <div className="mt-10 rounded-lg border bg-muted/40 p-4">
          <p className="mb-2 text-sm font-semibold">📖 Effect 公式ドキュメント</p>
          <ul className="space-y-1">
            {lesson.meta.docs.map((doc) => (
              <li key={doc.url}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-2"
                >
                  {doc.label}
                  <ExternalLink className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {next && (
        <Link
          to={`/tutorial/${next.id}`}
          className="mt-10 flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3 font-medium transition-colors hover:bg-muted/70"
        >
          <span>
            次のレッスン: <span className="text-primary">{next.meta.title}</span>
          </span>
          <ArrowRight className="size-4" />
        </Link>
      )}
    </article>
  )
}
