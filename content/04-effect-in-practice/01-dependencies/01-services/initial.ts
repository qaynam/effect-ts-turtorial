import { Context, Effect } from "effect"

// サービスの宣言: 「number を返す next を持つ何か」が欲しい。
// 実装はまだどこにもない
class Random extends Context.Tag("Random")<
  Random,
  { readonly next: Effect.Effect<number> }
>() {}

// TODO: yield* Random でサービスを要求し、
// random.next の値を出力するように書き換えよう
const program = Effect.gen(function* () {
  console.log("さいころ:", 4)
})

// TODO: program の R が Random になったら、
// Effect.provideService(program, Random, { next: ... }) で実装を渡そう
Effect.runSync(program)
