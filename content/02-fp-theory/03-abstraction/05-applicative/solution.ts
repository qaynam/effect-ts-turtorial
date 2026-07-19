type Option<A> =
  | { readonly _tag: "Some"; readonly value: A }
  | { readonly _tag: "None" }

const some = <A>(value: A): Option<A> => ({ _tag: "Some", value })
const none: Option<never> = { _tag: "None" }

const map = <A, B>(option: Option<A>, f: (a: A) => B): Option<B> =>
  option._tag === "Some" ? some(f(option.value)) : none

const flatMap = <A, B>(option: Option<A>, f: (a: A) => Option<B>): Option<B> =>
  option._tag === "Some" ? f(option.value) : none

// 両方 Some なら中身のペア、どちらかが None なら None
const zip = <A, B>(oa: Option<A>, ob: Option<B>): Option<readonly [A, B]> =>
  flatMap(oa, (a) => map(ob, (b) => [a, b] as const))

const familyName = some("鈴木")
const givenName = some("一朗")

// flatMap の入れ子でも書けるが、独立した 2 つが「逐次」の形になってしまう
const fullName1 = flatMap(familyName, (f) => map(givenName, (g) => `${f} ${g}`))
console.log(fullName1._tag === "Some" ? fullName1.value : "不明")

// zip なら「組み合わせてから、変換する」という実際の構造どおりに書ける
const fullName2 = map(zip(familyName, givenName), ([f, g]) => `${f} ${g}`)
console.log(fullName2._tag === "Some" ? fullName2.value : "不明")
console.log(map(zip(familyName, none as Option<string>), ([f, g]) => `${f} ${g}`)._tag)
