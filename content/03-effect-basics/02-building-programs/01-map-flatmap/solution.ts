import { Effect } from "effect"

const parseNumber = (input: string): Effect.Effect<number, Error> => {
  const n = Number(input)
  return Number.isNaN(n)
    ? Effect.fail(new Error(`数値ではありません: ${input}`))
    : Effect.succeed(n)
}

const sqrt = (n: number): Effect.Effect<number, Error> =>
  n < 0
    ? Effect.fail(new Error("負の数の平方根は計算できません"))
    : Effect.succeed(Math.sqrt(n))

// map: 成功値を「普通の関数」で加工する。自作 Option の map と同じ形
const doubled = Effect.map(parseNumber("21"), (n) => n * 2)
console.log(Effect.runSync(doubled))

// flatMap: 成功値を「次の失敗しうる計算」へつなぐ
const program = Effect.flatMap(parseNumber("16"), sqrt)
console.log(Effect.runSync(program))

// 途中で失敗したら後続はスキップされ、失敗がそのまま伝わる
console.log(Effect.runSyncExit(Effect.flatMap(parseNumber("abc"), sqrt))._tag)
