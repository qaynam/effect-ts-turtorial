import { Link } from "react-router"
import { ArrowRight, CheckCircle2, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { allLessons, curriculum } from "@/content/loader"
import { useProgress } from "@/stores/progress"

export function HomePage() {
  const { completed, lastVisited } = useProgress()
  const doneCount = allLessons.filter((l) => completed[l.id]).length
  const resume =
    allLessons.find((l) => l.id === lastVisited) ??
    allLessons.find((l) => !completed[l.id]) ??
    allLessons[0]

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">
        Effect で学ぶ関数型プログラミング
      </h1>
      <p className="mt-3 text-muted-foreground">
        ブラウザ上でコードを書き、実行しながら、関数型プログラミング(FP)の基礎から{" "}
        <a
          href="https://effect.website"
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-2"
        >
          Effect
        </a>{" "}
        での実践までを学ぶチュートリアルです。
      </p>

      <div className="mt-6 flex items-center gap-4">
        <Button asChild size="lg" data-testid="resume-button">
          <Link to={`/tutorial/${resume.partSlug}/${resume.lessonSlug}`}>
            {doneCount > 0 ? "続きから学ぶ" : "はじめる"} <ArrowRight />
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          {doneCount} / {allLessons.length} レッスン完了
        </span>
      </div>

      <div className="mt-12 space-y-10">
        {curriculum.parts.map((part) => (
          <section key={part.slug}>
            <h2 className="mb-3 text-lg font-semibold tracking-tight">{part.title}</h2>
            <ol className="divide-y rounded-lg border">
              {part.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    to={`/tutorial/${lesson.partSlug}/${lesson.lessonSlug}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    {completed[lesson.id] ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted-foreground/40" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{lesson.meta.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {lesson.meta.summary}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <p className="mt-12 text-xs text-muted-foreground">
        現在は MVP 版のため一部のレッスンのみ公開しています。カリキュラム全体(5 Part・全
        55 レッスン)は順次追加されます。
      </p>
    </div>
  )
}
