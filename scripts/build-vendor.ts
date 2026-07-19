/**
 * effect / @effect/platform をブラウザ実行サンドボックス用の ESM に
 * プリバンドルして public/vendor/ に出力する。
 *
 * splitting: true で両エントリをまとめてビルドすることで、effect 本体は
 * 共有チャンクとして 1 コピーだけ生成される(2 コピーあると Context.Tag の
 * 同一性が壊れるため必須)。
 */
import { build } from "esbuild"
import { rm } from "node:fs/promises"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const outdir = path.join(root, "public/vendor")

await rm(outdir, { recursive: true, force: true })

const result = await build({
  entryPoints: {
    effect: "effect",
    "effect-platform": path.join(
      import.meta.dirname,
      "vendor-entries/effect-platform-entry.ts",
    ),
  },
  bundle: true,
  format: "esm",
  splitting: true,
  outdir,
  minify: true,
  target: "es2022",
  platform: "browser",
  metafile: true,
  logLevel: "info",
  absWorkingDir: root,
})

const outputs = Object.entries(result.metafile.outputs)
for (const [file, meta] of outputs) {
  console.log(`${file}: ${(meta.bytes / 1024).toFixed(0)} KB`)
}
