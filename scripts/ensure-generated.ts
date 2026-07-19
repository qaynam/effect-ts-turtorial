/** dev 起動前に生成物(vendor バンドル・型定義 JSON)が無ければ生成する */
import { execSync } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")

const missing =
  !existsSync(path.join(root, "public/vendor/effect.js")) ||
  !existsSync(path.join(root, "public/generated/types-effect.json"))

if (missing) {
  console.log("生成物が見つからないため pnpm gen を実行します…")
  execSync("pnpm gen", { cwd: root, stdio: "inherit" })
}
