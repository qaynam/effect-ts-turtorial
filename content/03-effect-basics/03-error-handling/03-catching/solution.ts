import { Data, Effect } from "effect"

class NetworkError extends Data.TaggedError("NetworkError")<{ url: string }> {}
class NotFoundError extends Data.TaggedError("NotFoundError")<{ id: number }> {}

const fetchUser = (
  id: number,
): Effect.Effect<string, NetworkError | NotFoundError> =>
  id < 0
    ? Effect.fail(new NetworkError({ url: `/users/${id}` }))
    : id > 100
      ? Effect.fail(new NotFoundError({ id }))
      : Effect.succeed(`user-${id}`)

// catchTag: NotFoundError だけ処理 → E は NetworkError だけになる
const recovered = fetchUser(999).pipe(
  Effect.catchTag("NotFoundError", (e) =>
    Effect.succeed(`ゲスト (id=${e.id} は未登録)`),
  ),
)

// catchAll: 残りすべてを処理 → E は never になる
const safe = fetchUser(-1).pipe(
  Effect.catchTag("NotFoundError", (e) => Effect.succeed(`ゲスト (id=${e.id})`)),
  Effect.catchAll((e) => Effect.succeed(`オフライン表示 (${e.url})`)),
)

console.log(Effect.runSync(recovered))
console.log(Effect.runSync(safe))
