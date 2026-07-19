/**
 * ユーザーの TypeScript コードをブラウザ内でバンドルする。
 *
 * - effect / @effect/platform は external とし、import 指定子を
 *   public/vendor/ のプリバンドル済み ESM の絶対 URL に書き換える
 *   (実行は Blob URL のモジュールなので相対パスでは解決できない)
 * - それ以外の import はエラーにして日本語メッセージで案内する
 */
import * as esbuild from "esbuild-wasm"
import wasmURL from "esbuild-wasm/esbuild.wasm?url"

const VENDOR_MODULES: Record<string, string> = {
  effect: "vendor/effect.js",
  "@effect/platform": "vendor/effect-platform.js",
}

function vendorUrl(file: string): string {
  return new URL(import.meta.env.BASE_URL + file, location.origin).href
}

let initPromise: Promise<void> | null = null

/** esbuild-wasm を初期化する(アプリ起動時に呼んでウォームアップする)。冪等 */
export function initBundler(): Promise<void> {
  initPromise ??= esbuild.initialize({ wasmURL }).catch((e) => {
    // 失敗を キャッシュしない(次の呼び出しで再試行できるように)
    initPromise = null
    throw e
  })
  return initPromise
}

export type BundleResult =
  | { ok: true; code: string }
  | { ok: false; message: string }

export async function bundleUserCode(source: string): Promise<BundleResult> {
  await initBundler()
  try {
    const result = await esbuild.build({
      entryPoints: ["/main.ts"],
      bundle: true,
      write: false,
      format: "esm",
      target: "es2022",
      logLevel: "silent",
      plugins: [
        {
          name: "tutorial-sandbox",
          setup(build) {
            build.onResolve({ filter: /.*/ }, (args) => {
              if (args.kind === "entry-point") {
                return { path: "/main.ts", namespace: "virtual" }
              }
              const vendorFile = VENDOR_MODULES[args.path]
              if (vendorFile !== undefined) {
                return { path: vendorUrl(vendorFile), external: true }
              }
              if (args.path.startsWith("effect/")) {
                return {
                  errors: [
                    {
                      text: `"${args.path}" のようなサブパス import はこのチュートリアルでは使えません。代わりに import { ... } from "effect" と書いてください。`,
                    },
                  ],
                }
              }
              if (args.path.startsWith("@effect/platform/")) {
                return {
                  errors: [
                    {
                      text: `"${args.path}" のようなサブパス import はこのチュートリアルでは使えません。代わりに import { ... } from "@effect/platform" と書いてください。`,
                    },
                  ],
                }
              }
              return {
                errors: [
                  {
                    text: `モジュール "${args.path}" は import できません。このチュートリアルで使えるのは "effect" と "@effect/platform" だけです。`,
                  },
                ],
              }
            })
            build.onLoad({ filter: /.*/, namespace: "virtual" }, () => ({
              contents: source,
              loader: "ts",
            }))
          },
        },
      ],
    })
    return { ok: true, code: result.outputFiles![0].text }
  } catch (e) {
    return { ok: false, message: formatBuildError(e) }
  }
}

function formatBuildError(e: unknown): string {
  if (e && typeof e === "object" && "errors" in e && Array.isArray(e.errors)) {
    const messages = (e.errors as esbuild.Message[]).map((m) => {
      const loc = m.location ? `(${m.location.line}行目) ` : ""
      return `${loc}${m.text}`
    })
    if (messages.length > 0) return messages.join("\n")
  }
  return e instanceof Error ? e.message : String(e)
}
