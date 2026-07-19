/** OG 画像(1200x630 PNG)を生成する。 */
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { Resvg } from "@resvg/resvg-js"
import satori from "satori"
import { ASSETS_DIR, loadLessons, ogFileName, projectRoot, siteName } from "./lib/lessons"

const OUT_DIR = path.join(projectRoot, ASSETS_DIR, "og")
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
  props:
    children.length === 0
      ? props
      : { ...props, children: children.length === 1 ? children[0] : children },
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

const INK = "#0f172a"
const MUTED = "#475569"
const TS_BLUE = "#3178c6"

function card({ eyebrow, title, summary, brand = siteName, footnote }: CardInput): Node {
  return el(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 36,
        backgroundColor: "#eef2f8",
        fontFamily: FONT_FAMILY,
      },
    },
    el(
      "div",
      {
        style: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          border: `4px solid ${INK}`,
          borderRadius: 40,
          backgroundColor: "#ffffff",
          backgroundImage:
            `radial-gradient(circle at 2% 4%, rgba(56,189,248,0.62) 0%, rgba(255,255,255,0) 58%),` +
            `radial-gradient(circle at 98% 0%, rgba(129,140,248,0.52) 0%, rgba(255,255,255,0) 55%),` +
            `radial-gradient(circle at 100% 96%, rgba(45,212,191,0.46) 0%, rgba(255,255,255,0) 52%),` +
            `radial-gradient(circle at 6% 100%, rgba(59,130,246,0.44) 0%, rgba(255,255,255,0) 55%)`,
          color: INK,
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
              color: TS_BLUE,
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
              marginTop: 22,
              fontSize: title.length > 24 ? 60 : 74,
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
              marginTop: 26,
              fontSize: 29,
              lineHeight: 1.5,
              color: MUTED,
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
            borderTop: `2px solid rgba(15,23,42,0.12)`,
            paddingTop: 26,
            fontSize: 25,
          },
        },
        el("div", { style: { display: "flex", fontWeight: 700 } }, brand),
        el("div", { style: { display: "flex", color: MUTED } }, footnote),
      ),
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
    summary: "ブラウザで書いて、動かして学ぶ関数型プログラミングと Effect-ts",
    // ドメインは環境で変わる(本番 / トンネル)ため画像には焼き込まない
    brand: "TypeScript + Effect-ts",
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
