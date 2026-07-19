// TODO: 自作の Option / Either を、effect の本物に置き換えよう
//   import { Either, Option, pipe } from "effect"
type Option<A> =
  | { readonly _tag: "Some"; readonly value: A }
  | { readonly _tag: "None" }
const some = <A>(value: A): Option<A> => ({ _tag: "Some", value })
const none: Option<never> = { _tag: "None" }
const map = <A, B>(o: Option<A>, f: (a: A) => B): Option<B> =>
  o._tag === "Some" ? some(f(o.value)) : none
const flatMap = <A, B>(o: Option<A>, f: (a: A) => Option<B>): Option<B> =>
  o._tag === "Some" ? f(o.value) : none
const getOrElse = <A>(o: Option<A>, fallback: A): A =>
  o._tag === "Some" ? o.value : fallback

type Either<E, A> =
  | { readonly _tag: "Left"; readonly left: E }
  | { readonly _tag: "Right"; readonly right: A }
const left = <E>(e: E): Either<E, never> => ({ _tag: "Left", left: e })
const right = <A>(a: A): Either<never, A> => ({ _tag: "Right", right: a })

const emails = new Map([["ichiro", "ichiro@example.com"]])

const findEmail = (name: string): Option<string> => {
  const email = emails.get(name)
  return email === undefined ? none : some(email)
}

const domainOf = (email: string): Option<string> => {
  const at = email.indexOf("@")
  return at < 0 ? none : some(email.slice(at + 1))
}

const domain = flatMap(findEmail("ichiro"), domainOf)
console.log(getOrElse(map(domain, (d) => d.toUpperCase()), "不明"))
console.log(getOrElse(findEmail("hanako"), "不明"))

const parseAge = (input: string): Either<string, number> => {
  const n = Number(input)
  return Number.isNaN(n) ? left(`数値ではありません: ${input}`) : right(n)
}

const show = (result: Either<string, number>): string =>
  result._tag === "Right" ? `年齢は ${result.right} 歳` : `入力エラー: ${result.left}`

console.log(show(parseAge("28")))
console.log(show(parseAge("abc")))
