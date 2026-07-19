import { Effect } from "effect"

// 失敗を throw ではなく「値」として返す。
// 型 Effect<number, Error> に失敗の可能性が現れている
function divide(a: number, b: number): Effect.Effect<number, Error> {
  return b === 0
    ? Effect.fail(new Error("ゼロで割れません"))
    : Effect.succeed(a / b)
}

const result = Effect.runSync(divide(10, 2))
console.log("割り算成功:", result)

// runSyncExit は失敗しても throw せず、結果を Exit という値で返す
const failed = Effect.runSyncExit(divide(1, 0))
if (failed._tag === "Failure") {
  console.log("ゼロ除算はエラーになる")
}
