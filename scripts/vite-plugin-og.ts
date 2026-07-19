/** ビルドの最後に OG 画像とレッスン HTML を生成する Vite プラグイン。 */
import { execFile } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"
import { promisify } from "node:util"
import type { Plugin } from "vite"

const execFileAsync = promisify(execFile)

export function ogPlugin(): Plugin {
  const root = path.resolve(import.meta.dirname, "..")
  let done = false

  return {
    name: "tutorial-og",
    apply: "build",
    enforce: "post",
    async closeBundle() {
      // Worker 環境のビルドでも呼ばれるため、クライアントの出力が
      // 揃ってからの 1 回だけ実行する
      if (done || !existsSync(path.join(root, "dist/client/index.html"))) return
      done = true

      const tsx = path.join(root, "node_modules/.bin/tsx")
      for (const script of ["scripts/build-og.ts", "scripts/prerender.ts"]) {
        const { stdout, stderr } = await execFileAsync(tsx, [script], { cwd: root })
        if (stderr.trim()) this.warn(stderr.trim())
        if (stdout.trim()) this.info(stdout.trim())
      }
    },
  }
}
