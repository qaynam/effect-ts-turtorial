/**
 * ビルド用スクリプトから content/ のカリキュラムを読むための共通ローダー。
 *
 * アプリ側(src/content/loader.ts)は Vite の import.meta.glob を使うため
 * Node から再利用できない。frontmatter だけで足りるビルド用途のために、
 * ここでは fs で同じ構造を読む。
 */
import { readFile } from "node:fs/promises"
import path from "node:path"
import { parse as parseYaml } from "yaml"
import { projectRoot } from "./site"

const contentDir = path.join(projectRoot, "content")

export interface LessonInfo {
  /** 例: "01-fp-basics/01-introduction/01-welcome" */
  id: string
  title: string
  summary: string
  partTitle: string
  chapterTitle: string
  /** カリキュラム全体を通した 1 始まりの通し番号 */
  index: number
  total: number
}

interface CurriculumSpec {
  parts: {
    slug: string
    title: string
    chapters: { slug: string; title: string; lessons: string[] }[]
  }[]
}

export async function loadLessons(): Promise<LessonInfo[]> {
  const spec = JSON.parse(
    await readFile(path.join(contentDir, "curriculum.json"), "utf8"),
  ) as CurriculumSpec

  const lessons: Omit<LessonInfo, "index" | "total">[] = []
  for (const part of spec.parts) {
    for (const chapter of part.chapters) {
      for (const lessonSlug of chapter.lessons) {
        const id = `${part.slug}/${chapter.slug}/${lessonSlug}`
        const md = await readFile(path.join(contentDir, id, "lesson.md"), "utf8")
        const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md)
        if (!match) throw new Error(`${id}/lesson.md に frontmatter がありません`)
        const meta = parseYaml(match[1]) as { title?: string; summary?: string }
        if (!meta.title || !meta.summary) {
          throw new Error(`${id}/lesson.md に title / summary が必要です`)
        }
        lessons.push({
          id,
          title: meta.title,
          summary: meta.summary,
          partTitle: part.title,
          chapterTitle: chapter.title,
        })
      }
    }
  }
  return lessons.map((l, i) => ({ ...l, index: i + 1, total: lessons.length }))
}

/** OG 画像のファイル名(スラッシュを含む id を平坦化する) */
export function ogFileName(lessonId: string): string {
  return `${lessonId.replaceAll("/", "_")}.png`
}

export {
  projectRoot,
  siteDescription,
  siteName,
  siteUrl,
  siteUrlIsConfigured,
} from "./site"
