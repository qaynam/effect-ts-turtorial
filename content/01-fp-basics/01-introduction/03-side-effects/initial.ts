// スコアの上位 3 件を返す…つもりの関数
function top3(scores: number[]): number[] {
  return scores.sort((a, b) => b - a).slice(0, 3)
}

const scores = [50, 90, 70, 100, 60]

console.log(top3(scores).join(","))
console.log(scores[0]) // 元の配列の先頭。50 のはずが…
