import { Data, Effect } from "effect"

class NetworkError extends Data.TaggedError("NetworkError")<{ url: string }> {}

class NotFoundError extends Data.TaggedError("NotFoundError")<{ id: number }> {}

// E は自動的にユニオンになる: Effect<string, NetworkError | NotFoundError>
const fetchUser = (id: number) =>
  Effect.gen(function* () {
    if (id < 0) {
      return yield* new NetworkError({ url: `/users/${id}` })
    }
    if (id > 100) {
      return yield* new NotFoundError({ id })
    }
    return `user-${id}`
  })

console.log(Effect.runSync(fetchUser(1)))

const exit = Effect.runSyncExit(fetchUser(999))
if (exit._tag === "Failure" && exit.cause._tag === "Fail") {
  const error = exit.cause.error
  console.log("エラーの種類:", error._tag)
  if (error._tag === "NotFoundError") {
    console.log(`id=${error.id} は存在しません`)
  }
}
