import { Context, Effect, Layer } from "effect"

class Database extends Context.Tag("Database")<
  Database,
  { readonly lookup: (id: number) => Effect.Effect<string> }
>() {}

class Logger extends Context.Tag("Logger")<
  Logger,
  { readonly log: (message: string) => Effect.Effect<void> }
>() {}

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

// DB に繋がず固定値を返すスタブ。program には一切手を入れない
const DatabaseTest = Layer.succeed(Database, {
  lookup: () => Effect.succeed("テストユーザー"),
})

const MainLive = Layer.merge(DatabaseLive, LoggerLive)
const MainTest = Layer.merge(DatabaseTest, LoggerLive)

Effect.runSync(Effect.provide(program, MainLive))
Effect.runSync(Effect.provide(program, MainTest))
