---
title: "repeatとScheduleの合成"
summary: "成功した処理を方針に従って繰り返す"
timeoutMs: 10000
docs:
  - label: "Schedule Combinators"
    url: "https://effect.website/docs/scheduling/schedule-combinators/"
  - label: "Repetition"
    url: "https://effect.website/docs/scheduling/repetition/"
expectedOutput: |
  死活監視(1回目)
  死活監視(2回目)
  死活監視(3回目)
  繰り返し回数: 2
  バックアップ実行(1回目)
  バックアップ実行(2回目)
  バックアップ実行(3回目)
---

前のレッスンの `retry` は「失敗したらもう一度」でした。対になるのが `Effect.repeat`、「**成功したら**もう一度」です。ポーリング、定期バックアップ、ヘルスチェック。方針は retry と同じ `Schedule` で表すので、学んだことがそのまま使えます。

## 回数で繰り返す

エディタのコードの `healthCheck` を 2 回繰り返してみましょう。

```ts
+++  const count = yield* Effect.repeat(healthCheck, Schedule.recurs(2))
  console.log("繰り返し回数:", count)+++
```

Run すると 3 回実行されます。最初の 1 回は「実行」、Schedule が担当するのはその後の「繰り返し 2 回」だからです。`repeat` の戻り値は Schedule の出力で、`recurs` なら繰り返した回数です。

## 間隔をつけて合成する

現実の定期処理は「50 ミリ秒ごとに」のような時間間隔で動きます。`Schedule.spaced("50 millis")` がその方針ですが、これは**いつまでも続く** Schedule なので、そのまま使うとプログラムが終わりません。retry のレッスンで使った `Schedule.intersect` の出番です。

```ts
+++  yield* Effect.repeat(
    backup,
    Schedule.intersect(Schedule.spaced("50 millis"), Schedule.recurs(2)),
  )+++
```

「50 ミリ秒ごとに、ただし繰り返しは 2 回まで」。両方の条件が重なって、無限の Schedule に停止条件が付きました。

ちなみに `intersect`(かつ)の相棒に `union`(または)もあります。`union` は**どちらか一方でも続行を許せば続く**ので、`spaced` と `recurs` を union すると 2 回では止まりません。「厳しい方に合わせるのが intersect、緩い方に合わせるのが union」と覚えておきましょう。
