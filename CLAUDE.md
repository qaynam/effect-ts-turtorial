# effect-ts-turtorial

FP + Effect を学ぶ Svelte チュートリアル風教材アプリ(Vite + React SPA)。全体設計と経緯は README.md を参照。

## 重要な制約

- レッスン本文は**日本語**。コード・API 名は英語のまま。執筆規約は `content/STYLE_GUIDE.md`(必読)
- effect は **v3 系に固定**(v4 beta にしない)。バージョンを上げたら `pnpm gen` で vendor と型定義を必ず再生成する(エディタの型と実行時の実体がズレるため)
- サンドボックスで import できるのは `effect` と `@effect/platform`(facade)のみ。platform の facade にモジュールを足すときは `scripts/vendor-entries/effect-platform-entry.ts` と `scripts/build-types.ts` の facade d.ts の**両方**を更新する
- `public/vendor/` と `public/generated/` は生成物(gitignore 済み)。手で編集しない
- デプロイは Cloudflare Workers(`pnpm deploy`)。wrangler 設定ファイルは意図的にリポジトリに置いていない

## レッスンの追加方法

1. `content/<part>/<chapter>/<lesson>/` に `lesson.md` + `solution.ts`(+必要なら `initial.ts`)を作る。
   `initial.ts` を省略すると直前レッスンの solution が初期コードになる(Part 5 の連続構築で使用)
2. `content/curriculum.json` にスラッグを追加(Part → chapters → lessons の 3 階層)
3. 本文の書き方・差分マーカー(`+++追加+++` / `~~~削除~~~`)は `content/STYLE_GUIDE.md` に従う

## 検証

- `pnpm typecheck-content` — 全レッスンコードの型チェック
- `pnpm verify-lessons [フィルタ]` — solution.ts を実行し expectedOutput と照合
- `pnpm check-doc-links` — docs リンクの実在チェック
- `pnpm e2e` — Playwright(dev サーバー自動起動)
