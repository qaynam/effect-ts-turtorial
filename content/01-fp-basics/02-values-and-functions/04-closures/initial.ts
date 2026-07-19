// TODO: 呼ぶたびに 1 ずつ増えた値を返すカウンタを作ろう
function makeCounter() {
  // ヒント: ここに count 変数を置くと、返した関数だけが触れる
  return () => {
    return 0
  }
}

const counterA = makeCounter()
const counterB = makeCounter()

console.log(counterA()) // 1 にしたい
console.log(counterA()) // 2
console.log(counterA()) // 3
console.log(counterB()) // 別のカウンタなので 1
