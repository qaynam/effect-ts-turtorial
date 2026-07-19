import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { codeToHtml, type DecorationItem } from "shiki"
import { ArrowRight, ExternalLink } from "lucide-react"
import { Link } from "react-router"
import type { Lesson } from "@/content/types"

/**
 * コードブロック内の +++追加+++ / ~~~削除~~~ マーカーを取り除き、
 * 該当範囲を shiki の decoration(ハイライト)に変換する。
 * レッスンで「どこを書き換えるか」を視覚的に示すための記法。
 */
function parseDiffMarkers(raw: string): { code: string; decorations: DecorationItem[] } {
  const decorations: DecorationItem[] = []
  const re = /(\+\+\+|~~~)([\s\S]*?)\1/g
  let code = ""
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) {
    code += raw.slice(last, m.index)
    const start = code.length
    code += m[2]
    if (m[2].length > 0) {
      decorations.push({
        start,
        end: code.length,
        properties: { class: m[1] === "+++" ? "diff-add" : "diff-remove" },
      })
    }
    last = m.index + m[0].length
  }
  code += raw.slice(last)
  return { code, decorations }
}

function ShikiBlock({ code: raw, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    const { code, decorations } = parseDiffMarkers(raw)
    codeToHtml(code, {
      lang,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
      decorations,
    })
      .then((h) => {
        if (!cancelled) setHtml(h)
      })
      .catch(() => {
        if (!cancelled) setHtml(null)
      })
    return () => {
      cancelled = true
    }
  }, [raw, lang])

  if (html === null) {
    return (
      <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-4 text-[13px]">
        <code>{parseDiffMarkers(raw).code}</code>
      </pre>
    )
  }
  return (
    <div
      className="shiki-block overflow-x-auto rounded-lg border text-[13px] [&_pre]:p-4"
      // shiki が生成した信頼できる HTML のみを描画する
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function LessonText({ lesson, next }: { lesson: Lesson; next?: Lesson }) {
  return (
    <article className="prose-tutorial mx-auto max-w-2xl px-6 py-8">
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
