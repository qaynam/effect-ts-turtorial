---
title: "traverse と sequence"
summary: "Array<Option<A>> を Option<Array<A>> に裏返す"
expectedOutput: |
  3
  1,2,3
  None
---

フォームから来た文字列の配列を、まとめて数値にしたいとします。1 つぶんの変換はすでにあります。エディタの `parseNumber` は、数値にできなければ `None` を返す `(text: string) => Option<number>` です。

これを配列に適用してみると、期待とは違うものが出てきます。

```ts
["1", "2", "3"].map(parseNumber) // Array<Option<number>>
```

箱が内側に入ってしまいました。欲しいのは `Option<Array<number>>` です。つまり「全部成功したら数値の配列、1 つでも失敗したら None」。この**入れ子を裏返す**操作を `sequence`、`map` してから `sequence` するひと続きを `traverse` と呼びます。

## sequence: 外側と内側を入れ替える

実装は、前レッスンで作った `zip` の繰り返しです。`zip` は 2 つの Option を 1 つに合流させ、どちらかが None なら全体を None にしました。これを配列の先頭から畳み込んでいけば、「全部 Some のときだけ Some」が手に入ります。

出発点は「空の配列が入った Some」です。そこに要素を 1 つずつ `zip` で足していきます。

```ts
const sequenceOption = <A>(options: ReadonlyArray<Option<A>>): Option<ReadonlyArray<A>> =>
+++  options.reduce<Option<ReadonlyArray<A>>>(
    (acc, option) => map(zip(acc, option), ([values, value]) => [...values, value]),
    some([]),
  )+++
```

`traverseOption` のほうは書いてあります。`sequenceOption(items.map(f))` という定義そのままで、`traverse` が「map と sequence の合わせ技」だという説明がコードになっています。

Run すると 3 行出ます。1 行目は `map` しただけの `Array<Option<number>>` の長さ、2 行目は全部成功した `traverse` の中身、3 行目は `"two"` を混ぜたケースです。1 つ壊れているだけで、配列全体が `None` に倒れます。`["1", "", "3"]` のように空文字を混ぜても同じ結果になるはずです。試してみてください。

## この形はどこにでも出てくる

`traverse` を知っていると、Part 4 で登場する `Effect.all` が初対面に見えなくなります。

```ts
// Array<Effect<A>> → Effect<Array<A>>
Effect.all([fetchUser(1), fetchUser(2), fetchUser(3)])
```

型の形がまったく同じです。箱が Option から Effect に替わり、「1 つでも None なら None」が「1 つでも失敗なら失敗」に替わっただけ。`Promise.all` も `Array<Promise<A>>` を `Promise<Array<A>>` にする、この形の一員です。

抽象に名前が付いていると、こうして知識が箱から箱へ移せます。次のレッスンでは、ここまで作ってきた道具を並べて、その移し替えを正面から確かめます。
