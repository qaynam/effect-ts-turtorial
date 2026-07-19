const cart = [1200, 800, 3000]

// 計算(合計を求める)とアクション(表示する)が混ざっている
function printTotal(items: number[]): void {
  let total = 0
  for (const item of items) {
    total += item
  }
  console.log(`合計: ${total}円`)
}

printTotal(cart)

// TODO: 「送料込み: 5500円」も表示したい。
// でも printTotal は表示までしてしまうので、合計を再利用できない…
