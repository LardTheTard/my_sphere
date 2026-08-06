export function nextGeneration(cells, columns, rows) {
  const next = new Uint8Array(cells.length)

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      let neighbors = 0
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx || dy) neighbors += cells[((y + dy + rows) % rows) * columns + ((x + dx + columns) % columns)]
        }
      }
      const index = y * columns + x
      next[index] = neighbors === 3 || (cells[index] && neighbors === 2) ? 1 : 0
    }
  }

  return next
}

export const scrollLag = (delta) => Math.max(-20, Math.min(20, delta * 0.28))

if (globalThis.process?.argv[1]?.endsWith('life.js')) {
  const blinker = new Uint8Array(25)
  blinker.set([1, 1, 1], 11)
  const result = nextGeneration(blinker, 5, 5)
  console.assert(result[7] && result[12] && result[17] && result.reduce((sum, cell) => sum + cell, 0) === 3)
  console.assert(scrollLag(100) === 20 && scrollLag(-100) === -20)
}
