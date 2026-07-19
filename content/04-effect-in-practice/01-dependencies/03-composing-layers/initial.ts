import { Context, Effect, Layer } from "effect"

class Database extends Context.Tag("Database")<
  Database,
  { readonly lookup: (id: number) => Effect.Effect<string> }
>() {}

class Logger extends Context.Tag("Logger")<
  Logger,
  { readonly log: (message: string) => Effect.Effect<void> }
>() {}

// program: Effect<void, never, Database | Logger> — 依存が | で積み上がる
const program = Effect.gen(function* () {
  const db = yield* Database
  const logger = yield* Logger
  yield* logger.log("ユーザーを取得します")
  const name = yield* db.lookup(1)
  console.log("結果:", name)
})

const DatabaseLive = Layer.succeed(Database, {
  lookup: (id) => Effect.succeed(`本番ユーザー${id}`),
})

const LoggerLive = Layer.succeed(Logger, {
  log: (message) => Effect.sync(() => console.log("[log]", message)),
})

// TODO: 1. Layer.merge で 2 つの Layer を MainLive にまとめて provide しよう
// TODO: 2. 固定値を返す DatabaseTest を作り、MainTest 構成でもう一度実行しよう
Effect.runSync(
  program.pipe(Effect.provide(DatabaseLive), Effect.provide(LoggerLive)),
)
