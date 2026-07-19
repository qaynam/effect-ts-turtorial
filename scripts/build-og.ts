/**
 * OG 画像(1200x630 PNG)をビルド時に生成して dist/og/ に出力する。
 *
 * レッスンは content/ で静的に確定しているので、実行時に Worker で
 * 生成する必要がない。ビルド時に焼いて静的配信すれば、Worker の
 * バンドル上限もコールドスタートもキャッシュ設計も不要になる。
 */
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { Resvg } from "@resvg/resvg-js"
import satori from "satori"
import { loadLessons, ogFileName, projectRoot, siteName, siteUrl } from "./lib/lessons"

const OUT_DIR = path.join(projectRoot, "dist/og")
const WIDTH = 1200
const HEIGHT = 630

const fontDir = path.join(projectRoot, "node_modules/@fontsource/noto-sans-jp/files")
const font = (subset: string, weight: number) =>
  readFile(path.join(fontDir, `noto-sans-jp-${subset}-${weight}-normal.woff`))

// 和文と欧文でサブセットが分かれている。satori は同名フォントを複数渡すと
// 先頭だけを使い、和文が豆腐になるため、別名にして fontFamily の
// フォールバック指定(FONT_FAMILY)で繋ぐ。
const fonts = [
  { name: "OGLatin", data: await font("latin", 400), weight: 400 as const, style: "normal" as const },
  { name: "OGLatin", data: await font("latin", 700), weight: 700 as const, style: "normal" as const },
  { name: "OGJa", data: await font("japanese", 400), weight: 400 as const, style: "normal" as const },
  { name: "OGJa", data: await font("japanese", 700), weight: 700 as const, style: "normal" as const },
]
const FONT_FAMILY = "OGLatin, OGJa"

/** satori は React 要素か同じ形のプレーンオブジェクトを受け取る */
type Node = { type: string; props: Record<string, unknown> }
const el = (type: string, props: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  props: { ...props, children: children.length === 1 ? children[0] : children },
})

interface CardInput {
  eyebrow: string
  title: string
  summary: string
  /** フッター左。既定はサイト名 */
  brand?: string
  /** フッター右。レッスンでは「23 / 60」など */
  footnote: string
}

function card({ eyebrow, title, summary, brand = siteName, footnote }: CardInput): Node {
  return el(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        backgroundColor: "#0b0b0f",
        // Effect のブランドカラー(紫)に寄せたアクセント
        backgroundImage:
          "radial-gradient(circle at 88% 8%, rgba(139,92,246,0.30) 0%, rgba(11,11,15,0) 55%)",
        fontFamily: FONT_FAMILY,
        color: "#fafafa",
      },
    },
    el(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      el(
        "div",
        {
          style: {
            display: "flex",
            fontSize: 26,
            fontWeight: 700,
            color: "#a78bfa",
            letterSpacing: "0.04em",
          },
        },
        eyebrow,
      ),
      el(
        "div",
        {
          style: {
            display: "flex",
            marginTop: 24,
            fontSize: title.length > 24 ? 62 : 76,
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
          },
        },
        title,
      ),
      el(
        "div",
        {
          style: {
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            lineHeight: 1.5,
            color: "#a1a1aa",
          },
        },
        summary,
      ),
    ),
    el(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #27272a",
          paddingTop: 28,
          fontSize: 26,
        },
      },
      el("div", { style: { display: "flex", fontWeight: 700 } }, brand),
      el("div", { style: { display: "flex", color: "#71717a" } }, footnote),
    ),
  )
}

async function render(input: CardInput, file: string): Promise<number> {
  const svg = await satori(card(input) as unknown as React.ReactNode, {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  })
  const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
    .render()
    .asPng()
  await writeFile(path.join(OUT_DIR, file), png)
  return png.byteLength
}

await mkdir(OUT_DIR, { recursive: true })

const lessons = await loadLessons()
let total = 0

// トップページ用(既定の OG 画像)
total += await render(
  {
    eyebrow: "INTERACTIVE TUTORIAL",
    title: siteName,
    summary: "ブラウザで書いて、動かして学ぶ関数型プログラミングと Effect",
    brand: siteUrl.replace(/^https?:\/\//, ""),
    footnote: `全 ${lessons.length} レッスン`,
  },
  "default.png",
)

for (const lesson of lessons) {
  total += await render(
    {
      eyebrow: `${lesson.partTitle} / ${lesson.chapterTitle}`,
      title: lesson.title,
      summary: lesson.summary,
      footnote: `${lesson.index} / ${lesson.total}`,
    },
    ogFileName(lesson.id),
  )
}

console.log(
  `dist/og/: ${lessons.length + 1} 枚, 合計 ${(total / 1024 / 1024).toFixed(1)} MB`,
)
