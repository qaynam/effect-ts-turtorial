/**
 * レッスンごとの HTML を dist/ に書き出す。
 *
 * SPA なのでクライアント側で meta を差し替えても、JS を実行しない
 * クローラ(Slack / Discord / X など)には届かない。レッスンは
 * ビルド時に確定しているので、各 URL に対して meta 入りの HTML を
 * 焼いておく。中身は同じ SPA バンドルなので、表示後はいつもどおり
 * クライアントルーティングに引き継がれる。
 *
 * Workers Static Assets は /tutorial/a/b/c へのリクエストに
 * /tutorial/a/b/c/index.html を返すため、この配置で素直に効く。
 */
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import {
  loadLessons,
  ogFileName,
  projectRoot,
  siteDescription,
  siteName,
  siteUrl,
  siteUrlIsConfigured,
} from "./lib/lessons"

if (!siteUrlIsConfigured) {
  console.warn(
    "警告: SITE_URL が未設定のため OG の URL がローカル向けになります。\n" +
      "       公開用にビルドするときは .env に SITE_URL を設定してください(.env.example 参照)。",
  )
}

const distDir = path.join(projectRoot, "dist")

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

function metaTags({ title, description, url, image }: PageMeta): string {
  const t = escapeHtml(title)
  const d = escapeHtml(description)
  return [
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
}

/** index.html の <title> とプレースホルダをページ固有の meta に差し替える */
function renderHtml(template: string, meta: PageMeta): string {
  const withoutTitle = template.replace(/\s*<title>[\s\S]*?<\/title>/, "")
  return withoutTitle.replace("</head>", `${metaTags(meta)}\n  </head>`)
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

console.log(`dist/: index.html + ${lessons.length} 件のレッスン HTML を生成 (${siteUrl})`)
