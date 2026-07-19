import { Context, Effect } from "effect"

// サービスの宣言。実装はまだない
class Random extends Context.Tag("Random")<
  Random,
  { readonly next: Effect.Effect<number> }
>() {}

// program: Effect<void, never, Random>
//   → R に Random が現れた。「Random がないと実行できない」計算
const program = Effect.gen(function* () {
  const random = yield* Random
  const value = yield* random.next
  console.log("さいころ:", value)
})

// 実装を提供すると R が never に戻り、実行できるようになる
const runnable = Effect.provideService(program, Random, {
  next: Effect.sync(() => 4),
})

Effect.runSync(runnable)
