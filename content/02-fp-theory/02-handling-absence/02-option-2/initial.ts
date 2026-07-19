type Option<A> =
  | { readonly _tag: "Some"; readonly value: A }
  | { readonly _tag: "None" }

const some = <A>(value: A): Option<A> => ({ _tag: "Some", value })
const none: Option<never> = { _tag: "None" }

// TODO: Some なら中身に f を適用、None ならそのまま
const map = <A, B>(option: Option<A>, f: (a: A) => B): Option<B> => none

// TODO: Some なら f を適用して、その結果の Option をそのまま返す
const flatMap = <A, B>(option: Option<A>, f: (a: A) => Option<B>): Option<B> => none

// TODO: Some なら中身、None なら fallback
const getOrElse = <A>(option: Option<A>, fallback: A): A => fallback

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
