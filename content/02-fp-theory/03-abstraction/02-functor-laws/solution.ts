type Option<A> =
  | { readonly _tag: "Some"; readonly value: A }
  | { readonly _tag: "None" }

const some = <A>(value: A): Option<A> => ({ _tag: "Some", value })
const none: Option<never> = { _tag: "None" }

const map = <A, B>(option: Option<A>, f: (a: A) => B): Option<B> =>
  option._tag === "Some" ? some(f(option.value)) : none

// 表示用: Some(5) / None の形の文字列にする
const show = <A>(option: Option<A>): string =>
  option._tag === "Some" ? `Some(${option.value})` : "None"

const id = <A>(a: A): A => a
const f = (n: number) => n + 1
const g = (n: number) => n * 2

// 恒等則: 何もしない関数を map しても、箱は変わらない
console.log(`恒等則: ${show(map(some(5), id))} = ${show(some(5))}`)

// 合成則: 2 回に分けて map しても、合成して 1 回 map しても同じ
const twice = map(map(some(5), f), g)
const once = map(some(5), (n) => g(f(n)))
console.log(`合成則: ${show(twice)} = ${show(once)}`)

// まったく別の実装(Array.prototype.map)でも、同じ法則が成り立つ
const chained = [1, 2, 3].map(f).map(g).join(",")
const fused = [1, 2, 3].map((n) => g(f(n))).join(",")
console.log(`Array の合成則: ${chained} = ${fused}`)
