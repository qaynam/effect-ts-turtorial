/** サイトのブランド情報(site.config.json)を読む。 */
import { readFileSync } from "node:fs"
import path from "node:path"

export const projectRoot = path.resolve(import.meta.dirname, "../..")

const config = JSON.parse(
  readFileSync(path.join(projectRoot, "site.config.json"), "utf8"),
) as { name: string; description: string }

export const siteName = config.name
export const siteDescription = config.description

/** vite build の静的アセット出力先(Worker 併用時は dist/client) */
export const ASSETS_DIR = "dist/client"
