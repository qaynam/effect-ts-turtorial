type Option<A> =
  | { readonly _tag: "Some"; readonly value: A }
  | { readonly _tag: "None" }

const some = <A>(value: A): Option<A> => ({ _tag: "Some", value })
const none: Option<never> = { _tag: "None" }

const map = <A, B>(option: Option<A>, f: (a: A) => B): Option<B> =>
  option._tag === "Some" ? some(f(option.value)) : none

// 値を 1 つ包むだけの、いちばん単純な箱
interface Box<A> {
  readonly value: A
}

// TODO: Box の map を実装しよう(開けて、変換して、包み直す)
const mapBox = <A, B>(box: Box<A>, f: (a: A) => B): Box<B> => {
  throw new Error("未実装")
}

const double = (n: number) => n * 2

console.log([1, 2, 3].map(double).join(","))

const doubled = map(some(10), double)
console.log(doubled._tag === "Some" ? doubled.value : -1)

// TODO: mapBox ができたらコメントを外そう
// console.log(mapBox({ value: 7 }, double).value)
