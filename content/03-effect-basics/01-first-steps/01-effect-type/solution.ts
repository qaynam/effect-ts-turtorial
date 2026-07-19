import { Effect } from "effect"

// program1: Effect<number, never, never>
//   → 必ず number を返す。失敗しない(E = never)し、依存も不要(R = never)
const program1 = Effect.succeed(42)

// program2: Effect<never, Error, never>
//   → 成功することがない(A = never)。失敗の型は Error
const program2 = Effect.fail(new Error("何かがうまくいかなかった"))

// program3: Effect<string, never, never>
//   → succeed に渡した値の型がそのまま A になる
const program3 = Effect.succeed("hello")

// program2 と program3 は「作っただけ」。実行しない限り何も起こらない
console.log(Effect.runSync(program1))
