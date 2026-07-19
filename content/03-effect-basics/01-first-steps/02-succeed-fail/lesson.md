---
title: "succeed と fail"
summary: "throw を「失敗を返す設計図」に書き換える"
docs:
  - label: "Creating Effects"
    url: "https://effect.website/docs/getting-started/creating-effects/"
expectedOutput: |
  割り算成功: 5
  ゼロ除算はエラーになる
---

前のレッスンで眺めた `Effect.succeed` / `Effect.fail` を、今度は自分の関数に使ってみましょう。題材は、素の TypeScript でよく見る `throw` する関数です。

右の `divide` の型は `(a: number, b: number) => number`。シグネチャのどこにも「失敗するかもしれない」と書かれていません。呼ぶ側は、ドキュメントを読むか、実際に落ちて初めて失敗を知ることになります。Part 2 で `Either` を作ったときと同じ問題意識です。

## divide を書き換える

`throw` をやめて、失敗を値として返しましょう。

```ts
function divide(a: number, b: number): ~~~number~~~+++Effect.Effect<number, Error>+++ {
  ~~~if (b === 0) throw new Error("ゼロで割れません")
  return a / b~~~
  +++return b === 0
    ? Effect.fail(new Error("ゼロで割れません"))
    : Effect.succeed(a / b)+++
}
```

戻り値の型 `Effect<number, Error>` を見るだけで、「`number` が返るか、`Error` で失敗するか」が伝わります。

> `R` が `never` のときは省略できるので、`Effect.Effect<number, Error>` と 2 引数で書けます。

## 実行して確かめる

`divide` は設計図を返すようになったので、末尾の確認コードも実行する形に差し替えます。

```ts
~~~console.log("割り算成功:", divide(10, 2))~~~
+++const result = Effect.runSync(divide(10, 2))
console.log("割り算成功:", result)

const failed = Effect.runSyncExit(divide(1, 0))
if (failed._tag === "Failure") {
  console.log("ゼロ除算はエラーになる")
}+++
```

`runSync` は設計図を実行して成功値を取り出します。`runSyncExit` は失敗しても throw せず、結果を `Exit` という値で返します(実行 API はこの章の最後にまとめて扱います)。

Run して、成功と失敗それぞれの出力を確認しましょう。`divide(1, 0)` がエラーになっても、プログラム全体は落ちていないことに注目してください。失敗はあくまで「値」です。
