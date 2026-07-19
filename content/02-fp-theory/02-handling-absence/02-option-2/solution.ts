type Option<A> =
  | { readonly _tag: "Some"; readonly value: A }
  | { readonly _tag: "None" }

const some = <A>(value: A): Option<A> => ({ _tag: "Some", value })
const none: Option<never> = { _tag: "None" }

// Some なら中身に f を適用、None ならそのまま
const map = <A, B>(option: Option<A>, f: (a: A) => B): Option<B> =>
  option._tag === "Some" ? some(f(option.value)) : none

// Some なら f を適用して、その結果の Option をそのまま返す(箱を二重にしない)
const flatMap = <A, B>(option: Option<A>, f: (a: A) => Option<B>): Option<B> =>
  option._tag === "Some" ? f(option.value) : none

// Some なら中身、None なら fallback
const getOrElse = <A>(option: Option<A>, fallback: A): A =>
  option._tag === "Some" ? option.value : fallback

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
console.log(getOrElse(flatMap(findEmail("hanako"), domainOf), "不明"))
