---
title: "effect の Option / Either"
summary: "自作した箱を、effect ライブラリの本物に置き換える"
expectedOutput: |
  EXAMPLE.COM
  不明
  年齢は 28 歳
  入力エラー: 数値ではありません: abc
docs:
  - label: "Option"
    url: "https://effect.website/docs/data-types/option/"
  - label: "Either"
    url: "https://effect.website/docs/data-types/either/"
---

Part 2 の仕上げです。ここまで自作してきた Option と Either は、`effect` パッケージに本物が用意されています。中身はあなたが書いたものと同じ考え方(`_tag` 付きの直和型)です。エディタのコードは自作版で動く完成品なので、これを 1 ブロックずつ本物に置き換えていきましょう。**出力は 1 文字も変わらないはず**です。

## Option を置き換える

自作の `Option` 型と `some` / `none` / `map` / `flatMap` / `getOrElse` の定義をすべて削除し、代わりに import します。

```ts
+++import { Either, Option, pipe } from "effect"+++
```

`findEmail` と `domainOf` の書き換えはわずかです。型は `Option.Option<A>` と二段の名前になり、`Option.none()` は関数呼び出しになります(自作版では定数でした)。

```ts
const findEmail = (name: string): +++Option.Option<string>+++ => {
  const email = emails.get(name)
  return email === undefined ? +++Option.none()+++ : +++Option.some(email)+++
}
```

使う側は、Part 1 で学んだ `pipe` と組み合わせるのが effect 流です。`Option.flatMap(domainOf)` のように関数だけを渡すと「Option を受け取る 1 引数関数」が返ってくるので、そのまま `pipe` に並べられます。

```ts
+++const domain = pipe(
  findEmail("ichiro"),
  Option.flatMap(domainOf),
  Option.map((d) => d.toUpperCase()),
  Option.getOrElse(() => "不明"),
)
console.log(domain)
console.log(pipe(findEmail("hanako"), Option.getOrElse(() => "不明")))+++
```

## Either を置き換える

自作の `Either` も削除し、`Either.left` / `Either.right` に切り替えます。1 つだけ注意があります。effect の Either は型引数の順序が `Either.Either<A, E>`(**成功が先**)で、自作版の `Either<E, A>` と逆です。

```ts
const parseAge = (input: string): +++Either.Either<number, string>+++ => {
  const n = Number(input)
  return Number.isNaN(n) ? +++Either.left(`数値ではありません: ${input}`)+++ : +++Either.right(n)+++
}
```

`show` は `Either.match` に置き換えます。Left と Right の処理を 1 つのオブジェクトで渡す、switch の代わりになる道具です。

```ts
+++const show = (result: Either.Either<number, string>): string =>
  Either.match(result, {
    onLeft: (e) => `入力エラー: ${e}`,
    onRight: (n) => `年齢は ${n} 歳`,
  })+++
```

Run して、置き換え前と同じ 4 行が出れば卒業です。実装を丸ごと入れ替えたのに出力が変わらないのは、自作版と本物が同じ抽象(法則を満たす map と flatMap)を共有しているからです。本物には、ここで使った以外にも `Option.fromNullable` など便利な道具が揃っています。下のドキュメントを眺めてみてください。どの関数も「箱の中身をどうするか」という、もう見慣れた形をしています。
