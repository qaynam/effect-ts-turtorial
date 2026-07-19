import { Context, Effect, Layer } from "effect"

// 都市名 --(Geocoding)--> 座標 --(Weather)--> 現在の気温
interface Coords {
  readonly latitude: number
  readonly longitude: number
}

// TODO(1): Geocoding サービス(search: 都市名 → Coords)を Context.Tag で宣言する

// TODO(2): Weather サービス(current: Coords → 気温)を Context.Tag で宣言する

// TODO(3): 固定値を返すスタブ Layer を 2 つ作る

const program = Effect.gen(function* () {
  // TODO(4): サービスを取り出し、search → current の順につなぐ
  console.log("まだ何も実装されていません")
})

Effect.runPromise(program)
