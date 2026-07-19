import { useEffect } from "react"
import { Link } from "react-router"
import { ArrowRight, CheckCircle2, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { allLessons, curriculum } from "@/content/loader"
import { prefetchLessonAssets } from "@/lib/prefetch"
import { useProgress } from "@/stores/progress"

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
        このチュートリアルは、TypeScript は書けるけれど FP や Effect は初めての人が、
        素の TypeScript で純粋関数・参照透過性・Option / Either / ADT・map / flatMap の感覚を掴み、
        その後に{" "}
        <a
          href="https://effect.website"
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-2"
        >
          Effect
        </a>{" "}
        で副作用・失敗・依存関係・リトライ・並行処理を整理するところまで進みます。
        公式ドキュメントの抽象度で止まった人でも、全 {allLessons.length} レッスンをブラウザ上で書いて実行しながら、
        最後は API 呼び出しを含む小さな Weather App まで組み立てられます。
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
