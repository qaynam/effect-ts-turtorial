/**
 * Monaco の TypeScript language service に登録する型定義を収集し、
 * src/generated/types-effect.json に { "/node_modules/...": content } の
 * 形で出力する。
 *
 * 実行 vendor バンドル(scripts/build-vendor.ts)と同じ node_modules から
 * 生成するため、エディタの型と実行時の挙動が必ず一致する。
 */
import { existsSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { glob } from "node:fs/promises"

const root = path.resolve(import.meta.dirname, "..")
const require = createRequire(path.join(root, "package.json"))

/** 型解決に必要なパッケージ。fast-check と @standard-schema/spec は
 *  effect の d.ts が参照している間接依存 */
const PACKAGES = ["effect", "@effect/platform", "fast-check", "@standard-schema/spec"]

function packageDirFromEntry(entryFile: string, name: string): string {
  // exports に "./package.json" が無いパッケージがあるため、
  // エントリファイルから上方向に package.json を探す
  let dir = path.dirname(entryFile)
  while (dir !== path.dirname(dir)) {
    if (path.basename(dir) === path.basename(name) && existsSync(path.join(dir, "package.json"))) {
      return dir
    }
    dir = path.dirname(dir)
  }
  throw new Error(`package root not found for ${name} (entry: ${entryFile})`)
}

function resolvePackageDir(name: string): string {
  // fast-check 等は hoist されていないため effect のコンテキストから解決する
  const effectDir = path.dirname(require.resolve("effect/package.json"))
  const req = createRequire(path.join(effectDir, "package.json"))
  let entry: string
  try {
    entry = req.resolve(name)
  } catch {
    entry = require.resolve(name)
  }
  return packageDirFromEntry(entry, name)
}

const files: Record<string, string> = {}

for (const name of PACKAGES) {
  const dir = resolvePackageDir(name)
  const virtualBase = `/node_modules/${name}`
  files[`${virtualBase}/package.json`] = await readFile(
    path.join(dir, "package.json"),
    "utf8",
  )
  for await (const entry of glob("**/*.d.ts", { cwd: dir })) {
    if (entry.includes("node_modules/")) continue
    files[`${virtualBase}/${entry}`] = await readFile(path.join(dir, entry), "utf8")
  }
}

// 実行サンドボックスの @effect/platform は facade(HTTP クライアント関連のみ)
// なので、エディタの型もそれに合わせる。package.json の types をこの facade に
// 向け、フルの index.d.ts を隠す。
files["/node_modules/@effect/platform/facade.d.ts"] = `
export * as FetchHttpClient from "./dist/dts/FetchHttpClient.js"
export * as Headers from "./dist/dts/Headers.js"
export * as HttpBody from "./dist/dts/HttpBody.js"
export * as HttpClient from "./dist/dts/HttpClient.js"
export * as HttpClientError from "./dist/dts/HttpClientError.js"
export * as HttpClientRequest from "./dist/dts/HttpClientRequest.js"
export * as HttpClientResponse from "./dist/dts/HttpClientResponse.js"
export * as UrlParams from "./dist/dts/UrlParams.js"
`
{
  const pkg = JSON.parse(files["/node_modules/@effect/platform/package.json"])
  pkg.types = "./facade.d.ts"
  if (pkg.exports?.["."]) {
    pkg.exports["."] = { types: "./facade.d.ts" }
  }
  files["/node_modules/@effect/platform/package.json"] = JSON.stringify(pkg)
}

// バンドルに含めず fetch で遅延ロードするため public/ に出力する
const outDir = path.join(root, "public/generated")
await mkdir(outDir, { recursive: true })
const outFile = path.join(outDir, "types-effect.json")
const json = JSON.stringify(files)
await writeFile(outFile, json)

const count = Object.keys(files).length
console.log(`${outFile}: ${count} files, ${(json.length / 1024 / 1024).toFixed(1)} MB`)
