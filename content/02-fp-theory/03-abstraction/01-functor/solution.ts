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

// どの map も同じ形: (F<A>, (a: A) => B) => F<B>
const mapBox = <A, B>(box: Box<A>, f: (a: A) => B): Box<B> => ({ value: f(box.value) })

const double = (n: number) => n * 2

// Array という箱
console.log([1, 2, 3].map(double).join(","))

// Option という箱
const doubled = map(some(10), double)
console.log(doubled._tag === "Some" ? doubled.value : -1)

// Box という箱
console.log(mapBox({ value: 7 }, double).value)
