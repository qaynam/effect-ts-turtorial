/** レッスンごとに meta 入りの HTML を書き出す。 */
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import {
  ASSETS_DIR,
  loadLessons,
  ogFileName,
  projectRoot,
  siteDescription,
  siteName,
} from "./lib/lessons"

/** src/worker.ts が配信時に実際のオリジンへ置き換える */
const siteUrl = "%SITE_URL%"

const distDir = path.join(projectRoot, ASSETS_DIR)

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

interface PageMeta {
  title: string
  description: string
  url: string
  image: string
}

// 生成済みの HTML を再度テンプレートにしても二重挿入にならないようにする
const MARKER_START = "<!-- og:start -->"
const MARKER_END = "<!-- og:end -->"

function metaTags({ title, description, url, image }: PageMeta): string {
  const t = escapeHtml(title)
  const d = escapeHtml(description)
  const tags = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
    `<meta property="og:locale" content="ja_JP" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ]
    .map((tag) => `    ${tag}`)
    .join("\n")
  return `    ${MARKER_START}\n${tags}\n    ${MARKER_END}`
}

function renderHtml(template: string, meta: PageMeta): string {
  const cleaned = template
    .replace(new RegExp(`\\s*${MARKER_START}[\\s\\S]*?${MARKER_END}`), "")
    .replace(/\s*<title>[\s\S]*?<\/title>/, "")
  return cleaned.replace("</head>", `${metaTags(meta)}\n  </head>`)
}

const template = await readFile(path.join(distDir, "index.html"), "utf8")
const lessons = await loadLessons()

// トップページ
await writeFile(
  path.join(distDir, "index.html"),
  renderHtml(template, {
    title: siteName,
    description: siteDescription,
    url: `${siteUrl}/`,
    image: `${siteUrl}/og/default.png`,
  }),
)

for (const lesson of lessons) {
  const dir = path.join(distDir, "tutorial", lesson.id)
  await mkdir(dir, { recursive: true })
  await writeFile(
    path.join(dir, "index.html"),
    renderHtml(template, {
      title: `${lesson.title} | ${siteName}`,
      description: `${lesson.summary}(${lesson.partTitle} / ${lesson.chapterTitle}・${lesson.index}/${lesson.total})`,
      url: `${siteUrl}/tutorial/${lesson.id}`,
      image: `${siteUrl}/og/${ogFileName(lesson.id)}`,
    }),
  )
}

console.log(`dist/: index.html + ${lessons.length} 件のレッスン HTML を生成`)
