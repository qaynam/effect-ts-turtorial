---
title: "合成と pipe / flow"
summary: "小さな関数をつないで処理を組み立てる"
docs:
  - label: "Building Pipelines"
    url: "https://effect.website/docs/getting-started/building-pipelines/"
expectedOutput: |
  ICHIRO!
  ICHIRO!
---

部分適用で 1 引数関数を量産できるようになりました。仕上げは**合成**(composition)、つまり小さな 1 引数関数をつないで大きな処理を作ることです。素朴に書くとこうなります。

```ts
const result = addExclamation(toUpperCase(trim(input)))
```

動きますが、処理は trim が先なのに、読むときは**内側から外側へ**と逆順にたどる必要があります。合成用の関数は自作もできます。

```ts
const compose2 = <A, B, C>(f: (a: A) => B, g: (b: B) => C) =>
  (a: A): C => g(f(a))

const shout = compose2(trim, toUpperCase)
```

ただし 3 個、4 個と可変長でつなげられるように型を付けるのは大変です。ここで、このチュートリアルではじめてライブラリを import します。`effect` の `pipe` と `flow` です。

## pipe: 値を関数に通す

`pipe(値, f, g, h)` は `h(g(f(値)))` と同じ意味です。先頭に入力の値を置き、続けて 1 引数関数を並べると、データが左から右へパイプ(管)を流れるように処理されます。

`formatName` を `pipe` で書き換えましょう。

```ts
const formatName = (input: string): string =>
  ~~~addExclamation(toUpperCase(trim(input)))~~~
  +++pipe(input, trim, toUpperCase, addExclamation)+++
```

## flow: 関数だけを先に合成する

`flow` は値を受け取らず、**関数の合成だけ**を作ります。`flow(f, g, h)` は「値が来たら f、g、h の順に通す関数」です。

`formatNameFlow` を `flow` で書き換えましょう。`input` を自分で書かなくてよくなることに注目してください。

```ts
~~~const formatNameFlow = (input: string): string =>
  addExclamation(toUpperCase(trim(input)))~~~
+++const formatNameFlow = flow(trim, toUpperCase, addExclamation)+++
```

Run すると、どちらも `"  ichiro  "` を `ICHIRO!` に整形します。`pipe` は「値を流す」、`flow` は「あとで使う関数を作る」。この 2 つは Effect のコードで毎日使う道具です。

これで Part 1 は完了です。純粋関数を書き、副作用を端に追い出し、関数を値として合成する道具が揃いました。Part 3 で登場する Effect は、この `pipe` に「失敗するかもしれない処理」や「非同期の処理」まで流せるようにしたものです。
