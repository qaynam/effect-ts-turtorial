# レッスン執筆スタイルガイド

このチュートリアルのレッスンを書く・直すときの規範。**すべて日本語のオリジナル文章**で書く(外部チュートリアルの文章の複製・翻訳は禁止。構成パターンのみ参考にする)。

## ファイル構成

```
content/<part>/<chapter>/<lesson>/
├── lesson.md     # frontmatter + 本文(必須)
├── initial.ts    # 初期コード(省略すると直前レッスンの solution.ts を引き継ぐ)
└── solution.ts   # 解答コード(必須)
```

## frontmatter

```yaml
---
title: "純粋関数"              # 必須。本文に h1 は書かない(title から自動表示)
summary: "同じ入力に同じ出力を返す関数の強さ"  # 必須。目次に出る 1 行説明(20 字前後)
expectedOutput: |             # 任意。console 出力がこれと完全一致したらクリア判定
  7
  7
timeoutMs: 8000               # 任意。既定 5000。sleep や retry を使うレッスンで延長
docs:                         # 任意。Effect 公式ドキュメントへのリンク
  - label: "Creating Effects"
    url: "https://effect.website/docs/getting-started/creating-effects/"
---
```

## 本文の書き方(最重要)

1 レッスン = 1 概念。**概念の説明は 1〜3 段落**に抑え、すぐ手を動かす指示に入る。

構成テンプレート:

1. **導入(1〜2 段落)**: なぜこれが必要か。前のレッスンとのつながりから入る
2. **手順(2〜4 ステップ)**: 「〜を追加しましょう」「次に〜を書き換えます」と命令形で誘導。各ステップに差分マーカー付きコードブロックを添える
3. **締め**: Run して何が起こるか・型がどう変わるかを観察させる一文。余力があれば「〜も試してみましょう」と 1 つ実験を提案

### 差分マーカー

コードブロック内で、**追加する部分**を `+++...+++`、**削除する部分**を `~~~...~~~` で囲む。エディタで「どこを書き換えるか」がハイライト表示される。

```ts
const program = +++Effect.succeed(42)+++
```

- マーカーはユーザーが編集すべき箇所を示すときだけ使う。説明用のコード全文には付けない
- コードブロックの言語は `ts`(差分マーカー付きでも `ts`)

### 文体

- です・ます調。Svelte チュートリアルのような、フレンドリーだが簡潔なトーン
- 専門用語・API 名は英語のまま(`flatMap`、`Layer`)。日本語訳を初出時に添える(例: 「イミュータブル(不変)」)
- 冗長な前置き(「このレッスンでは〜を学びます」)は書かない。いきなり本題から
- 比喩は 1 レッスン 1 つまで。定着している比喩(「設計図」「レシピ」)を優先

## コードの規則

- `initial.ts` / `solution.ts` は **10〜30 行**、strict TypeScript で型チェックが通ること
- import できるのは `"effect"` と `"@effect/platform"` **のみ**(サブパス import 禁止)。素の TS だけのレッスンは import なしで OK
- `initial.ts` は「そのまま Run できるが結果が不完全」または「TODO コメント付き」にする。構文エラーで実行できない状態にはしない
- クリア判定を付けるレッスン(expectedOutput あり)では、**出力は console.log の文字列・数値のみ**にする(オブジェクトのフォーマットは環境で異なるため)
- 実行時間に影響する処理(sleep, retry)は合計 2 秒以内に収め、timeoutMs を余裕を持って設定
- ネットワークを使うレッスン(HttpClient・Part 5)は expectedOutput を付けない(結果が変動するため)
- Effect.log はフォーマットが初心者に読みにくいので、出力には console.log を使う(Effect.log 自体を教えるとき以外)

## 検証(執筆後に必ず実行)

```sh
npx tsc -p tsconfig.content.json          # 全レッスンコードの型チェック
npx tsx scripts/verify-lessons.ts <part>  # solution.ts を実行し expectedOutput と照合
pnpm check-doc-links                      # docs リンクの実在チェック
```

3 つすべて通ってから完了とする。
