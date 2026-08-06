import { useEffect, useRef, useState } from 'react'
import { nextGeneration } from './life.js'

const projects = [
  {
    title: 'Reminiscence',
    detail: 'iPhone video to VR-ready Gaussian splats in under two minutes.',
    stack: 'PyTorch · Swift · Unity · FastAPI',
    href: 'https://github.com/LargoLardo/reminiscence',
  },
  {
    title: "Hold’em AI",
    detail: 'An MCCFR poker solver that learned to beat heuristic agents.',
    stack: 'NumPy · React · Flask',
    href: 'https://github.com/LargoLardo/lard_plays_poker',
  },
  {
    title: 'Chess Engine',
    detail: 'A policy/value network paired with MCTS, trained through self-play.',
    stack: 'PyTorch · MCTS · Vite',
    href: 'https://github.com/LargoLardo/lard_plays_chess',
  },
]

function LifeCanvas({ running, reset, boardRef }) {
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)
  const runningRef = useRef(running)

  useEffect(() => {
    runningRef.current = running
  }, [running])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    let frame
    let lastStep = 0

    const resize = () => {
      const cellSize = innerWidth < 700 ? 15 : 18
      const columns = Math.ceil(innerWidth / cellSize)
      const rows = Math.ceil(innerHeight / cellSize)
      const cells = new Uint8Array(columns * rows)
      for (let i = 0; i < cells.length; i += 1) cells[i] = Math.random() < 0.17 ? 1 : 0
      boardRef.current = { cells, columns, rows, cellSize }
      canvas.width = innerWidth * devicePixelRatio
      canvas.height = innerHeight * devicePixelRatio
      canvas.style.width = `${innerWidth}px`
      canvas.style.height = `${innerHeight}px`
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }

    const draw = (time = 0) => {
      const state = boardRef.current
      if (!state) return
      if (runningRef.current && time - lastStep > 120) {
        state.cells = nextGeneration(state.cells, state.columns, state.rows)
        lastStep = time
      }
      context.clearRect(0, 0, innerWidth, innerHeight)
      context.fillStyle = '#b8f1dc'
      for (let i = 0; i < state.cells.length; i += 1) {
        if (!state.cells[i]) continue
        const x = (i % state.columns) * state.cellSize
        const y = Math.floor(i / state.columns) * state.cellSize
        context.fillRect(x + 1, y + 1, state.cellSize - 2, state.cellSize - 2)
      }
      frame = requestAnimationFrame(draw)
    }

    resize()
    addEventListener('resize', resize)
    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('resize', resize)
    }
  }, [reset, boardRef])

  const paint = (event) => {
    if (!drawingRef.current && event.type !== 'pointerdown') return
    const state = boardRef.current
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.floor((event.clientX - rect.left) / state.cellSize)
    const y = Math.floor((event.clientY - rect.top) / state.cellSize)
    if (x >= 0 && x < state.columns && y >= 0 && y < state.rows) state.cells[y * state.columns + x] = 1
  }

  return (
    <canvas
      ref={canvasRef}
      className="life-canvas"
      aria-label="Interactive Conway's Game of Life. Click or drag to add living cells."
      onPointerDown={(event) => {
        drawingRef.current = true
        event.currentTarget.setPointerCapture(event.pointerId)
        paint(event)
      }}
      onPointerMove={paint}
      onPointerUp={() => { drawingRef.current = false }}
      onPointerCancel={() => { drawingRef.current = false }}
    />
  )
}

export default function MinimalPortfolio() {
  const [running, setRunning] = useState(true)
  const [reset, setReset] = useState(0)
  const boardRef = useRef(null)

  return (
    <main className="minimal-portfolio">
      <LifeCanvas running={running} reset={reset} boardRef={boardRef} />
      <div className="life-shade" />

      <a className="saturn-link" href="/current" aria-label="Enter Logan's immersive space portfolio">
        <span className="saturn-ring" />
        <span className="saturn-planet" />
        <span className="saturn-label">enter orbit</span>
      </a>

      <section className="portfolio-card">
        <p className="eyebrow">Logan Zhao · Toronto / Waterloo</p>
        <h1>I build intelligent<br />things that feel <em>alive.</em></h1>
        <p className="intro">
          Systems Design Engineering student working across machine learning,
          creative tools, and interactive systems.
        </p>

        <div className="project-list" aria-label="Selected projects">
          {projects.map((project, index) => (
            <a key={project.title} href={project.href} target="_blank" rel="noreferrer" className="project">
              <span className="project-number">0{index + 1}</span>
              <span>
                <strong>{project.title}</strong>
                <small>{project.detail}</small>
                <small className="stack">{project.stack}</small>
              </span>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>

        <footer>
          <a href="mailto:logan.zhao@uwaterloo.ca">Email</a>
          <a href="https://github.com/LargoLardo" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/logan-zhao-328653232" target="_blank" rel="noreferrer">LinkedIn</a>
          <span>Plant cells anywhere outside this panel.</span>
        </footer>
      </section>

      <div className="life-controls" aria-label="Game of Life controls">
        <button type="button" onClick={() => setRunning((value) => !value)}>{running ? 'Pause' : 'Play'}</button>
        <button type="button" onClick={() => setReset((value) => value + 1)}>Randomize</button>
        <button type="button" onClick={() => boardRef.current?.cells.fill(0)}>Clear</button>
      </div>
    </main>
  )
}
