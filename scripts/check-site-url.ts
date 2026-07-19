/**
 * デプロイ前ガード。SITE_URL が未設定のまま公開すると、OG 画像は
 * localhost を指したまま焼き込まれ、リンクを貼っても何も表示されない。
 * 気づきにくい壊れ方なので、デプロイ時だけは止める。
 */
import { siteUrl, siteUrlIsConfigured } from "./lib/lessons"

function abort(reason: string): never {
  console.error(
    `\n${reason}\n\n` +
      "  OG 画像の URL は絶対 URL でビルド時に HTML へ焼き込まれます。\n" +
      "  誤った URL のままデプロイすると、リンクを共有しても OG が表示されません。\n\n" +
      "  対処: .env の SITE_URL に公開先の URL を設定してください。\n" +
      "        (.env は git 管理外なので URL はリポジトリに残りません)\n",
  )
  process.exit(1)
}

if (!siteUrlIsConfigured) {
  abort("SITE_URL が設定されていないためデプロイを中止しました。")
}

if (/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/|$)/.test(siteUrl)) {
  abort(`SITE_URL がローカル向けのためデプロイを中止しました(${siteUrl})。`)
}

if (!siteUrl.startsWith("https://")) {
  abort(`SITE_URL が https ではありません(${siteUrl})。`)
}

console.log(`SITE_URL = ${siteUrl}`)
