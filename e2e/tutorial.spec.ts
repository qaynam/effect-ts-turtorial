import { expect, test } from "@playwright/test"

const WELCOME = "/tutorial/01-fp-basics/01-introduction/01-welcome"
const EFFECT_GEN = "/tutorial/03-effect-basics/02-building-programs/03-effect-gen"

test("レッスンを開いて Run すると出力が表示される", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: /Effect で学ぶ/ })).toBeVisible()

  await page.getByTestId("resume-button").click()
  await expect(page).toHaveURL(new RegExp(WELCOME))

  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 })

  await page.getByTestId("run-button").click()
  await expect(page.getByTestId("console-output")).not.toBeEmpty({ timeout: 30_000 })
})

test("解答を見る → Run でクリア判定になる", async ({ page }) => {
  await page.goto(WELCOME)
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 })

  await page.getByTestId("solve-button").click()
  await page.getByTestId("run-button").click()
  await expect(page.getByText("クリア!")).toBeVisible({ timeout: 30_000 })
})

test("effect を使うレッスンが実行できる(Effect.gen)", async ({ page }) => {
  await page.goto(EFFECT_GEN)
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 })

  await page.getByTestId("solve-button").click()
  await page.getByTestId("run-button").click()
  await expect(page.getByText("クリア!")).toBeVisible({ timeout: 30_000 })
})

test("無限ループはタイムアウトで停止する", async ({ page }) => {
  await page.goto(WELCOME)
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 })

  await page.waitForFunction(() => "__setEditorValue" in window)
  await page.evaluate(() => {
    ;(window as unknown as { __setEditorValue: (v: string) => void }).__setEditorValue(
      "while (true) {}",
    )
  })

  await page.getByTestId("run-button").click()
  await expect(page.getByTestId("console-output")).toContainText("停止しました", {
    timeout: 30_000,
  })
})

test("ダークモードとライトモードを切り替えられる", async ({ page }) => {
  await page.goto(WELCOME)
  const html = page.locator("html")
  const wasDark = await html.evaluate((el) => el.classList.contains("dark"))

  await page.getByTestId("theme-toggle").click()
  await expect(html).toHaveClass(wasDark ? /^(?!.*dark)/ : /dark/)

  // リロードしても保持される
  await page.reload()
  const nowDark = await html.evaluate((el) => el.classList.contains("dark"))
  expect(nowDark).toBe(!wasDark)
})

test("レッスンメニューから別のレッスンへ移動できる", async ({ page }) => {
  await page.goto(WELCOME)
  await page.getByTestId("lesson-menu").click()
  await page.getByRole("link", { name: /succeed と fail/ }).click()
  await expect(page).toHaveURL(/03-effect-basics\/01-first-steps\/02-succeed-fail/)
})
