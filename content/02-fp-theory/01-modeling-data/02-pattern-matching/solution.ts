type Shape =
  | { readonly _tag: "Circle"; readonly radius: number }
  | { readonly _tag: "Square"; readonly side: number }
  | { readonly _tag: "Rectangle"; readonly width: number; readonly height: number }

const area = (shape: Shape): number => {
  switch (shape._tag) {
    case "Circle":
      return 3.14 * shape.radius * shape.radius
    case "Square":
      return shape.side * shape.side
    case "Rectangle":
      return shape.width * shape.height
    default: {
      // 全ケースを網羅していれば、ここに到達する値は存在しない(never)
      const exhaustive: never = shape
      return exhaustive
    }
  }
}

console.log(area({ _tag: "Circle", radius: 10 }))
console.log(area({ _tag: "Square", side: 5 }))
console.log(area({ _tag: "Rectangle", width: 3, height: 4 }))
