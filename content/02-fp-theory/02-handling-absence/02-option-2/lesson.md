---
title: "map / flatMap / getOrElse"
summary: "Option に道具を生やし、_tag チェックの手書きをなくす"
expectedOutput: |
  EXAMPLE.COM
  不明
---

前のレッスンの終わりに、「値になった Option には道具を生やせる」と予告しました。ここで 3 つ作ります。`_tag` の分岐を道具の中に閉じ込めてしまえば、使う側は二度と手書きしなくて済みます。

エディタのコードには前レッスンの `Option` に加えて、名前からメールアドレスを探す `findEmail` と、メールアドレスからドメイン部分を取り出す `domainOf` が用意してあります。どちらも失敗するかもしれないので、返り値は `Option<string>` です。

## map: 中身だけを変換する

`map` は「Some なら中身に関数を適用し、None ならそのまま」です。

```ts
const map = <A, B>(option: Option<A>, f: (a: A) => B): Option<B> =>
+++  option._tag === "Some" ? some(f(option.value)) : none+++
```

箱を開けて、変換して、また閉じる。この一連の作業を `map` が肩代わりします。

## getOrElse: 最後に箱から取り出す

`getOrElse` は「Some なら中身、None なら代わりの値」を返します。Option の旅の終点で使う道具です。

```ts
const getOrElse = <A>(option: Option<A>, fallback: A): A =>
+++  option._tag === "Some" ? option.value : fallback+++
```

## flatMap: 失敗するかもしれない処理をつなぐ

`findEmail` の結果に `domainOf` を適用したいとします。`map(findEmail("ichiro"), domainOf)` と書くと、返り値の型は `Option<Option<string>>`(箱の中に箱)になってしまいます。`domainOf` 自身が Option を返すからです。

こういうとき用の道具が `flatMap` です。「Some なら中身に関数を適用して、**その結果の Option をそのまま返す**。None ならそのまま」。箱が二重になりません。

```ts
const flatMap = <A, B>(option: Option<A>, f: (a: A) => Option<B>): Option<B> =>
+++  option._tag === "Some" ? f(option.value) : none+++
```

## つないでみる

3 つ揃ったら、末尾の計算を組み立てましょう。「メールアドレスを探し、ドメインを取り出し、大文字にして、無ければ 不明」という流れが、分岐なしの一本道になります。

```ts
+++const domain = flatMap(findEmail("ichiro"), domainOf)
console.log(getOrElse(map(domain, (d) => d.toUpperCase()), "不明"))
console.log(getOrElse(flatMap(findEmail("hanako"), domainOf), "不明"))+++
```

Run すると `EXAMPLE.COM` と `不明` が出ます。2 行目に注目してください。hanako のメールアドレスは登録されていないので `findEmail` の時点で None になり、以降の `domainOf` も大文字化も**自動的にスキップ**されます。途中のどこで失敗しても安全に最後まで流れる。null チェックの連打で書いていた処理が、この 3 つの道具に置き換わりました。
