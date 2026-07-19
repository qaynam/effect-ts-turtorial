/** レッスン画面の重いアセットを裏で先読みする。 */

let started = false

/** 冪等。ネットワークが細い環境では何も起こらない(取得は失敗しても無視) */
export function prefetchLessonAssets(): void {
  if (started) return
  started = true

  const run = () => {
    // レッスン画面のチャンク。読み込まれると CodeEditor 経由で
    // Monaco のセットアップ(型定義 JSON の取得)も始まる
    void import("@/pages/LessonPage").catch(() => {})
    // TypeScript のブラウザ内バンドラ(wasm)
    void import("@/sandbox/bundler").then((m) => m.initBundler()).catch(() => {})
  }

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(run, { timeout: 3000 })
  } else {
    setTimeout(run, 1000)
  }
}
