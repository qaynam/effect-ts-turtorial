// TODO: 初期値 initial から始めて、要素を 1 つずつ f で取り込み、
// 最後の累積値を返す myFold を完成させよう
function myFold<A, B>(items: A[], initial: B, f: (acc: B, item: A) => B): B {
  let acc = initial
  for (const item of items) {
    acc = acc // まだ f も item も使っていない
  }
  return acc
}

// 同じ myFold が、渡した初期値と関数しだいで合計にも最大値にも連結にもなる
console.log(myFold([1, 2, 3, 4], 0, (acc, n) => acc + n)) // 10 にしたい
console.log(myFold([3, 9, 4], 0, (acc, n) => (n > acc ? n : acc))) // 9
console.log(myFold(["a", "b", "c"], "", (acc, s) => acc + s)) // abc
