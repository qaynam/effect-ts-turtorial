import { useState } from "react"
import { Link } from "react-router"
import { CheckCircle2, ChevronDown, Circle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { contextOf, curriculum } from "@/content/loader"
import type { Lesson } from "@/content/types"
import { useProgress } from "@/stores/progress"

/**
 * ヘッダー中央のパンくず(Part / チャプター / レッスン名)。
 * クリックするとカリキュラム全体のツリーが開き、任意のレッスンへ移動できる。
 */
export function LessonMenu({ current }: { current: Lesson }) {
  const [open, setOpen] = useState(false)
  const completed = useProgress((s) => s.completed)
  const { part, chapterTitle } = contextOf(current)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted"
        data-testid="lesson-menu"
      >
        <span className="hidden truncate text-muted-foreground sm:inline">
          {part.title} / {chapterTitle} /
        </span>
        <span className="truncate font-medium">{current.meta.title}</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="max-h-[70vh] w-80 overflow-y-auto p-2" align="center">
        {curriculum.parts.map((p) => (
          <div key={p.slug} className="mb-2">
            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {p.title}
            </p>
            {p.chapters.map((chapter) => (
              <div key={chapter.slug}>
                <p className="px-2 pb-0.5 pt-1.5 text-xs font-medium text-muted-foreground/80">
                  {chapter.title}
                </p>
                {chapter.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    to={`/tutorial/${lesson.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted",
                      lesson.id === current.id && "bg-muted font-medium",
                    )}
                  >
                    {completed[lesson.id] ? (
                      <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="size-3.5 shrink-0 text-muted-foreground/40" />
                    )}
                    <span className="truncate">{lesson.meta.title}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
