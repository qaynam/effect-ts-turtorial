import { Effect, Ref } from "effect"

const program = Effect.gen(function* () {
  // 作る・読む・更新する。すべて Effect
  const counter = yield* Ref.make(0)
  console.log("初期値:", yield* Ref.get(counter))

  yield* Ref.update(counter, (n) => n + 1)
  console.log("1回更新後:", yield* Ref.get(counter))

  // 1000 本の Fiber が同時に +1 しても、更新は 1 件も消えない
  yield* Effect.all(
    Array.from({ length: 1000 }, () => Ref.update(counter, (n) => n + 1)),
    { concurrency: "unbounded" },
  )
  console.log("並行1000回更新後:", yield* Ref.get(counter))
})

Effect.runPromise(program)
