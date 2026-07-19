---
title: "succeed と fail"
summary: "成功・失敗を「値として」作る"
docs:
  - label: "Creating Effects"
    url: "https://effect.website/docs/getting-started/creating-effects/"
expectedOutput: |
  割り算成功: 5
  ゼロ除算はエラーになる
---

# succeed と fail

Effect を作るいちばん基本的な方法が `Effect.succeed` と `Effect.fail` です。

```ts
const ok = Effect.succeed(42)          // 成功を表す Effect
const ng = Effect.fail("boom")          // 失敗を表す Effect
```

ポイントは、**失敗すら「値」である**ことです。

## 例外を投げる関数の問題

素の TypeScript では、失敗は `throw` で表現されがちです。

```ts
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("ゼロで割れません")
  return a / b
}
```

この関数の型は `(a: number, b: number) => number`。**シグネチャのどこにも「失敗するかもしれない」と書かれていません**。呼ぶ側は、失敗の可能性をドキュメントを読むか、実際に落ちて初めて知ることになります。

## Effect なら失敗が型に現れる

```ts
function divide(a: number, b: number): Effect.Effect<number, Error> {
  return b === 0
    ? Effect.fail(new Error("ゼロで割れません"))
    : Effect.succeed(a / b)
}
```

戻り値の型 `Effect<number, Error>` を見るだけで、「number が返るか、Error で失敗するか」がわかります。Part 2 で自作した `Either` と同じ発想が、そのまま Effect に受け継がれています。

> `R` が `never` のときは省略できるので、`Effect.Effect<number, Error>` は 2 引数で書けます。

## 課題

右の `divide` を、`throw` を使わずに `Effect.succeed` / `Effect.fail` で失敗を値として返すように書き換えてください。書き換えたら Run して、成功と失敗それぞれの出力を確認しましょう。
