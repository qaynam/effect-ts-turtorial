// コピーしてからソートするので、引数の配列は変わらない
function top3(scores: number[]): number[] {
  return scores.slice().sort((a, b) => b - a).slice(0, 3)
}

const scores = [50, 90, 70, 100, 60]

console.log(top3(scores).join(","))
console.log(scores[0]) // 50 のまま
