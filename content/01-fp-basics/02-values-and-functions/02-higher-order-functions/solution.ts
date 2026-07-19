// 骨組み(走査とコピー)は myMap が持ち、
// 「何をするか」は引数 f が決める
function myMap(numbers: number[], f: (n: number) => number): number[] {
  const result: number[] = []
  for (const n of numbers) {
    result.push(f(n))
  }
  return result
}

// 同じ myMap が、渡す関数しだいで別の変換になる
console.log(myMap([1, 2, 3], (n) => n * 2).join(","))
console.log(myMap([1, 2, 3], (n) => n + 10).join(","))
