---
title: "2種類のエラー"
summary: "期待されるエラー(Fail)と欠陥(Die)を区別する"
docs:
  - label: "Two Types of Errors"
    url: "https://effect.website/docs/error-management/two-error-types/"
expectedOutput: |
  fail の原因: Fail
  die の原因: Die
  throw の原因: Die
---

ここまで、失敗はすべて `E` チャンネルに入れてきました。しかし Effect は失敗を 2 種類に区別します。

- **期待されるエラー**: 「在庫がない」「入力が不正」のように、起こりうると分かっていて、呼び出し側に対処してほしい失敗。`Effect.fail` で作り、`E` に現れます
- **欠陥(defect)**: 「価格が負の数になっている」のように、起きたらバグでしかない異常。`Effect.die` で作り、`E` には**現れません**

この区別が、この章のエラーハンドリング全体の土台になります。回復の対象は前者だけで、後者は型に載せず、境界のログや監視に任せるのが Effect の流儀です。

## Cause で見分ける

`runSyncExit` が返す `Exit` の `Failure` 側には、失敗の原因を記録した `Cause` が入っています。2 種類のエラーは `cause._tag` で見分けられます。右のコードに観察コードを足しましょう。

```ts
+++const exit1 = Effect.runSyncExit(expected)
if (exit1._tag === "Failure") console.log("fail の原因:", exit1.cause._tag)

const exit2 = Effect.runSyncExit(defect)
if (exit2._tag === "Failure") console.log("die の原因:", exit2.cause._tag)+++
```

`fail` は `Fail`、`die` は `Die` になります。実行前に `expected` と `defect` にカーソルを乗せて、型も見比べてください。`expected` の `E` は `Error` ですが、`defect` の `E` は `never` のまま。「失敗しない」ではなく「**期待される失敗はない**」という意味です。

## throw も欠陥になる

`Effect.sync` の中でうっかり throw したらどうなるでしょうか。試してみましょう。

```ts
+++const boom = Effect.sync(() => {
  throw new Error("うっかり throw してしまった")
})
const exit3 = Effect.runSyncExit(boom)
if (exit3._tag === "Failure") console.log("throw の原因:", exit3.cause._tag)+++
```

Run すると、これも `Die` です。`sync` は「throw しない」約束の道具だったので、破れば欠陥扱いになります。throw を期待されるエラーにしたければ `Effect.try` を使う、という前の章の使い分けが、ここできれいにつながります。
