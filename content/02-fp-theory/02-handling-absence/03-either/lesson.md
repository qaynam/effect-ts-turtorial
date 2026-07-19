---
title: "Either: 失敗の理由を運ぶ"
summary: "None では語れない「なぜ失敗したか」を Left に持たせる"
expectedOutput: |
  年齢は 28 歳
  入力エラー: 数値ではありません: abc
  入力エラー: 負の年齢は不正です: -3
---

エディタのコードの `parseAge` は、入力文字列を年齢に変換します。失敗パターンは 2 つあります。数値として読めない場合と、負の数の場合です。ところが返り値が `Option<number>` なので、どちらの失敗も同じ `none` に潰れてしまい、Run すると 2 行とも「理由は不明」になります。Option は「無い」ことは言えても、「**なぜ**無いのか」を運ぶ場所を持っていないのです。

解決は素直です。失敗側にも値の置き場を作った直和型を、もう 1 つ定義します。それが **Either** です。

## Either 型を定義する

「失敗(Left)に理由 `E` が入っている」または「成功(Right)に値 `A` が入っている」の 2 択です。

```ts
+++type Either<E, A> =
  | { readonly _tag: "Left"; readonly left: E }
  | { readonly _tag: "Right"; readonly right: A }

const left = <E>(e: E): Either<E, never> => ({ _tag: "Left", left: e })
const right = <A>(a: A): Either<never, A> => ({ _tag: "Right", right: a })+++
```

慣習として、成功は Right(right = 「正しい」の語呂合わせ)、失敗は Left に入れます。

## 失敗に理由を持たせる

`parseAge` を書き換えます。返り値の型 `Either<string, number>` は「失敗ならエラーメッセージ、成功なら数値」と読めます。**どんな失敗があり得るかが型シグネチャに現れる**のが、Option との一番の違いです。

```ts
~~~const parseAge = (input: string): Option<number> => {
  const n = Number(input)
  if (Number.isNaN(n)) return none
  if (n < 0) return none
  return some(n)
}~~~
+++const parseAge = (input: string): Either<string, number> => {
  const n = Number(input)
  if (Number.isNaN(n)) return left(`数値ではありません: ${input}`)
  if (n < 0) return left(`負の年齢は不正です: ${n}`)
  return right(n)
}+++
```

表示側も、Left の中身を使うように直します。

```ts
~~~const show = (result: Option<number>): string =>
  result._tag === "Some" ? `年齢は ${result.value} 歳` : "何かが失敗しました(理由は不明)"~~~
+++const show = (result: Either<string, number>): string =>
  result._tag === "Right" ? `年齢は ${result.right} 歳` : `入力エラー: ${result.left}`+++
```

不要になった `Option` の定義は削除して構いません。Run すると、2 種類の失敗がそれぞれ別のメッセージで表示されます。

Option と Either は兄弟のような型です。使い分けの目安は、失敗の理由に興味があるかどうか。「Map に無かった」のように理由が自明なら Option、「入力のどこが悪かったか」を伝えたいなら Either を選びます。前のレッスンで Option に生やした `map` や `flatMap` は、Either にもまったく同じ発想で生やせます(Right のときだけ適用する)。この「まったく同じ発想」が偶然ではないことを、次のチャプターで確かめます。
