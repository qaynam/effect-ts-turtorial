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

// TODO ①: catchTag で NotFoundError だけ回復し、ゲスト扱いにしよう
const recovered = fetchUser(999)

// TODO ②: catchTag に加えて catchAll で NetworkError も回復しよう
const safe = fetchUser(-1)

// TODO ③: 回復できたら、_tag の観察を runSync での出力に差し替えよう
console.log(Effect.runSyncExit(recovered)._tag)
console.log(Effect.runSyncExit(safe)._tag)
