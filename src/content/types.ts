/** レッスンコンテンツの型定義 */

export interface DocLink {
  label: string
  url: string
}

/** lesson.md の frontmatter */
export interface LessonMeta {
  title: string
  /** 目次に表示する 1 行説明 */
  summary: string
  /** 実行タイムアウト(ms)。既定 5000。Schedule 系レッスンで延長する */
  timeoutMs?: number
  /** 指定時、コンソール出力がこれと一致したら「クリア」判定 */
  expectedOutput?: string
  /** Effect 公式ドキュメントへのリンク */
  docs?: DocLink[]
}

export interface Lesson {
  /** 例: "01-fp-basics/01-getting-started/01-welcome"(ルーティングにもそのまま使う) */
  id: string
  partSlug: string
  chapterSlug: string
  lessonSlug: string
  meta: LessonMeta
  /** frontmatter を除いた日本語 Markdown 本文 */
  body: string
  /** initial.ts。省略されたレッスンは直前のレッスンの solution を引き継ぐ */
  initialCode: string
  solutionCode: string
}

export interface Chapter {
  slug: string
  title: string
  lessons: Lesson[]
}

export interface Part {
  slug: string
  title: string
  description: string
  chapters: Chapter[]
}

export interface Curriculum {
  parts: Part[]
}
