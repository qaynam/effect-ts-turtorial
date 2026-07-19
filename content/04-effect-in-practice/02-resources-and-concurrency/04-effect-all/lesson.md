---
title: "Effect.allと並行度"
summary: "concurrency オプションで直列を並行に変える"
timeoutMs: 10000
docs:
  - label: "Basic Concurrency"
    url: "https://effect.website/docs/concurrency/basic-concurrency/"
---

fork と join を毎回手で書くのは大変です。「この 3 つを全部実行して、全部の結果が欲しい」というよくある形には `Effect.all` を使います。

```ts
const results = yield* Effect.all([taskA, taskB, taskC])
```

ここで意外な事実を 1 つ。`Effect.all` は**デフォルトでは直列実行**です。taskA が終わってから taskB、それから taskC。並行にするかどうか、何本まで同時に走らせるかは、呼ぶ側がオプションで決めます。

## まず直列で計測する

右のコードは、それぞれ 200 ミリ秒かかる 3 つのタスクを `Effect.all` に渡し、かかった時間を計測します。まず Run して、およそ 600 ミリ秒(200 × 3)かかることを確認してください。

## 並行に切り替える

`concurrency` オプションを足すだけで並行になります。

```ts
  const results = yield* Effect.all([taskA, taskB, taskC]+++, {
    concurrency: "unbounded",
  }+++)
```

もう一度 Run しましょう。3 本が同時に走るので、合計時間はおよそ 200 ミリ秒まで縮みます。結果の配列の順序は `[taskA, taskB, taskC]` のまま変わりません。**速くなっても結果の並びは安定している**のが `Effect.all` の約束です。

## 上限を決める

`"unbounded"`(無制限)は、相手が外部 API だと同時 100 リクエストのような事故になりえます。数値で上限を決められます。

```ts
    concurrency: ~~~"unbounded"~~~+++2+++,
```

`2` にすると「まず 2 本走り、どちらかが終わったら次の 1 本が走る」ので、およそ 400 ミリ秒になります。実務では「並行にするか」より「**何本までにするか**」を考えることの方が多く、この一行がその調整つまみです。
