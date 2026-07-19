import { BrowserRouter, Route, Routes } from "react-router"
import { HomePage } from "@/pages/HomePage"
import { LessonPage } from "@/pages/LessonPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/tutorial/:partSlug/:chapterSlug/:lessonSlug"
          element={<LessonPage />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
