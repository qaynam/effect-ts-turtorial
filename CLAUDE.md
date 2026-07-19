# effect-ts-turtorial

FP + Effect を学ぶ Svelte チュートリアル風教材アプリ(Vite + React SPA)。全体設計と経緯は README.md を参照。

## 重要な制約

- レッスン本文は**日本語**。コード・API 名は英語のまま
- effect は **v3 系に固定**(v4 beta にしない)。バージョンを上げたら `pnpm gen` で vendor と型定義を必ず再生成する(エディタの型と実行時の実体がズレるため)
- サンドボックスで import できるのは `effect` と `@effect/platform`(facade)のみ。platform の facade に モジュールを足すときは `scripts/vendor-entries/effect-platform-entry.ts` と `scripts/build-types.ts` の facade d.ts の**両方**を更新する
- `public/vendor/` と `public/generated/` は生成物(gitignore 済み)。手で編集しない

## レッスンの追加方法

1. `content/<part>/<lesson>/` に `lesson.md` + `initial.ts` + `solution.ts` を作る
2. `content/curriculum.json` にスラッグを追加
3. `initial.ts` / `solution.ts` は実際に型チェックが通ること(strict)。`expectedOutput` を frontmatter に書くとクリア判定が付く
4. docs リンクを足したら `pnpm check-doc-links` で実在確認

## 検証

- `pnpm e2e`(Playwright、dev サーバーは自動起動)
- 手動: `pnpm dev` → レッスンで Run / 解答を見る / タイムアウト(無限ループ)を確認
