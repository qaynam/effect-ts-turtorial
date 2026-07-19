const cart = [1200, 800, 3000]

// 計算: 入力から出力を求めるだけ。何回呼んでも安全
function calculateTotal(items: number[]): number {
  let total = 0
  for (const item of items) {
    total += item
  }
  return total
}

// アクション: プログラムの端で、まとめて
console.log(`合計: ${calculateTotal(cart)}円`)
console.log(`送料込み: ${calculateTotal(cart) + 500}円`)
