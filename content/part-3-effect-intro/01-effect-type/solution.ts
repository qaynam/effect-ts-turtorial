import { Effect } from "effect"

// program1: Effect<number, never, never>
//   → 必ず number を返す。失敗しない(E = never)ので安心して runSync できる
const program1 = Effect.succeed(42)

// program2: Effect<never, Error, never>
//   → 成功することがない(A = never)。失敗の型は Error
const program2 = Effect.fail(new Error("何かがうまくいかなかった"))

console.log(Effect.runSync(program1))
