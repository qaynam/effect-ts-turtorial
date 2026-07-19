---
title: "pipe と tap / andThen"
summary: "設計図を上から下へ流れるパイプラインにする"
docs:
  - label: "Building Pipelines"
    url: "https://effect.website/docs/getting-started/building-pipelines/"
expectedOutput: |
  税抜: 1200 円
  合計: 1320 円
---

前のレッスンの `Effect.map(effect, f)` という書き方は、つなぐ数が増えると `Effect.flatMap(Effect.map(...), ...)` とネストして、内側から外側へ読む羽目になります。Part 1 で `pipe` を学んだときと同じ問題です。

解決策も同じです。すべての Effect は `.pipe()` メソッドを持っていて、変換を**上から下へ**並べられます。右のネストしたコードを書き換えましょう。

```ts
~~~const program = Effect.flatMap(
  Effect.map(getPrice, (price) => price * 1.1),
  (price) => Effect.succeed(`合計: ${Math.round(price)} 円`),
)~~~
+++const program = getPrice.pipe(
  Effect.map((price) => price * 1.1),
  Effect.flatMap((price) => Effect.succeed(`合計: ${Math.round(price)} 円`)),
)+++
```

`.pipe()` の中では、`Effect.map(f)` のように**変換だけ**を渡します。値が上から順に変換を通り抜けていく、Part 1 の `pipe` の Effect 版です。

## tap: 途中を覗く

パイプラインの途中の値をログに出したいことはよくあります。`Effect.tap` は値を**変えずに**、脇で別の Effect(ここではログ出力)を実行します。先頭に足してみましょう。

```ts
const program = getPrice.pipe(
+++  Effect.tap((price) => Effect.sync(() => console.log(`税抜: ${price} 円`))),+++
  Effect.map((price) => price * 1.1),
  ...
)
```

## andThen: 便利な合流点

`Effect.andThen` は「普通の関数を渡せば `map`、Effect を返す関数を渡せば `flatMap`」として働く便利版です。最後の `flatMap` + `Effect.succeed` は 1 つにまとめられます。

```ts
  ~~~Effect.flatMap((price) => Effect.succeed(`合計: ${Math.round(price)} 円`)),~~~
  +++Effect.andThen((price) => `合計: ${Math.round(price)} 円`),+++
```

Run して 2 行の出力を確認しましょう。使い分けの目安は「**加工は map、次の Effect につなぐのは flatMap、途中を覗くのは tap**、迷ったら andThen」。`tap` の行を消しても合計が変わらないこと(値を変えていないこと)も試すと納得できるはずです。
