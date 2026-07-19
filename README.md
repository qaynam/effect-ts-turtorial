# Effect-ts で学ぶ関数型プログラミング

ブラウザ上でコードを書き・実行しながら、関数型プログラミング(FP)の基礎から
[Effect](https://effect.website) での実践までを学ぶ、Svelte チュートリアル風のインタラクティブ教材アプリ。

## 起動

```sh
pnpm install
pnpm dev        # 初回は生成物(vendor バンドル・型定義)を自動生成してから起動する
```

## デプロイ

```sh
pnpm deploy
```

OG の絶対 URL は配信時に Worker がリクエストの Host から埋めるため、
公開 URL の設定は不要(本番・プレビュー・トンネルのどれでも正しくなる)。

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
- **OGP**: クローラは JS を実行しないので、OG 画像(satori + resvg)とレッスンごとの
  meta 入り HTML をビルド時に生成する。絶対 URL の部分だけは配信時に
  `src/worker.ts` がリクエストの Host から埋める

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

## カリキュラム(全 5 Part・60 レッスン)

1. **FP の基礎**(12) — 純粋関数・副作用・アクション/計算/データ・参照透過性・イミュータビリティ・高階関数・畳み込み・クロージャ・カリー化・部分適用・pipe / flow
2. **FP の理論**(13) — ADT・パターンマッチ・Option / Either の自作・Functor / Monad / Applicative と各種法則・traverse / sequence
3. **Effect 入門**(12) — Effect 型・succeed / fail・sync / try・promise・実行・map / flatMap・Effect.gen・2 種類のエラー・タグ付きエラー・catch・match
4. **Effect 実践**(16) — Service / Layer・Scope・acquireRelease・Fiber・Effect.all・race / timeout・retry / repeat・Ref・Schema・エラー蓄積・Brand・HttpClient
5. **総仕上げ**(7) — Open-Meteo API を使った天気アプリを 6 レッスンかけて構築 + 卒業課題(TODO アプリ)

前半は素の TypeScript で FP の考え方を身につけ、Part 2 で Option / Either を自作してから、
Part 3 以降で「Effect はその実務版」として接続していく構成です。
