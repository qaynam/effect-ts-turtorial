// TODO: 各要素に「何をするか」を f として受け取り、
// f を適用した結果からなる新しい配列を返そう
function myMap(numbers: number[], f: (n: number) => number): number[] {
  const result: number[] = []
  for (const n of numbers) {
    result.push(n) // まだ f を使っていない
  }
  return result
}

// 同じ myMap が、渡す関数しだいで別の変換になる
console.log(myMap([1, 2, 3], (n) => n * 2).join(","))
console.log(myMap([1, 2, 3], (n) => n + 10).join(","))
