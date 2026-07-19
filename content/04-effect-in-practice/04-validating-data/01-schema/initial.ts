import { Effect, Schema } from "effect"

// 外の世界から来たデータ。型は unknown
const goodData: unknown = JSON.parse('{"name":"田中","age":28}')
const badData: unknown = JSON.parse('{"name":"田中","age":"28"}')

// TODO: 1. Schema.Struct で User スキーマを定義しよう
//          (name: Schema.String, age: Schema.Number)
// TODO: 2. Schema.decodeUnknownSync(User)(goodData) で検証し、
//          「田中(28歳)」と出力しよう
// TODO: 3. badData は Schema.decodeUnknown(User) で検証し、
//          catchTag("ParseError", ...) でエラーメッセージを出力しよう

console.log(goodData, badData)
