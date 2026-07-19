---
title: "Effectを実行する"
summary: "runSync / runSyncExit / runPromise と「世界の果て」"
docs:
  - label: "Running Effects"
    url: "https://effect.website/docs/getting-started/running-effects/"
expectedOutput: |
  42
  Success
  Failure
  失敗の中身: 接続に失敗しました
  非同期の結果
---

ここまで `runSync` などをなんとなく使ってきました。この章の締めくくりに、実行 API を整理します。

原則はひとつ、「**設計図の合成はどこでも、実行は世界の果てで一度だけ**」です。プログラムの本体は Effect 同士の合成として組み立て、`run*` を呼ぶのはエントリポイント(`main` の末尾のような境界)だけにします。実行を一箇所に集めるほど、それ以外の全部が「まだ実行されていない、合成し放題の値」でいられるからです。このチュートリアルでは観察のために何度も `run*` を呼びますが、実務のコードで `run*` があちこちに現れたら設計を疑ってください。

## 3 つの実行 API

右のコードに実行部分を書き足していきましょう。まずは同期の 2 つです。

```ts
+++console.log(Effect.runSync(ok))

console.log(Effect.runSyncExit(ok)._tag)
const exit = Effect.runSyncExit(ng)
console.log(exit._tag)
if (exit._tag === "Failure" && exit.cause._tag === "Fail") {
  console.log("失敗の中身:", exit.cause.error.message)
}+++
```

- `runSync`: 実行して成功値 `A` を直接返します。失敗すると **throw する**ので、`E` が `never` の Effect 向きです
- `runSyncExit`: 失敗しても throw せず、結果を `Exit` で返します。`Exit` は「`Success`(成功値入り)か `Failure`(失敗の原因 `cause` 入り)」の 2 択で、Part 2 で作った `Either` の実行結果版です

次に非同期です。`later` のような非同期の Effect は `runPromise` で実行します。

```ts
+++console.log(await Effect.runPromise(later))+++
```

Run して 5 行の出力を確認しましょう。`cause` の中身(`Fail` とは何か)はこの Part の後半で詳しく扱います。

余裕があれば、`later` を `runSync` で実行してみてください。「非同期の処理を同期では実行できない」というエラーで落ちます。実行 API 選びも型と同じで、設計図の性質に合わせる必要があるのです。
