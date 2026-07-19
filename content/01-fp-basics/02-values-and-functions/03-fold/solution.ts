// 骨組み(初期値から始めて 1 つずつ取り込む)は myFold が持ち、
// 「どう累積するか」は初期値と f が決める
function myFold<A, B>(items: A[], initial: B, f: (acc: B, item: A) => B): B {
  let acc = initial
  for (const item of items) {
    acc = f(acc, item)
  }
  return acc
}

console.log(myFold([1, 2, 3, 4], 0, (acc, n) => acc + n))
console.log(myFold([3, 9, 4], 0, (acc, n) => (n > acc ? n : acc)))
console.log(myFold(["a", "b", "c"], "", (acc, s) => acc + s))

// map も fold で書ける: 空配列から始めて、変換した要素を足していく
function myMap<A, B>(items: A[], g: (item: A) => B): B[] {
  return myFold(items, [] as B[], (acc, item) => [...acc, g(item)])
}

console.log(myMap([1, 2, 3], (n) => n * 2).join(","))
