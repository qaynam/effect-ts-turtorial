import { Effect } from "effect"

const parseAge = (input: string): Effect.Effect<number, Error> => {
  const n = Number(input)
  return Number.isNaN(n)
    ? Effect.fail(new Error(`数値ではありません: ${input}`))
    : Effect.succeed(n)
}

// TODO ①: Effect.match({ onFailure, onSuccess }) で、
//          成功なら「◯ 歳ですね」、失敗なら「入力エラー: ...」を返そう
const describe = (input: string) => parseAge(input)

// TODO ②: describe が文字列を返すようになったら runSync で出力しよう
console.log(Effect.runSyncExit(describe("20"))._tag)
console.log(Effect.runSyncExit(describe("二十"))._tag)

// TODO ③: parseAge("abc") が失敗したら 0 で成功する withDefault を
//          Effect.orElse で作り、出力しよう
