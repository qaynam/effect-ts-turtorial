# Effect で学ぶ関数型プログラミング

ブラウザ上でコードを書き・実行しながら、関数型プログラミング(FP)の基礎から
[Effect](https://effect.website) での実践までを学ぶ、Svelte チュートリアル風のインタラクティブ教材アプリ。

## 起動

```sh
pnpm install
pnpm dev        # 初回は生成物(vendor バンドル・型定義)を自動生成してから起動する
```

## 仕組み

- **実行サンドボックス**: エディタの TypeScript を esbuild-wasm でブラウザ内バンドルし、
  使い捨ての Web Worker で実行する。`effect` / `@effect/platform` は
  `scripts/build-vendor.ts` が `public/vendor/` にプリバンドルした ESM を import する
- **エディタ**: Monaco。`scripts/build-types.ts` が node_modules から収集した effect の
  d.ts を登録しているため、型補完・型エラー・ホバーがそのまま動く
- **レッスン**: `content/<part>/<chapter>/<lesson>/` に `lesson.md`(frontmatter + 日本語本文)と
  `solution.ts`(+必要なら `initial.ts`)を置き、`content/curriculum.json` に 1 行足すだけで追加できる。
  `initial.ts` を省略すると直前レッスンの解答から始まる(執筆規約は `content/STYLE_GUIDE.md`)
- **進捗**: localStorage(zustand + persist)。サーバー不要の純粋な SPA。ダーク/ライトモード対応

## スクリプト

| コマンド | 説明 |
| --- | --- |
| `pnpm dev` | 開発サーバー起動(生成物が無ければ自動生成) |
| `pnpm gen` | vendor バンドルと Monaco 用型定義 JSON を再生成 |
| `pnpm build` | 本番ビルド |
| `pnpm e2e` | Playwright E2E テスト |
| `pnpm check-doc-links` | 全レッスンの Effect docs リンクの実在チェック |
| `pnpm verify-lessons` | 全レッスンの整合性検証(solution.ts を実行して expectedOutput と照合) |
| `pnpm typecheck-content` | 全レッスンコードの型チェック |

## カリキュラム(全 5 Part・約 55 レッスン予定)

1. **FP の基礎** — 純粋関数・副作用・イミュータブル・カリー化・pipe / flow
2. **FP の理論** — ADT・Option / Either 自作・Functor / Monad / Applicative と各種法則
3. **Effect 入門** — Effect 型・succeed / fail・runSync / runPromise・Effect.gen・エラーハンドリング
4. **Effect 実践** — Service / Layer・Scope・並行処理・Schedule・Ref・Schema・HttpClient
5. **総仕上げ** — Open-Meteo API を使った天気アプリ + 卒業課題(TODO アプリ)

現在は MVP として 6 レッスンを公開中。
