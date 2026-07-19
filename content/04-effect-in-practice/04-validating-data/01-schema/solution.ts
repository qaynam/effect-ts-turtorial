import { Effect, Schema } from "effect"

const goodData: unknown = JSON.parse('{"name":"田中","age":28}')
const badData: unknown = JSON.parse('{"name":"田中","age":"28"}')

// 期待する形の宣言。型ではなく実行時に使える「値」
const User = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
})

// 検証を通れば型のある値になる(ダメなら throw)
const user = Schema.decodeUnknownSync(User)(goodData)
console.log(`${user.name}(${user.age}歳)`)

// Effect 版なら失敗は ParseError というタグ付きエラーになる
const program = Schema.decodeUnknown(User)(badData).pipe(
  Effect.catchTag("ParseError", (e) =>
    Effect.sync(() => console.log("検証エラー:\n" + e.message)),
  ),
)
Effect.runSync(program)
