import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { codeToHtml } from "shiki"
import { ExternalLink } from "lucide-react"
import type { Lesson } from "@/content/types"

function ShikiBlock({ code, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    codeToHtml(code, { lang, theme: "github-dark" })
      .then((h) => {
        if (!cancelled) setHtml(h)
      })
      .catch(() => {
        if (!cancelled) setHtml(null)
      })
    return () => {
      cancelled = true
    }
  }, [code, lang])

  if (html === null) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-[13px] text-zinc-100">
        <code>{code}</code>
      </pre>
    )
  }
  return (
    <div
      className="overflow-x-auto rounded-lg text-[13px] [&_pre]:!bg-zinc-950 [&_pre]:p-4"
      // shiki が生成した信頼できる HTML のみを描画する
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function LessonText({ lesson }: { lesson: Lesson }) {
  return (
    <article className="prose-tutorial mx-auto max-w-2xl px-6 py-8">
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
    </article>
  )
}
