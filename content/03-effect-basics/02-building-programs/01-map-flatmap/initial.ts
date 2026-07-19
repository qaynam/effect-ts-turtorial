import { Effect } from "effect"

// 文字列を数値にする。数値でなければ失敗
const parseNumber = (input: string): Effect.Effect<number, Error> => {
  const n = Number(input)
  return Number.isNaN(n)
    ? Effect.fail(new Error(`数値ではありません: ${input}`))
    : Effect.succeed(n)
}

// 平方根を取る。負の数なら失敗
const sqrt = (n: number): Effect.Effect<number, Error> =>
  n < 0
    ? Effect.fail(new Error("負の数の平方根は計算できません"))
    : Effect.succeed(Math.sqrt(n))

// TODO ①: parseNumber("21") の成功値を 2 倍にした doubled を map で作ろう
// TODO ②: parseNumber("16") を sqrt につないだ program を flatMap で作ろう
// TODO ③: parseNumber("abc") から始めると何が起こるか、runSyncExit で観察しよう

console.log(Effect.runSync(parseNumber("21")))
