---
title: "Monad: ネストを潰して計算をつなぐ"
summary: "map の限界から flatMap の本質を取り出し、Monad と名付ける"
expectedOutput: |
  ichiro@example.com
  example.com
  None
---

Functor の `map` には、できないことが 1 つあります。渡す関数が**箱を返す**場合です。エディタのコードで、`map` に `findEmail`(Option を返す関数)を渡しています。

```ts
const nested = map(some("ichiro"), findEmail)
// nested の型: Option<Option<string>>
```

`map` は関数の結果を律儀にまた箱に入れるので、箱の中に箱ができます。中身のメールアドレスに触るには、いまのコードのように `_tag` チェックを二重に書いて、二重の箱を開けることになります。`domainOf` まで続けたら三重です。「失敗するかもしれない処理」を**つなぐ**たびに、箱が一段深くなってしまう。これが `map` の限界です。

## flatMap を書き直してみる

この問題は、チャプター「失敗を値にする」で `flatMap` を書いたときに一度解決済みです。今回はもう一度、1 行の違いに注目しながら書いてください。

```ts
const flatMap = <A, B>(option: Option<A>, f: (a: A) => Option<B>): Option<B> =>
+++  option._tag === "Some" ? f(option.value) : none+++
```

`map` は `some(f(option.value))` と包み直していました。`flatMap` は `f(option.value)` を**そのまま返します**。`f` の結果がすでに箱だから、包み直したら二重になる。ネストを平ら(flat)にする map、それが名前の由来です。

## ネストした箱を連鎖に置き換える

二重の `_tag` チェックを、flatMap の連鎖に書き換えましょう。

```ts
+++const chained = flatMap(flatMap(some("ichiro"), findEmail), domainOf)
console.log(chained._tag === "Some" ? chained.value : "None")
console.log(flatMap(some("noone"), findEmail)._tag)+++
```

Run すると、何段つないでも結果は一重の Option のままで、途中で失敗(最後の行の `noone`)すれば以降が自動でスキップされることが確認できます。

## この形の名前が Monad

「`flatMap` で計算をつなげる箱」を **Monad(モナド)** と呼びます。難解な概念の代名詞のように扱われがちな言葉ですが、あなたはすでに 2 回も実装しています。本質は 1 つだけです。**前の結果を使って次の「箱を返す計算」を起動し、箱を二重にせずつなぐ**。「取ってきた ID でユーザーを探し、そのユーザーの設定を読む」といった逐次処理を、失敗の分岐を書かずに一本道で表せます。Part 3 の `Effect.flatMap` も、この形そのままです。
