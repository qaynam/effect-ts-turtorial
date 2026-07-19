---
title: "代数的データ型"
summary: "直積型と直和型で「ありえない状態」を型から消す"
expectedOutput: |
  読み込み中...
  ようこそ、ichiro さん
  エラー: 接続できません
---

Part 1 の主役は関数でした。Part 2 の前半の主役は、関数が受け取る**データの形**です。

TypeScript の型には、2 つの組み合わせ方があります。

- **直積型(product type)**: フィールドを「かつ」で束ねる。`interface User { name: string; age: number }` は「name を持ち、**かつ** age を持つ」
- **直和型(sum type)**: 選択肢を「または」で並べる。`type Status = "loading" | "success"` は「2 つのうち**どれか 1 つ**」

この 2 つだけでデータを設計する流儀を**代数的データ型(ADT: Algebraic Data Type)**と呼びます。名前は仰々しいですが、道具はいつもの interface と union だけです。

## ありえない状態が作れてしまう

右のコードは、データ取得画面の状態を「フラグの寄せ集め」で表しています。

```ts
interface FetchState {
  readonly isLoading: boolean
  readonly error: string | null
  readonly user: User | null
}
```

boolean と null 許容フィールドの組み合わせは 2 × 2 × 2 = 8 通りありますが、仕様上意味があるのは「読み込み中」「成功」「失敗」の 3 つだけです。`{ isLoading: true, error: "…", user: {...} }`(読み込み中なのにエラーも成功データもある)のような残り 5 通りは、仕様にはないのに型としては作れてしまいます。`describe` の最後にある `"???"` は、この歪みがコードに漏れ出したものです。

## 直和型で書き直す

状態が「3 つのうちどれか 1 つ」なら、型もそのまま「または」で書けます。`FetchState` を union に書き換えましょう。

```ts
~~~interface FetchState {
  readonly isLoading: boolean
  readonly error: string | null
  readonly user: User | null
}~~~
+++type FetchState =
  | { readonly status: "loading" }
  | { readonly status: "success"; readonly user: User }
  | { readonly status: "failure"; readonly message: string }+++
```

`user` フィールドは success のときにしか存在しません。つまり「成功したのにユーザーがいない」「読み込み中なのにエラーがある」といった状態は、**そもそも書けなく**なりました。

`describe` も書き換えます。`status` を調べると、TypeScript がそのブロック内の型を絞り込んでくれるので、null チェックは不要です。

```ts
const describe = (state: FetchState): string => {
+++  if (state.status === "loading") return "読み込み中..."
  if (state.status === "success") return `ようこそ、${state.user.name} さん`
  return `エラー: ${state.message}`+++
}
```

最後に、呼び出し側も新しい形に合わせます。

```ts
+++console.log(describe({ status: "loading" }))
console.log(describe({ status: "success", user: { name: "ichiro", age: 28 } }))
console.log(describe({ status: "failure", message: "接続できません" }))+++
```

Run して 3 つの状態が表示されたら成功です。試しに `{ status: "success" }` だけ(user なし)を渡そうとしてみてください。実行する前に、コンパイラが止めてくれます。バグを実行時に見つけるのではなく、**型の設計で最初から作れなくする**。これが ADT の考え方です。
