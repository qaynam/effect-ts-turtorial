import { Data, Effect } from "effect"

// TODO ①: NetworkError(url: string を持つ)と
//          NotFoundError(id: number を持つ)を Data.TaggedError で定義しよう

// TODO ②: id < 0 なら NetworkError、id > 100 なら NotFoundError で
//          失敗するように書き足そう(yield* new XxxError({ ... }))
const fetchUser = (id: number) =>
  Effect.gen(function* () {
    return `user-${id}`
  })

console.log(Effect.runSync(fetchUser(1)))

// TODO ③: fetchUser(999) が失敗するようになったら、
//          cause からエラーの _tag とフィールドを取り出して表示しよう
const exit = Effect.runSyncExit(fetchUser(999))
console.log(exit._tag)
