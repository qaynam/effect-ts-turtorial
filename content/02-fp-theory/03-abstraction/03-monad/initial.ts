type Option<A> =
  | { readonly _tag: "Some"; readonly value: A }
  | { readonly _tag: "None" }

const some = <A>(value: A): Option<A> => ({ _tag: "Some", value })
const none: Option<never> = { _tag: "None" }

const map = <A, B>(option: Option<A>, f: (a: A) => B): Option<B> =>
  option._tag === "Some" ? some(f(option.value)) : none

// TODO: flatMap を実装しよう(map との 1 行の違いに注目)
const flatMap = <A, B>(option: Option<A>, f: (a: A) => Option<B>): Option<B> => none

const emails = new Map([["ichiro", "ichiro@example.com"]])

const findEmail = (name: string): Option<string> => {
  const email = emails.get(name)
  return email === undefined ? none : some(email)
}

const domainOf = (email: string): Option<string> => {
  const at = email.indexOf("@")
  return at < 0 ? none : some(email.slice(at + 1))
}

// map に「箱を返す関数」を渡すと、箱の中に箱ができる
const nested = map(some("ichiro"), findEmail) // Option<Option<string>>
console.log(
  nested._tag === "Some" && nested.value._tag === "Some" ? nested.value.value : "None",
)

// TODO: flatMap ができたら、上の二重チェックを連鎖で置き換えよう
const chained = flatMap(flatMap(some("ichiro"), findEmail), domainOf)
console.log(chained._tag === "Some" ? chained.value : "None")
console.log(flatMap(some("noone"), findEmail)._tag)
