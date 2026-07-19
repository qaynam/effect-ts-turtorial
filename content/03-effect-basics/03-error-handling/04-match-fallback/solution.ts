import { Effect } from "effect"

const parseAge = (input: string): Effect.Effect<number, Error> => {
  const n = Number(input)
  return Number.isNaN(n)
    ? Effect.fail(new Error(`数値ではありません: ${input}`))
    : Effect.succeed(n)
}

// match: 成功・失敗の両方を普通の値に畳み込む。結果は Effect<string, never>
const describe = (input: string) =>
  parseAge(input).pipe(
    Effect.match({
      onFailure: (e) => `入力エラー: ${e.message}`,
      onSuccess: (age) => `${age} 歳ですね`,
    }),
  )

console.log(Effect.runSync(describe("20")))
console.log(Effect.runSync(describe("二十")))

// orElse: 失敗したら「代わりの Effect」に乗り換える
const withDefault = parseAge("abc").pipe(Effect.orElse(() => Effect.succeed(0)))
console.log("フォールバック:", Effect.runSync(withDefault))
