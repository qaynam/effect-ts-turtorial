type Option<A> =
  | { readonly _tag: "Some"; readonly value: A }
  | { readonly _tag: "None" }

const some = <A>(value: A): Option<A> => ({ _tag: "Some", value })
const none: Option<never> = { _tag: "None" }

const flatMap = <A, B>(option: Option<A>, f: (a: A) => Option<B>): Option<B> =>
  option._tag === "Some" ? f(option.value) : none

const halfIfEven = (n: number): Option<number> => (n % 2 === 0 ? some(n / 2) : none)

// Array: 「複数あるかもしれない」という箱
console.log([1, 2, 3].flatMap((n) => [n, n * 10]).join(","))

// Option: 「無いかもしれない」という箱
const half = flatMap(some(10), halfIfEven)
console.log(half._tag === "Some" ? half.value : "None")

// TODO: Promise: 「あとで届く」という箱
//   Promise.resolve(10) を then で半分にして、then で console.log しよう
