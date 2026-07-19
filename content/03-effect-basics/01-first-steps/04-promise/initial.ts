import { Effect } from "effect"

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

// 100ms 後にコーヒーができる async 処理。
// TODO ①: Effect.promise で包んで、設計図 brew にしよう
const brewPromise = async () => {
  await wait(100)
  return "コーヒー"
}

console.log("処理完了:", await brewPromise())

// TODO ②: 「コーヒー以外は在庫切れになる」在庫確認 checkStock を
//          Effect.tryPromise({ try, catch }) で作り、
//          checkStock("紅茶") の失敗を runPromiseExit で観察しよう
