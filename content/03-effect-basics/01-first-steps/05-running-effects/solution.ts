import { Effect } from "effect"

const ok = Effect.succeed(42)
const ng = Effect.fail(new Error("接続に失敗しました"))
const later = Effect.promise(() => Promise.resolve("非同期の結果"))

// runSync: 実行して A を直接返す(失敗すると throw する)
console.log(Effect.runSync(ok))

// runSyncExit: 失敗しても throw せず、結果を Exit で受け取る
console.log(Effect.runSyncExit(ok)._tag)

const exit = Effect.runSyncExit(ng)
console.log(exit._tag)
if (exit._tag === "Failure" && exit.cause._tag === "Fail") {
  console.log("失敗の中身:", exit.cause.error.message)
}

// runPromise: 非同期の Effect は Promise として実行する
console.log(await Effect.runPromise(later))
