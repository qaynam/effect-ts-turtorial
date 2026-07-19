// ふつうの 2 引数関数
const add = (a: number, b: number): number => a + b
console.log(add(2, 3))

// カリー化: 「a を覚えた関数」を返す(クロージャ)
const addCurried = (a: number) => (b: number): number => a + b
console.log(addCurried(2)(3))

// 引数を 1 つだけ渡して「途中で止める」こともできる
const add10 = addCurried(10)
console.log(add10(5))
