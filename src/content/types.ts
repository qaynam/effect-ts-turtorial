/** レッスンコンテンツの型定義 */

export interface DocLink {
  label: string
  url: string
}

/** lesson.md の frontmatter */
export interface LessonMeta {
  title: string
  /** 目次・ナビに表示する 1 行説明 */
  summary: string
  /** Effect 公式ドキュメントへのリンク */
  docs?: DocLink[]
  /** 実行タイムアウト(ms)。既定 5000。Schedule 系レッスンで延長する */
  timeoutMs?: number
  /** 指定時、コンソール出力がこれと一致したら「クリア」判定 */
  expectedOutput?: string
  /** true なら DOM プレビューペインを表示(Part 5 用) */
  preview?: boolean
}

export interface Lesson {
  /** 例: "part-1-fp-basics/01-welcome" */
  id: string
  partSlug: string
  lessonSlug: string
  meta: LessonMeta
  /** frontmatter を除いた日本語 Markdown 本文 */
  body: string
  initialCode: string
  solutionCode: string
  /** Part 内での 0 始まり位置 */
  partIndex: number
}

export interface Part {
  slug: string
  title: string
  lessons: Lesson[]
}

export interface Curriculum {
  parts: Part[]
}
