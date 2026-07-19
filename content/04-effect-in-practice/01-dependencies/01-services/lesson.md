---
title: "サービスとR型パラメータ"
summary: "Context.Tag で依存を宣言し、実行時に注入する"
docs:
  - label: "Managing Services"
    url: "https://effect.website/docs/requirements-management/services/"
expectedOutput: |
  さいころ: 4
---

`Effect<A, E, R>` の 3 つ目の型パラメータ `R` を、ここまでずっと `never` のまま放置してきました。いよいよ出番です。`R` は **Requirements(要求)**、つまり「この計算を実行するには何が必要か」を表します。

たとえば「乱数を返す何か」が必要な計算を考えます。乱数の作り方を計算の中に直接書くと、テストのたびに結果が変わって困ります。そこで「乱数を返す何か = **サービス**」への依存だけを宣言しておき、実装は実行時に外から渡します。

## サービスを宣言する

サービスは `Context.Tag` を継承したクラスで宣言します。右のコードにすでに書いてあります。

```ts
class Random extends Context.Tag("Random")<
  Random,
  { readonly next: Effect.Effect<number> }
>() {}
```

`"Random"` はサービスを区別する ID、2 つ目の型引数がサービスの中身の型(ここでは「number を返す Effect を持つオブジェクト」)です。この時点では**実装はどこにもありません**。あるのは「こういう形のものが欲しい」という宣言だけです。

## サービスを要求する

`Effect.gen` の中で Tag を `yield*` すると、サービスの実装が手に入ります。固定値を出力している `program` を書き換えましょう。

```ts
const program = Effect.gen(function* () {
+++  const random = yield* Random
  const value = yield* random.next+++
  console.log("さいころ:", value)
})
```

`program` にカーソルを乗せてみてください。型が `Effect<void, never, Random>` になっています。`yield* Random` した瞬間、`R` に `Random` が現れました。**依存が型に記録される**のです。

## 実装を提供する

`R` が `never` でない Effect はまだ実行できません(`Effect.runSync(program)` はコンパイルエラーになります)。`Effect.provideService` で実装を渡すと、`R` が `never` に戻り実行できるようになります。

```ts
+++const runnable = Effect.provideService(program, Random, {
  next: Effect.sync(() => 4),
})+++

Effect.runSync(+++runnable+++)
```

Run すると `さいころ: 4` と表示されます。`next` の実装を `Effect.sync(() => Math.floor(Math.random() * 6) + 1)` に差し替えて、本物のさいころにしてみましょう。`program` は一切書き換えずに、振る舞いだけが変わります。
