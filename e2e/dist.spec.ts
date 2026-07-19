/** ビルド成果物を本番同等(Worker + 静的アセット)で配信した状態の検証。 */
import { expect, test } from "@playwright/test"
import { PREVIEW_URL } from "../playwright.config"

const LESSON = "/tutorial/02-fp-theory/03-abstraction/06-traverse"
const LESSON_OG = "/og/02-fp-theory_03-abstraction_06-traverse.png"

test("レッスンのディープリンクの OG がリクエスト元のオリジンで埋まる", async ({ request }) => {
  const res = await request.get(PREVIEW_URL + LESSON)
  expect(res.status()).toBe(200)
  const html = await res.text()

  expect(html).toContain('<meta property="og:title" content="traverse と sequence |')
  expect(html).toContain(
    `<meta property="og:image" content="${PREVIEW_URL}${LESSON_OG}"`,
  )
  expect(html).toContain(`<meta property="og:url" content="${PREVIEW_URL}${LESSON}"`)
  expect(html).toContain('<meta name="twitter:card" content="summary_large_image"')
  expect(html).toContain('lang="ja"')
  expect(html).not.toContain("%SITE_URL%")
  expect(html).not.toContain("effect-ts-turtorial")
})

test("トップページの OG は既定画像を指す", async ({ request }) => {
  const html = await (await request.get(`${PREVIEW_URL}/`)).text()
  expect(html).toContain(`content="${PREVIEW_URL}/og/default.png"`)
  expect(html).not.toContain("%SITE_URL%")
})

test("OG 画像が PNG として配信される", async ({ request }) => {
  const res = await request.get(PREVIEW_URL + LESSON_OG)
  expect(res.status()).toBe(200)
  expect(res.headers()["content-type"]).toContain("image/png")
  const body = await res.body()
  expect(body.subarray(0, 4).toString("hex")).toBe("89504e47")
  expect(body.byteLength).toBeGreaterThan(10_000)
})

test("OG 画像にキャッシュヘッダが付く", async ({ request }) => {
  const res = await request.get(`${PREVIEW_URL}/og/default.png`)
  expect(res.headers()["cache-control"]).toContain("max-age=86400")
})

test("プリレンダリングした HTML から SPA が起動しレッスンが表示される", async ({ page }) => {
  await page.goto(PREVIEW_URL + LESSON)
  await expect(page.getByRole("heading", { name: "traverse と sequence" })).toBeVisible({
    timeout: 30_000,
  })
  await page.getByTestId("lesson-menu").click()
  await page.getByRole("link", { name: /ようこそ/ }).click()
  await expect(page).toHaveURL(/01-fp-basics\/01-introduction\/01-welcome/)
})
