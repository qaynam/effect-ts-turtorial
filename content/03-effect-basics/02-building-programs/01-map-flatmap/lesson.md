---
title: "map と flatMap"
summary: "自作 Option と同じ形が Effect にもある"
docs:
  - label: "Building Pipelines"
    url: "https://effect.website/docs/getting-started/building-pipelines/"
expectedOutput: |
  42
  4
  Failure
---

前の章では Effect を「作って、実行する」ところまでやりました。この章では、実行する前の設計図同士を**つなぐ**方法を学びます。と言っても、道具はすでに知っているものです。Part 2 で自作した `Option` の `map` / `flatMap`、あの 2 つがそのまま Effect にもあります。

- `map`: 成功値を**普通の関数**で加工する。失敗ならスキップ(Functor の力)
- `flatMap`: 成功値を**次の失敗しうる計算**へつなぐ。ネストさせずに平らなまま(Monad の力)

コンテナの中身が「値があるかないか」から「まだ実行されていない計算」に変わっただけで、形はまったく同じです。

## map で加工する

右のコードには、失敗しうる 2 つの関数 `parseNumber` と `sqrt` があります。まず `parseNumber("21")` の結果を 2 倍にしてみましょう。

```ts
+++const doubled = Effect.map(parseNumber("21"), (n) => n * 2)
console.log(Effect.runSync(doubled))+++
```

`(n) => n * 2` は Effect のことを何も知らない普通の関数です。それでも `map` が「成功したときだけ適用する」面倒を見てくれます。

## flatMap でつなぐ

次に、パースした数を `sqrt` に渡します。`sqrt` は `Effect` を返すので、`map` でつなぐと `Effect<Effect<number, Error>, Error>` と二重になってしまいます。ここが `flatMap` の出番です。

```ts
+++const program = Effect.flatMap(parseNumber("16"), sqrt)
console.log(Effect.runSync(program))

console.log(Effect.runSyncExit(Effect.flatMap(parseNumber("abc"), sqrt))._tag)+++
```

Run すると `42`、`4`、`Failure` が並びます。最後の 1 行に注目してください。`parseNumber("abc")` が失敗すると、`sqrt` は**実行されずに**失敗がそのまま結果になります。Part 2 で `flatMap` を自作したとき、`None` なら後続を呼ばずに `None` を返しましたね。あれと同じ短絡が、Effect では「エラーの自動伝播」として働いています。
