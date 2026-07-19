---
title: "合成と pipe / flow"
summary: "関数合成を自作し、effect の pipe / flow に乗り換える"
docs:
  - label: "Building Pipelines"
    url: "https://effect.website/docs/getting-started/building-pipelines/"
expectedOutput: |
  ICHIRO!
  ICHIRO!
---

# 合成と pipe / flow

FP では、小さな関数を**つないで**大きな処理を組み立てます。

```ts
const result = addExclamation(toUpperCase(trim(input)))
```

これでも動きますが、**内側から外側へ**読まなければならず、処理の流れと読む順序が逆になります。

## pipe: 値を関数に通していく

`effect` が提供する `pipe` を使うと、**上から下へ**流れる順序で書けます。

```ts
import { pipe } from "effect"

const result = pipe(input, trim, toUpperCase, addExclamation)
```

`pipe(値, f, g, h)` は `h(g(f(値)))` と同じ意味です。最初の引数が入力の値で、残りは「1 引数の関数」を並べます。データが左から右へパイプ(管)を流れていくイメージです。

## flow: 関数だけを先に合成する

`flow` は値を渡さずに、**関数の合成だけ**を作ります。

```ts
import { flow } from "effect"

const format = flow(trim, toUpperCase, addExclamation)
format("  hello  ") // pipe(input, ...) と同じ結果
```

`pipe` は「値を流す」、`flow` は「あとで使う関数を作る」。この 2 つは Effect のコードで毎日使うことになる、いちばん大事な道具です。

## 課題

右のコードには、名前を整形する 3 つの小さな関数があります。

1. `formatName` を `pipe` を使って書いてください
2. `formatNameFlow` を `flow` を使って書いてください

どちらも `"  ichiro  "` が `"ICHIRO!"` になれば OK です(出力を見て確認しましょう)。
