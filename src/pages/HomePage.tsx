import { useEffect } from "react"
import { Link } from "react-router"
import { ArrowRight, CheckCircle2, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { allLessons, curriculum } from "@/content/loader"
import { prefetchLessonAssets } from "@/lib/prefetch"
import { useProgress } from "@/stores/progress"

const GOALS = [
  "純粋関数・副作用・参照透過性を、自分の言葉で説明できる",
  "Option / Either / ADT を使って「失敗」や「値が無い」を型で表せる",
  "Functor / Monad を暗記ではなく map・flatMap の延長として理解している",
  "Effect の Layer・Schema・並行処理・リトライで小さなアプリを組み立てられる",
]

export function HomePage() {
  const { completed, lastVisited } = useProgress()

  useEffect(prefetchLessonAssets, [])

  const doneCount = allLessons.filter((l) => completed[l.id]).length
  const percent = Math.round((doneCount / allLessons.length) * 100)
  const resume =
    allLessons.find((l) => l.id === lastVisited) ??
    allLessons.find((l) => !completed[l.id]) ??
    allLessons[0]

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Effect-ts で学ぶ関数型プログラミング
        </h1>
        <ThemeToggle />
      </div>
      <p className="mt-4 leading-7 text-muted-foreground">
        null チェックの漏れ、どこで throw されるか分からない関数、絡まった非同期処理。
        こうした「予測できなさ」を型と値で扱えるようにするのが関数型プログラミング(FP)と{" "}
        <a
          href="https://effect.website"
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-2"
        >
          Effect
        </a>{" "}
        です。素の TypeScript で FP の考え方を身につけてから、Effect で実務の副作用処理まで進みます。
        全 {allLessons.length} レッスン、すべてブラウザ上で書いて実行しながら進められます。
      </p>

      <div className="mt-8 rounded-lg border p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-medium">学習の進捗</span>
          <span className="text-sm text-muted-foreground" data-testid="overall-progress">
            {doneCount} / {allLessons.length} レッスン({percent}%)
          </span>
        </div>
        <Progress value={percent} />
        <div className="mt-4">
          <Button asChild data-testid="resume-button">
            <Link to={`/tutorial/${resume.id}`}>
              {doneCount > 0 ? "続きから学ぶ" : "はじめる"} <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-bold tracking-tight">完走するとできるようになること</h2>
        <ul className="mt-3 space-y-2">
          {GOALS.map((goal) => (
            <li key={goal} className="flex gap-2.5 text-sm leading-6">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-lg border bg-muted/30 p-4 text-sm leading-6">
        <p>
          <span className="font-semibold">対象:</span>{" "}
          TypeScript は書けるけれど FP や Effect は初めて、という人。
          公式ドキュメントを読んだものの抽象度が高くて掴めなかった人にも向いています。
        </p>
        <p className="mt-2 text-muted-foreground">
          JavaScript / TypeScript の文法そのものの入門書ではありません。
        </p>
      </section>

      <div className="mt-12 space-y-12">
        {curriculum.parts.map((part) => {
          const partLessons = part.chapters.flatMap((c) => c.lessons)
          const partDone = partLessons.filter((l) => completed[l.id]).length
          return (
            <section key={part.slug}>
              <div className="mb-1 flex items-baseline justify-between gap-4">
                <h2 className="text-xl font-bold tracking-tight">{part.title}</h2>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {partDone} / {partLessons.length}
                </span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{part.description}</p>
              <div className="space-y-6">
                {part.chapters.map((chapter) => (
                  <div key={chapter.slug}>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                      {chapter.title}
                    </h3>
                    <ol className="divide-y rounded-lg border">
                      {chapter.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <Link
                            to={`/tutorial/${lesson.id}`}
                            className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50"
                          >
                            {completed[lesson.id] ? (
                              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                            ) : (
                              <Circle className="size-4 shrink-0 text-muted-foreground/40" />
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {lesson.meta.title}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {lesson.meta.summary}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
