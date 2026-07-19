/**
 * 全レッスンの整合性検証(CI / 執筆時のセルフチェック用)。
 *
 * 1. curriculum.json に載っている全レッスンのファイル存在チェック
 * 2. solution.ts(あれば initial.ts も)を tsx で実際に実行し、
 *    frontmatter の expectedOutput と stdout が一致するか検証
 *
 * 使い方:
 *   npx tsx scripts/verify-lessons.ts             # 全レッスン
 *   npx tsx scripts/verify-lessons.ts 02-fp-theory # パスに部分一致するものだけ
 */
import { execFile } from "node:child_process"
import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { promisify } from "node:util"
import { parse as parseYaml } from "yaml"

const execFileAsync = promisify(execFile)
const root = path.resolve(import.meta.dirname, "..")
const filter = process.argv[2]

interface LessonRef {
  id: string
  dir: string
}

const spec = JSON.parse(
  await readFile(path.join(root, "content/curriculum.json"), "utf8"),
) as {
  parts: { slug: string; chapters: { slug: string; lessons: string[] }[] }[]
}

const lessons: LessonRef[] = spec.parts.flatMap((p) =>
  p.chapters.flatMap((c) =>
    c.lessons.map((l) => ({
      id: `${p.slug}/${c.slug}/${l}`,
      dir: path.join(root, "content", p.slug, c.slug, l),
    })),
  ),
)

let failed = 0
let ran = 0
let firstLesson = true

for (const lesson of lessons) {
  // 最初のレッスン以外は initial.ts 省略可(前レッスンの solution を引き継ぐ)
  const requiredFiles = ["lesson.md", "solution.ts", ...(firstLesson ? ["initial.ts"] : [])]
  firstLesson = false
  if (filter && !lesson.id.includes(filter)) continue
  const missing = requiredFiles.filter((f) => !existsSync(path.join(lesson.dir, f)))
  if (missing.length > 0) {
    failed++
    console.error(`NG ${lesson.id}: ファイル不足 (${missing.join(", ")})`)
    continue
  }

  const md = await readFile(path.join(lesson.dir, "lesson.md"), "utf8")
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md)
  if (!fm) {
    failed++
    console.error(`NG ${lesson.id}: frontmatter がありません`)
    continue
  }
  const meta = parseYaml(fm[1]) as {
    title?: string
    expectedOutput?: string
    timeoutMs?: number
  }
  if (!meta.title) {
    failed++
    console.error(`NG ${lesson.id}: title がありません`)
    continue
  }
  if (/^#\s/m.test(md.slice(fm[0].length).trimStart().split("\n")[0] ?? "")) {
    console.warn(`WARN ${lesson.id}: 本文が h1 で始まっています(title は frontmatter から表示されるので不要)`)
  }

  if (meta.expectedOutput === undefined) {
    console.log(`OK ${lesson.id} (実行検証なし)`)
    continue
  }

  ran++
  try {
    const { stdout } = await execFileAsync(
      "npx",
      ["tsx", path.join(lesson.dir, "solution.ts")],
      { cwd: root, timeout: (meta.timeoutMs ?? 5000) + 15000 },
    )
    const actual = stdout.trim()
    const expected = meta.expectedOutput.trim()
    if (actual === expected) {
      console.log(`OK ${lesson.id}`)
    } else {
      failed++
      console.error(
        `NG ${lesson.id}: 出力が expectedOutput と一致しません\n--- expected ---\n${expected}\n--- actual ---\n${actual}\n---`,
      )
    }
  } catch (e) {
    failed++
    const msg = e instanceof Error ? e.message.split("\n").slice(0, 5).join("\n") : String(e)
    console.error(`NG ${lesson.id}: solution.ts の実行に失敗\n${msg}`)
  }
}

console.log(`\n${lessons.length} レッスン中、実行検証 ${ran} 件、失敗 ${failed} 件`)
if (failed > 0) process.exit(1)
