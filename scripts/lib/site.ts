/**
 * サイトの公開 URL とブランド情報。
 *
 * OG の og:image / og:url は絶対 URL でなければクローラが解決できないため、
 * ビルド時に HTML へ焼き込む必要がある。デプロイ先をリポジトリに残さないよう、
 * URL は環境変数(.env でも可)から取る。
 *
 * ビルドスクリプトと E2E の両方がここを参照する(値がずれると
 * 「テストは通るのに OG が壊れている」状態になるため一本化している)。
 */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

export const projectRoot = path.resolve(import.meta.dirname, "../..")

// 既にシェルで設定されている値は上書きしない
const envFile = path.join(projectRoot, ".env")
if (existsSync(envFile)) {
  process.loadEnvFile(envFile)
}

const config = JSON.parse(
  readFileSync(path.join(projectRoot, "site.config.json"), "utf8"),
) as { name: string; description: string }

/** SITE_URL 未設定時のフォールバック。OG は成立しないが、ビルド自体は通す */
const FALLBACK_URL = "http://localhost:4173"

export const siteUrl = (process.env.SITE_URL ?? FALLBACK_URL).replace(/\/$/, "")
export const siteUrlIsConfigured = process.env.SITE_URL !== undefined
export const siteName = config.name
export const siteDescription = config.description
