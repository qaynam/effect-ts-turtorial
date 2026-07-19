type Shape =
  | { readonly _tag: "Circle"; readonly radius: number }
  | { readonly _tag: "Square"; readonly side: number }
  | { readonly _tag: "Rectangle"; readonly width: number; readonly height: number }

// TODO: Rectangle のケースを追加し、default を never の網羅性チェックに書き換えよう
const area = (shape: Shape): number => {
  switch (shape._tag) {
    case "Circle":
      return 3.14 * shape.radius * shape.radius
    case "Square":
      return shape.side * shape.side
    default:
      return 0
  }
}

console.log(area({ _tag: "Circle", radius: 10 }))
console.log(area({ _tag: "Square", side: 5 }))
console.log(area({ _tag: "Rectangle", width: 3, height: 4 }))
