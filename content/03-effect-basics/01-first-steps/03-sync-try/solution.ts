import { Effect } from "effect"

// sync: 副作用を関数で包む。作った時点では中身は評価されない
const hello = Effect.sync(() => {
  console.log("実行された!")
  return 42
})

console.log("--- まだ何も実行されていない ---")
console.log(Effect.runSync(hello))

// try: throw しうる同期処理を包む。throw は E チャンネルの失敗になる
const parseJson = (text: string) =>
  Effect.try(() => JSON.parse(text) as { name: string })

console.log(Effect.runSync(parseJson('{"name":"Alice"}')).name)
console.log(Effect.runSyncExit(parseJson("{壊れたJSON"))._tag)
