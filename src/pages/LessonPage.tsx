import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { Link, Navigate, useParams } from "react-router"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Home,
  Play,
  RotateCcw,
  Square,
  Undo2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { CodeEditor } from "@/components/editor/CodeEditor"
import { LessonText } from "@/components/lesson/LessonText"
import { LessonMenu } from "@/components/layout/LessonMenu"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import {
  ConsolePanel,
  type ConsoleEntry,
  type RunStatus,
} from "@/components/output/ConsolePanel"
import { adjacentLessons, findLesson } from "@/content/loader"
import { initBundler } from "@/sandbox/bundler"
import { runUserCode, type RunHandle } from "@/sandbox/runner"
import { clearDraft, loadDraft, saveDraft } from "@/stores/drafts"
import { useProgress } from "@/stores/progress"

export function LessonPage() {
  const { partSlug, chapterSlug, lessonSlug } = useParams()
  const lesson = findLesson(`${partSlug}/${chapterSlug}/${lessonSlug}`)
  if (!lesson) return <Navigate to="/" replace />
  return <LessonView key={lesson.id} lessonId={lesson.id} />
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const media = window.matchMedia(query)
    const handleChange = () => setMatches(media.matches)
    handleChange()
    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [query])

  return matches
}

function LessonView({ lessonId }: { lessonId: string }) {
  const lesson = findLesson(lessonId)!
  const { prev, next } = adjacentLessons(lesson)
  const isMobile = useMediaQuery("(max-width: 799px)")

  const { markCompleted, setLastVisited } = useProgress()

  const [code, setCode] = useState(() => loadDraft(lesson.id) ?? lesson.initialCode)
  const [entries, setEntries] = useState<ConsoleEntry[]>([])
  const [status, setStatus] = useState<RunStatus>("idle")
  const [cleared, setCleared] = useState(false)
  const [showingSolution, setShowingSolution] = useState(false)
  const [mobilePane, setMobilePane] = useState<"text" | "editor">("text")

  const runHandleRef = useRef<RunHandle | null>(null)
  const entriesRef = useRef<ConsoleEntry[]>([])
  /** ユーザー自身のコード(解答表示中も保持しておく) */
  const userCodeRef = useRef(code)
  /** いまエディタに表示されているコード。Run はこれを実行する */
  const displayedCodeRef = useRef(code)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLastVisited(lesson.id)
    // 初回 Run を待たせないよう、レッスンを開いた時点で wasm を温めておく
    void initBundler().catch(() => {
      /* 失敗しても Run 時に再試行される */
    })
    return () => runHandleRef.current?.stop()
  }, [lesson.id, setLastVisited])

  const appendEntry = (entry: ConsoleEntry) => {
    entriesRef.current = [...entriesRef.current, entry]
    setEntries(entriesRef.current)
  }

  const checkCleared = useCallback(() => {
    const expected = lesson.meta.expectedOutput
    if (expected === undefined) return
    const actual = entriesRef.current
      .filter((e) => e.kind === "log")
      .map((e) => e.text)
      .join("\n")
      .trim()
    if (actual === expected.trim()) {
      setCleared(true)
      markCompleted(lesson.id)
    }
  }, [lesson, markCompleted])

  const handleRun = useCallback(() => {
    runHandleRef.current?.stop()
    entriesRef.current = []
    setEntries([])
    setCleared(false)
    setStatus("running")
    runHandleRef.current = runUserCode(displayedCodeRef.current, {
      timeoutMs: lesson.meta.timeoutMs,
      onEvent: (event) => {
        switch (event.type) {
          case "log":
            appendEntry({ kind: "log", level: event.level, text: event.parts.join(" ") })
            // done 後に届く fork 済み Fiber のログでもクリア判定を更新する
            checkCleared()
            break
          case "done":
            setStatus("done")
            checkCleared()
            break
          case "error":
            appendEntry({ kind: "error", text: event.message })
            setStatus("error")
            break
          case "timeout":
            appendEntry({
              kind: "system",
              text: `${event.timeoutMs / 1000} 秒以内に終わらなかったため停止しました(無限ループになっていませんか?)`,
            })
            setStatus("timeout")
            break
          case "bundle-error":
            appendEntry({ kind: "error", text: event.message })
            setStatus("error")
            break
        }
      },
    })
  }, [lesson, checkCleared])

  const handleStop = () => {
    runHandleRef.current?.stop()
    setStatus("idle")
    appendEntry({ kind: "system", text: "実行を停止しました" })
  }

  const handleChange = (nextCode: string) => {
    setCode(nextCode)
    displayedCodeRef.current = nextCode
    if (showingSolution) return // 解答表示中の編集は下書きに保存しない
    userCodeRef.current = nextCode
    if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => saveDraft(lesson.id, nextCode), 500)
  }

  const handleReset = () => {
    runHandleRef.current?.stop()
    clearDraft(lesson.id)
    setShowingSolution(false)
    userCodeRef.current = lesson.initialCode
    displayedCodeRef.current = lesson.initialCode
    setCode(lesson.initialCode)
    setStatus("idle")
    entriesRef.current = []
    setEntries([])
    setCleared(false)
  }

  const toggleSolution = () => {
    if (showingSolution) {
      setShowingSolution(false)
      displayedCodeRef.current = userCodeRef.current
      setCode(userCodeRef.current)
    } else {
      setShowingSolution(true)
      displayedCodeRef.current = lesson.solutionCode
      setCode(lesson.solutionCode)
      markCompleted(lesson.id)
    }
  }

  const running = status === "running" || status === "bundling"

  const editorToolbar = (
    <div className="flex h-11 shrink-0 items-center gap-1.5 overflow-x-auto border-b px-3">
      <Button size="sm" onClick={handleRun} disabled={running} data-testid="run-button">
        <Play /> Run
      </Button>
      {running && (
        <Button size="sm" variant="outline" onClick={handleStop}>
          <Square /> 停止
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={handleReset}>
        <RotateCcw /> リセット
      </Button>
      <div className="flex-1" />
      <span className="hidden text-xs text-muted-foreground lg:inline">
        ⌘+Enter で実行
      </span>
      <Button
        size="sm"
        variant={showingSolution ? "secondary" : "outline"}
        onClick={toggleSolution}
        data-testid="solve-button"
      >
        {showingSolution ? (
          <>
            <Undo2 /> 自分のコードに戻す
          </>
        ) : (
          <>
            <Eye /> 解答を見る
          </>
        )}
      </Button>
    </div>
  )

  const editorPane = (
    <div className="flex h-full min-h-0 flex-col">
      {editorToolbar}
      <div className="min-h-0 flex-1">
        <CodeEditor value={code} onChange={handleChange} onRun={handleRun} />
      </div>
    </div>
  )

  const outputPane = (
    <div className="h-full min-h-0">
      <ConsolePanel entries={entries} status={status} cleared={cleared} />
    </div>
  )

  const editorWorkspace = (
    <ResizablePanelGroup orientation="vertical">
      <ResizablePanel defaultSize="65" minSize="20">
        {editorPane}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="35" minSize="15">
        {outputPane}
      </ResizablePanel>
    </ResizablePanelGroup>
  )

  const lessonTextPane = (
    <div className="lesson-scrollbar h-full overflow-y-auto">
      <LessonText lesson={lesson} next={next} />
    </div>
  )

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <header className="grid h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b px-2">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <Home className="size-4" />
              <span className="hidden font-bold tracking-tight md:inline">
                Effect<span className="font-normal text-muted-foreground">で学ぶFP</span>
              </span>
            </Link>
          </Button>
        </div>
        <div className="flex min-w-0 items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" disabled={!prev} asChild={!!prev} aria-label="前のレッスン">
            {prev ? (
              <Link to={`/tutorial/${prev.id}`}>
                <ChevronLeft />
              </Link>
            ) : (
              <span>
                <ChevronLeft />
              </span>
            )}
          </Button>
          <LessonMenu current={lesson} />
          <Button variant="ghost" size="icon-sm" disabled={!next} asChild={!!next} aria-label="次のレッスン">
            {next ? (
              <Link to={`/tutorial/${next.id}`} data-testid="next-lesson">
                <ChevronRight />
              </Link>
            ) : (
              <span>
                <ChevronRight />
              </span>
            )}
          </Button>
        </div>
        <div className="flex items-center justify-end">
          <ThemeToggle />
        </div>
      </header>

      {isMobile ? (
        <MobileLessonLayout
          pane={mobilePane}
          onPaneChange={setMobilePane}
          text={lessonTextPane}
          editor={editorWorkspace}
        />
      ) : (
        <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
          <ResizablePanel defaultSize="30" minSize="25" maxSize="50">
            {lessonTextPane}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="70" minSize="50">
            {editorWorkspace}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  )
}

function MobileLessonLayout({
  pane,
  onPaneChange,
  text,
  editor,
}: {
  pane: "text" | "editor"
  onPaneChange: (pane: "text" | "editor") => void
  text: ReactNode
  editor: ReactNode
}) {
  const showingEditor = pane === "editor"

  return (
    <>
      <main className="min-h-0 flex-1 overflow-hidden">
        {pane === "text" ? text : editor}
      </main>
      <div className="grid h-11 shrink-0 grid-cols-[1fr_4rem_1fr] items-center gap-2 border-t bg-background px-4 text-xs font-medium">
        <button
          type="button"
          className={
            pane === "text"
              ? "justify-self-end text-foreground"
              : "justify-self-end text-muted-foreground"
          }
          aria-current={pane === "text" ? "page" : undefined}
          onClick={() => onPaneChange("text")}
        >
          解説
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={showingEditor}
          aria-label="解説とエディタを切り替え"
          className="relative mx-auto h-6 w-11 rounded-full border bg-muted transition-colors aria-checked:bg-primary"
          onClick={() => onPaneChange(pane === "text" ? "editor" : "text")}
        >
          <span
            className={
              showingEditor
                ? "absolute left-0.5 top-0.5 size-5 translate-x-5 rounded-full bg-background shadow-sm transition-transform"
                : "absolute left-0.5 top-0.5 size-5 rounded-full bg-background shadow-sm transition-transform"
            }
          />
        </button>
        <button
          type="button"
          className={
            showingEditor
              ? "justify-self-start text-foreground"
              : "justify-self-start text-muted-foreground"
          }
          aria-current={showingEditor ? "page" : undefined}
          onClick={() => onPaneChange("editor")}
        >
          エディタ
        </button>
      </div>
    </>
  )
}
