/**
 * ビルド成果物(dist/)に対する検証。
 * dev サーバーにはプリレンダリング済み HTML が無いため、
 * OG メタとディープリンクはここで確かめる。
 */
import { createServer, type Server } from "node:http"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { expect, test } from "@playwright/test"
import { siteUrl } from "../scripts/lib/site"

const DIST = path.resolve(import.meta.dirname, "../dist")
const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".wasm": "application/wasm",
}

let server: Server
let baseURL: string

/** ビルド時に焼き込まれた公開 URL。ビルド側と同じ解決ロジックを共有する */
const SITE_URL = siteUrl

/** Workers Static Assets 相当の挙動(/foo → /foo/index.html、無ければ SPA fallback) */
test.beforeAll(async () => {
  server = createServer(async (req, res) => {
    const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0])
    const candidates = [
      path.join(DIST, urlPath),
      path.join(DIST, urlPath, "index.html"),
      path.join(DIST, "index.html"),
    ]
    for (const file of candidates) {
      if (!file.startsWith(DIST)) continue
      try {
        const body = await readFile(file)
        res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" })
        res.end(body)
        return
      } catch {
        // 次の候補へ
      }
    }
    res.writeHead(404).end()
  })
  await new Promise<void>((resolve) => server.listen(0, resolve))
  const addr = server.address()
  if (addr === null || typeof addr === "string") throw new Error("ポート取得に失敗しました")
  baseURL = `http://127.0.0.1:${addr.port}`
})

test.afterAll(() => {
  server.close()
})

test("レッスンのディープリンクに OG メタが焼き込まれている", async ({ request }) => {
  const res = await request.get(
    `${baseURL}/tutorial/02-fp-theory/03-abstraction/06-traverse`,
  )
  expect(res.status()).toBe(200)
  const html = await res.text()

  expect(html).toContain('<meta property="og:title" content="traverse と sequence |')
  expect(html).toContain(
    `<meta property="og:image" content="${SITE_URL}/og/02-fp-theory_03-abstraction_06-traverse.png"`,
  )
  expect(html).toContain('<meta name="twitter:card" content="summary_large_image"')
  expect(html).toContain('lang="ja"')
  // 旧タイトル(リポジトリ名)が残っていないこと
  expect(html).not.toContain("effect-ts-turtorial")
})

test("トップページの OG は既定画像を指す", async ({ request }) => {
  const html = await (await request.get(`${baseURL}/`)).text()
  expect(html).toContain(`content="${SITE_URL}/og/default.png"`)
})

test("OG 画像が PNG として配信される", async ({ request }) => {
  const res = await request.get(
    `${baseURL}/og/02-fp-theory_03-abstraction_06-traverse.png`,
  )
  expect(res.status()).toBe(200)
  const body = await res.body()
  // PNG シグネチャ
  expect(body.subarray(0, 4).toString("hex")).toBe("89504e47")
  expect(body.byteLength).toBeGreaterThan(10_000)
})

test("プリレンダリングした HTML から SPA が起動しレッスンが表示される", async ({ page }) => {
  await page.goto(`${baseURL}/tutorial/02-fp-theory/03-abstraction/06-traverse`)
  await expect(page.getByRole("heading", { name: "traverse と sequence" })).toBeVisible({
    timeout: 30_000,
  })
  // クライアントルーティングも動く
  await page.getByTestId("lesson-menu").click()
  await page.getByRole("link", { name: /ようこそ/ }).click()
  await expect(page).toHaveURL(/01-fp-basics\/01-introduction\/01-welcome/)
})
