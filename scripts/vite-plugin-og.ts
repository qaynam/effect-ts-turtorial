import { execFile } from "node:child_process"
import path from "node:path"
import { promisify } from "node:util"
import type { Plugin } from "vite"

const execFileAsync = promisify(execFile)

/**
 * ビルドの最後に OG 画像とレッスンごとの HTML を dist/ に生成する。
 *
 * これらは vite build の出力に *後から足す* 成果物なので、npm script の
 * 後段に置くと `vite build` を直接叩く経路(@cloudflare/vite-plugin 経由の
 * wrangler dev など)で消えてしまう。ビルドの一部として実行することで、
 * 誰がビルドを起動しても dist/ が完全になる。
 */
export function ogPlugin(): Plugin {
  const root = path.resolve(import.meta.dirname, "..")
  return {
    name: "tutorial-og",
    apply: "build",
    // 他プラグインが dist/ を書き終えた後に実行する
    enforce: "post",
    async closeBundle() {
      const tsx = path.join(root, "node_modules/.bin/tsx")
      for (const script of ["scripts/build-og.ts", "scripts/prerender.ts"]) {
        const { stdout, stderr } = await execFileAsync(tsx, [script], { cwd: root })
        if (stderr.trim()) this.warn(stderr.trim())
        if (stdout.trim()) this.info(stdout.trim())
      }
    },
  }
}
