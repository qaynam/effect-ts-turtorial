import { expect, test } from "@playwright/test"

test("レッスンを開いて Run すると出力が表示される", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: /Effect で学ぶ/ })).toBeVisible()

  await page.getByTestId("resume-button").click()
  await expect(page).toHaveURL(/\/tutorial\/part-1-fp-basics\/01-welcome/)

  // Monaco エディタの読み込みを待つ
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 })

  await page.getByTestId("run-button").click()
  await expect(page.getByTestId("console-output")).toContainText("Hello, world!", {
    timeout: 30_000,
  })
})

test("解答を見る → Run でクリア判定になる", async ({ page }) => {
  await page.goto("/tutorial/part-1-fp-basics/01-welcome")
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 })

  await page.getByTestId("solve-button").click()
  await page.getByTestId("run-button").click()
  await expect(page.getByTestId("console-output")).toContainText("Hello, FP!", {
    timeout: 30_000,
  })
  await expect(page.getByText("クリア!")).toBeVisible()
})

test("effect を使うレッスンが実行できる(Effect.gen)", async ({ page }) => {
  await page.goto("/tutorial/part-3-effect-intro/08-effect-gen")
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 })

  await page.getByTestId("run-button").click()
  await expect(page.getByTestId("console-output")).toContainText("合計金額: 3300", {
    timeout: 30_000,
  })
})

test("無限ループはタイムアウトで停止する", async ({ page }) => {
  await page.goto("/tutorial/part-1-fp-basics/01-welcome")
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 })

  // エディタの内容を無限ループに書き換える
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
