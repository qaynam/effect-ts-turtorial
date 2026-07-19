/**
 * content/ ディレクトリからカリキュラム全体を読み込む。
 *
 * レッスンの追加は content/<part>/<lesson>/{lesson.md, initial.ts, solution.ts}
 * を置いて content/curriculum.json に 1 行足すだけで完結する。
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

function fileFor(partSlug: string, lessonSlug: string, name: string): string {
  const key = `../../content/${partSlug}/${lessonSlug}/${name}`
  const content = rawFiles[key]
  if (content === undefined) {
    throw new Error(`content/${partSlug}/${lessonSlug}/${name} が見つかりません`)
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

function buildCurriculum(): Curriculum {
  const spec = curriculumJson as {
    parts: { slug: string; title: string; lessons: string[] }[]
  }
  const parts: Part[] = spec.parts.map((partSpec) => {
    const lessons: Lesson[] = partSpec.lessons.map((lessonSlug, partIndex) => {
      const id = `${partSpec.slug}/${lessonSlug}`
      const { meta, body } = parseLessonMarkdown(
        fileFor(partSpec.slug, lessonSlug, "lesson.md"),
        id,
      )
      return {
        id,
        partSlug: partSpec.slug,
        lessonSlug,
        meta,
        body,
        initialCode: fileFor(partSpec.slug, lessonSlug, "initial.ts"),
        solutionCode: fileFor(partSpec.slug, lessonSlug, "solution.ts"),
        partIndex,
      }
    })
    return { slug: partSpec.slug, title: partSpec.title, lessons }
  })
  return { parts }
}

export const curriculum: Curriculum = buildCurriculum()

/** 全レッスンをカリキュラム順にフラットに並べたもの */
export const allLessons: Lesson[] = curriculum.parts.flatMap((p) => p.lessons)

export function findLesson(partSlug: string, lessonSlug: string): Lesson | undefined {
  return allLessons.find((l) => l.partSlug === partSlug && l.lessonSlug === lessonSlug)
}

/** 前後のレッスン(カリキュラム全体を通した順序) */
export function adjacentLessons(lesson: Lesson): {
  prev: Lesson | undefined
  next: Lesson | undefined
} {
  const i = allLessons.findIndex((l) => l.id === lesson.id)
  return { prev: allLessons[i - 1], next: allLessons[i + 1] }
}

export function partOf(lesson: Lesson): Part {
  return curriculum.parts.find((p) => p.slug === lesson.partSlug)!
}
