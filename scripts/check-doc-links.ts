/** レッスンの frontmatter に書かれた Effect docs リンクの実在を検証する。 */
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { parse as parseYaml } from "yaml"

const root = path.resolve(import.meta.dirname, "..")
const contentDir = path.join(root, "content")

const urls = new Map<string, string[]>() // url -> lesson ids

const parts = await readdir(contentDir, { withFileTypes: true })
for (const part of parts) {
  if (!part.isDirectory()) continue
  const partDir = path.join(contentDir, part.name)
  for (const chapter of await readdir(partDir, { withFileTypes: true })) {
    if (!chapter.isDirectory()) continue
    const chapterDir = path.join(partDir, chapter.name)
    for (const lesson of await readdir(chapterDir, { withFileTypes: true })) {
      if (!lesson.isDirectory()) continue
      const md = await readFile(path.join(chapterDir, lesson.name, "lesson.md"), "utf8")
      const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md)
      if (!match) continue
      const meta = parseYaml(match[1]) as { docs?: { url: string }[] }
      for (const doc of meta.docs ?? []) {
        const id = `${part.name}/${chapter.name}/${lesson.name}`
        urls.set(doc.url, [...(urls.get(doc.url) ?? []), id])
      }
    }
  }
}

console.log(`${urls.size} 件のリンクを検証します…`)
let failed = 0
for (const [url, lessons] of urls) {
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow" })
    if (res.status === 405) {
      res = await fetch(url, { method: "GET", redirect: "follow" })
    }
    if (!res.ok) {
      failed++
      console.error(`NG ${res.status} ${url} (${lessons.join(", ")})`)
    } else {
      console.log(`OK ${url}`)
    }
  } catch (e) {
    failed++
    console.error(`NG fetch失敗 ${url} (${lessons.join(", ")}): ${String(e)}`)
  }
}

if (failed > 0) {
  console.error(`\n${failed} 件のリンクが無効です`)
  process.exit(1)
}
console.log("\n全リンク OK")
