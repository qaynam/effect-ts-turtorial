type Option<A> =
  | { readonly _tag: "Some"; readonly value: A }
  | { readonly _tag: "None" }

const some = <A>(value: A): Option<A> => ({ _tag: "Some", value })
const none: Option<never> = { _tag: "None" }

const flatMap = <A, B>(option: Option<A>, f: (a: A) => Option<B>): Option<B> =>
  option._tag === "Some" ? f(option.value) : none

const show = <A>(option: Option<A>): string =>
  option._tag === "Some" ? `Some(${option.value})` : "None"

// Option を返す 2 つの関数
const f = (n: number): Option<number> => some(n + 1)
const g = (n: number): Option<number> => some(n * 2)

// 左単位元: 包んですぐつなぐのは、関数を直接呼ぶのと同じ
console.log(`左単位元: ${show(flatMap(some(5), f))} = ${show(f(5))}`)

// 右単位元: 「包むだけの関数」をつないでも何も起きない
console.log(`右単位元: ${show(flatMap(some(5), some))} = ${show(some(5))}`)

// 結合則: つなぎ方の括弧の位置を変えても結果は同じ
const grouped1 = flatMap(flatMap(some(5), f), g)
const grouped2 = flatMap(some(5), (n) => flatMap(f(n), g))
console.log(`結合則: ${show(grouped1)} = ${show(grouped2)}`)
