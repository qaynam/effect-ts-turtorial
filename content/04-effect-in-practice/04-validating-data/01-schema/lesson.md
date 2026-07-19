---
title: "Schema"
summary: "unknown なデータを検証して型を得る"
docs:
  - label: "Schema Introduction"
    url: "https://effect.website/docs/schema/introduction/"
expectedOutput: |
  田中(28歳)
  検証エラー:
  { readonly name: string; readonly age: number }
  └─ ["age"]
     └─ Expected number, actual "28"
---

`JSON.parse` の戻り値、API のレスポンス、フォームの入力。外の世界から来るデータの型は、TypeScript には分かりません。`as User` とキャストで押し切るのは「型が合っていると信じます」という宣言にすぎず、嘘だったときは遠く離れた場所で実行時エラーになります。

`Schema` は「データがこの形をしているか」を**実行時に検証**する道具です。検証を通れば正しい型の値が手に入り、通らなければどこがどう違うかを説明するエラーになります。

## スキーマを定義する

期待する形を `Schema.Struct` で宣言します。

```ts
+++const User = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
})+++
```

型定義と似ていますが、これは実行時に存在する**値**です。だから検証に使えます。

## 検証する

`Schema.decodeUnknownSync(User)` は「unknown を受け取り、検証して `User` 型を返す(ダメなら throw する)」関数を作ります。右のコードの正しい JSON で試しましょう。

```ts
+++const user = Schema.decodeUnknownSync(User)(goodData)
console.log(`${user.name}(${user.age}歳)`)+++
```

`user` の型が `{ readonly name: string; readonly age: number }` になっています。キャストなしで、unknown から型のある世界に渡れました。

## 失敗を観察する

`age` が文字列になっている壊れたデータの方は、Effect 版の `Schema.decodeUnknown` で検証してみます。失敗が `ParseError` という Part 3 でおなじみのタグ付きエラーになるので、`catchTag` で受け取れます。

```ts
+++const program = Schema.decodeUnknown(User)(badData).pipe(
  Effect.catchTag("ParseError", (e) =>
    Effect.sync(() => console.log("検証エラー:\n" + e.message)),
  ),
)
Effect.runSync(program)+++
```

Run すると、`age` の場所と「number が欲しいのに `"28"` が来た」という理由まで、ツリー状に表示されます。この説明の細かさが、障害調査のときに効きます。
