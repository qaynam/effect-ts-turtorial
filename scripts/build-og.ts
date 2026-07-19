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
import { loadLessons, ogFileName, projectRoot, siteName } from "./lib/lessons"

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

// TypeScript のブランド青 (#3178C6) を基調に、白へ抜ける寒色グラデーション
const NAVY = "#0a1220"
const TS_BLUE = "#3178c6"
const SKY = "#38bdf8"

function card({ eyebrow, title, summary, brand = siteName, footnote }: CardInput): Node {
  return el(
    "div",
    {
      style: {
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        backgroundColor: NAVY,
        backgroundImage:
          `radial-gradient(circle at 96% 4%, rgba(56,189,248,0.30) 0%, rgba(10,18,32,0) 52%),` +
          `radial-gradient(circle at 4% 100%, rgba(49,120,198,0.26) 0%, rgba(10,18,32,0) 48%)`,
        fontFamily: FONT_FAMILY,
        color: "#f8fafc",
      },
    },
    // 上端のアクセントバー(青 → 空色 → 白)
    el("div", {
      style: {
        display: "flex",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: 8,
        backgroundImage: `linear-gradient(90deg, ${TS_BLUE} 0%, ${SKY} 55%, #e0f2fe 100%)`,
      },
    }),
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
            color: "#7dd3fc",
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
            color: "#94a3b8",
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
          borderTop: "1px solid rgba(148,163,184,0.22)",
          paddingTop: 28,
          fontSize: 26,
        },
      },
      el("div", { style: { display: "flex", fontWeight: 700 } }, brand),
      el("div", { style: { display: "flex", color: "#64748b" } }, footnote),
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
