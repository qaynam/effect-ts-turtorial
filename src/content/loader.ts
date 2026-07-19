/**
 * content/ ディレクトリからカリキュラム全体を読み込む。
 *
 * 構造は Part → チャプター → レッスンの 3 階層。
 * レッスンの追加は content/<part>/<chapter>/<lesson>/{lesson.md, solution.ts}
 * (+ 必要なら initial.ts)を置いて content/curriculum.json に 1 行足すだけ。
 * initial.ts を省略したレッスンは直前のレッスンの solution.ts から始まる
 * (アプリを少しずつ育てていく Part 5 のような連続レッスン用)。
 *
 * 構成の不整合(ファイル不足など)は起動時に例外で検出する。
 */
import { parse as parseYaml } from "yaml"
import curriculumJson from "../../content/curriculum.json"
import type { Curriculum, Lesson, LessonMeta, Part } from "./types"

const rawFiles = import.meta.glob("../../content/**/*.{md,ts}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>

function fileFor(id: string, name: string): string | undefined {
  return rawFiles[`../../content/${id}/${name}`]
}

function requireFile(id: string, name: string): string {
  const content = fileFor(id, name)
  if (content === undefined) {
    throw new Error(`content/${id}/${name} が見つかりません`)
  }
  return content
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

function parseLessonMarkdown(raw: string, id: string): { meta: LessonMeta; body: string } {
  const match = FRONTMATTER_RE.exec(raw)
  if (!match) {
    throw new Error(`${id}/lesson.md に frontmatter がありません`)
  }
  const meta = parseYaml(match[1]) as LessonMeta
  if (!meta?.title || !meta?.summary) {
    throw new Error(`${id}/lesson.md の frontmatter に title / summary が必要です`)
  }
  return { meta, body: raw.slice(match[0].length) }
}

interface CurriculumSpec {
  parts: {
    slug: string
    title: string
    chapters: { slug: string; title: string; lessons: string[] }[]
  }[]
}

function buildCurriculum(): Curriculum {
  const spec = curriculumJson as CurriculumSpec
  let previousSolution: string | undefined

  const parts: Part[] = spec.parts.map((partSpec) => ({
    slug: partSpec.slug,
    title: partSpec.title,
    chapters: partSpec.chapters.map((chapterSpec) => ({
      slug: chapterSpec.slug,
      title: chapterSpec.title,
      lessons: chapterSpec.lessons.map((lessonSlug): Lesson => {
        const id = `${partSpec.slug}/${chapterSpec.slug}/${lessonSlug}`
        const { meta, body } = parseLessonMarkdown(requireFile(id, "lesson.md"), id)
        const solutionCode = requireFile(id, "solution.ts")
        const initialCode = fileFor(id, "initial.ts") ?? previousSolution
        if (initialCode === undefined) {
          throw new Error(`content/${id}/initial.ts が必要です(最初のレッスンは省略不可)`)
        }
        previousSolution = solutionCode
        return {
          id,
          partSlug: partSpec.slug,
          chapterSlug: chapterSpec.slug,
          lessonSlug,
          meta,
          body,
          initialCode,
          solutionCode,
        }
      }),
    })),
  }))
  return { parts }
}

export const curriculum: Curriculum = buildCurriculum()

/** 全レッスンをカリキュラム順にフラットに並べたもの */
export const allLessons: Lesson[] = curriculum.parts.flatMap((p) =>
  p.chapters.flatMap((c) => c.lessons),
)

export function findLesson(id: string): Lesson | undefined {
  return allLessons.find((l) => l.id === id)
}

/** 前後のレッスン(カリキュラム全体を通した順序) */
export function adjacentLessons(lesson: Lesson): {
  prev: Lesson | undefined
  next: Lesson | undefined
} {
  const i = allLessons.findIndex((l) => l.id === lesson.id)
  return { prev: allLessons[i - 1], next: allLessons[i + 1] }
}

export function contextOf(lesson: Lesson): { part: Part; chapterTitle: string } {
  const part = curriculum.parts.find((p) => p.slug === lesson.partSlug)!
  const chapter = part.chapters.find((c) => c.slug === lesson.chapterSlug)!
  return { part, chapterTitle: chapter.title }
}
