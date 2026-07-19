---
title: "Option を自作する"
summary: "「無いかもしれない」を Some / None の直和型で表す"
expectedOutput: |
  ichiro
  見つかりません
---

「ユーザーを探したが、いなかった」。この「無い」を、多くのコードは `null` や `undefined` で表します。エディタのコードもそうです。`findUser` は `string | null` を返し、呼び出し側が null チェックをしています。

TypeScript の strict モードなら、チェックを忘れればコンパイラが指摘してくれます。それでも `null` には物足りない点が残ります。`null` はただの裸の値なので、「無い」という事実以上のことを何も運べず、道具(メソッド)を生やす場所もありません。null チェックは何度でも、使う場所ごとに手書きすることになります。

そこで FP では、「無いかもしれない値」を **1 つのデータ型**にしてしまいます。前のチャプターで学んだ直和型が、ここでそのまま使えます。

## Option 型を定義する

「値がある(Some)」または「無い(None)」の 2 択を、`_tag` 付きの union で書きましょう。

```ts
+++type Option<A> =
  | { readonly _tag: "Some"; readonly value: A }
  | { readonly _tag: "None" }

const some = <A>(value: A): Option<A> => ({ _tag: "Some", value })
const none: Option<never> = { _tag: "None" }+++
```

`some` と `none` は、値を作るための小さなヘルパーです。`none` の型が `Option<never>` なのは、「どんな `A` の None としても使える」ようにするためです(`never` はどの型にも代入できます)。

## null の代わりに Option を返す

`findUser` の返り値を `Option<string>` に変えます。

```ts
~~~const findUser = (id: number): string | null => users.get(id) ?? null~~~
+++const findUser = (id: number): Option<string> => {
  const name = users.get(id)
  return name === undefined ? none : some(name)
}+++
```

呼び出し側は、前のレッスンと同じように `_tag` で分岐します。

```ts
+++const result1 = findUser(1)
const result2 = findUser(99)

console.log(result1._tag === "Some" ? result1.value : "見つかりません")
console.log(result2._tag === "Some" ? result2.value : "見つかりません")+++
```

Run して `ichiro` と `見つかりません` が出れば成功です。

正直なところ、現時点では null チェックが `_tag` チェックに変わっただけで、手間は減っていません。しかし「無いかもしれない」が**普通の値**になったことが決定的な一歩です。値であれば、関数に渡せるし、返せるし、道具を生やせます。次のレッスンで、この箱に道具を付けていきます。
