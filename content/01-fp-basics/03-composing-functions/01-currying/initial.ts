// ふつうの 2 引数関数
const add = (a: number, b: number): number => a + b
console.log(add(2, 3))

// TODO: 仮実装の 0 を直して、カリー化された足し算を完成させよう
const addCurried = (a: number) => (b: number): number => 0
console.log(addCurried(2)(3))

// 引数を 1 つだけ渡して「途中で止める」こともできる
const add10 = addCurried(10)
console.log(add10(5))
