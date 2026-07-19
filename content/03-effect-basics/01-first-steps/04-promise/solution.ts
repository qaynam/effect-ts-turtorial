import { Effect } from "effect"

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

// promise: 「絶対に reject しない」Promise を包む。E は never のまま
const brew = Effect.promise(async () => {
  await wait(100)
  return "コーヒー"
})

console.log("処理完了:", await Effect.runPromise(brew))

// tryPromise: reject しうる Promise を包む。catch で E の型を自分で決める
const checkStock = (item: string) =>
  Effect.tryPromise({
    try: async () => {
      await wait(100)
      if (item !== "コーヒー") throw new Error("在庫なし")
      return item
    },
    catch: () => new Error("在庫がありません"),
  })

const exit = await Effect.runPromiseExit(checkStock("紅茶"))
if (exit._tag === "Failure" && exit.cause._tag === "Fail") {
  console.log(exit.cause.error.message)
}
