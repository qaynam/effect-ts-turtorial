import { Either, Option, pipe } from "effect"

const emails = new Map([["ichiro", "ichiro@example.com"]])

const findEmail = (name: string): Option.Option<string> => {
  const email = emails.get(name)
  return email === undefined ? Option.none() : Option.some(email)
}

const domainOf = (email: string): Option.Option<string> => {
  const at = email.indexOf("@")
  return at < 0 ? Option.none() : Option.some(email.slice(at + 1))
}

// pipe と data-last な関数で、上から下へ読める一本道になる
const domain = pipe(
  findEmail("ichiro"),
  Option.flatMap(domainOf),
  Option.map((d) => d.toUpperCase()),
  Option.getOrElse(() => "不明"),
)
console.log(domain)
console.log(pipe(findEmail("hanako"), Option.getOrElse(() => "不明")))

// effect の Either は型引数が「成功が先」: Either<A, E>
const parseAge = (input: string): Either.Either<number, string> => {
  const n = Number(input)
  return Number.isNaN(n) ? Either.left(`数値ではありません: ${input}`) : Either.right(n)
}

const show = (result: Either.Either<number, string>): string =>
  Either.match(result, {
    onLeft: (e) => `入力エラー: ${e}`,
    onRight: (n) => `年齢は ${n} 歳`,
  })

console.log(show(parseAge("28")))
console.log(show(parseAge("abc")))
