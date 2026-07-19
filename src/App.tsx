import { lazy, Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router"
import { HomePage } from "@/pages/HomePage"

// レッスン画面は Monaco(数 MB)を含むため遅延ロードする。
// トップページを開いただけでエディタ一式を落とさないための分割。
const LessonPage = lazy(() =>
  import("@/pages/LessonPage").then((m) => ({ default: m.LessonPage })),
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/tutorial/:partSlug/:chapterSlug/:lessonSlug"
          element={
            <Suspense fallback={<LessonFallback />}>
              <LessonPage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

function LessonFallback() {
  return (
    <div className="flex h-[100dvh] items-center justify-center">
      <p className="text-sm text-muted-foreground">読み込み中…</p>
    </div>
  )
}

export default App
