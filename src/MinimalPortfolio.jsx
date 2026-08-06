import { useEffect, useRef, useState } from 'react'
import { nextGeneration, scrollLag } from './life.js'

const projects = [
  {
    title: 'Reminiscence',
    detail: 'iPhone video to VR-ready Gaussian splats in under two minutes.',
    stack: 'PYTORCH / SWIFT / UNITY / FASTAPI',
    href: 'https://github.com/LargoLardo/reminiscence',
    image: '',
  },
  {
    title: "Hold’em AI",
    detail: 'An MCCFR poker solver that learned to beat heuristic agents.',
    stack: 'NUMPY / REACT / FLASK',
    href: 'https://github.com/LargoLardo/lard_plays_poker',
    image: '',
  },
  {
    title: 'Chess Engine',
    detail: 'A policy/value network paired with MCTS, trained through self-play.',
    stack: 'PYTORCH / MCTS / VITE',
    href: 'https://github.com/LargoLardo/lard_plays_chess',
    image: '',
  },
]

const experience = [
  {
    title: 'Application Programmer, Ontario Government',
    date: 'CURRENT',
    detail: 'Automated QA for 1,000+ Cognos BI reports per hour and built data workflows across Redshift, AWS Lambda, and Python.',
  },
  {
    title: 'Organizer, NRGHacks',
    date: '200+ ATTENDEES',
    detail: 'Helped lead a student hackathon and a 50+ member coding club, turning technical curiosity into shared projects.',
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
      const cellSize = innerWidth < 700 ? 17 : 22
      const columns = Math.ceil(innerWidth / cellSize)
      const rows = Math.ceil(innerHeight / cellSize)
      const cells = new Uint8Array(columns * rows)
      for (let i = 0; i < cells.length; i += 1) cells[i] = Math.random() < 0.14 ? 1 : 0
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
      if (runningRef.current && time - lastStep > 460) {
        state.cells = nextGeneration(state.cells, state.columns, state.rows)
        lastStep = time
      }
      context.clearRect(0, 0, innerWidth, innerHeight)
      context.fillStyle = '#3f5f50'
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
  const pageRef = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    const page = pageRef.current
    const card = cardRef.current
    const layers = card.querySelectorAll('[data-scroll-layer]')
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    let previous = page.scrollTop
    let settleTimer

    const addMomentum = () => {
      const current = page.scrollTop
      if (!reducedMotion) {
        const lag = scrollLag(current - previous)
        layers.forEach((layer, index) => layer.style.setProperty('--drag-y', `${lag * (0.8 + index * 0.5)}px`))
        clearTimeout(settleTimer)
        settleTimer = setTimeout(() => layers.forEach((layer) => layer.style.setProperty('--drag-y', '0px')), 90)
      }
      previous = current
    }

    page.addEventListener('scroll', addMomentum, { passive: true })
    return () => {
      page.removeEventListener('scroll', addMomentum)
      clearTimeout(settleTimer)
    }
  }, [])

  return (
    <main className="minimal-portfolio" ref={pageRef}>
      <LifeCanvas running={running} reset={reset} boardRef={boardRef} />
      <div className="life-shade" />

      <section className="portfolio-card" ref={cardRef}>
        <header data-scroll-layer>
          <div className="title-row">
            <h1>Logan Zhao</h1>
            <a className="saturn-link" href="/current" aria-label="Enter Logan's immersive space portfolio">
              <span className="saturn-ring" />
              <span className="saturn-planet" />
              <span className="saturn-label">enter orbit</span>
            </a>
          </div>
          <p className="intro">Building intelligent systems that feel alive.</p>
          <nav className="top-links" aria-label="Contact links">
            <a href="mailto:logan.zhao@uwaterloo.ca">EMAIL</a>
            <a href="https://github.com/LargoLardo" target="_blank" rel="noreferrer">GITHUB</a>
            <a href="https://www.linkedin.com/in/logan-zhao-328653232" target="_blank" rel="noreferrer">LINKEDIN</a>
          </nav>
        </header>

        <div className="section-row" data-scroll-layer>
          <h2>ABOUT</h2>
          <p className="about-copy">
            Systems Design Engineering student <a className="waterloo-inline" href="https://uwaterloo.ca/future-students/programs/systems-design-engineering">@
              <img className="waterloo-crest" src="/uwaterloo-crest-cropped.png" alt="" />
              <span className="waterloo-wordmark">uwaterloo</span>
            </a>, working across machine learning, creative tools, and interactive systems.
          </p>
        </div>

        <div className="section-row" data-scroll-layer>
          <h2>EXPERIENCE</h2>
          <div className="entries">
            {experience.map((item) => (
              <article className="entry" key={item.title}>
                <div className="entry-heading"><h3>{item.title}</h3><time>{item.date}</time></div>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="section-row" data-scroll-layer>
          <h2>PROJECTS</h2>
          <div className="entries">
            {projects.map((project, index) => (
              <a key={project.title} href={project.href} target="_blank" rel="noreferrer" className="entry project">
                {project.image
                  ? <img className="project-image" src={project.image} alt={`${project.title} preview`} />
                  : <div className="project-placeholder" aria-label={`${project.title} image placeholder`}>PROJECT IMAGE / 0{index + 1}</div>}
                <div className="entry-heading"><h3>{project.title}</h3><span aria-hidden="true">↗</span></div>
                <p>{project.detail}</p>
                <small>{project.stack}</small>
              </a>
            ))}
          </div>
        </div>

        <div className="section-row" data-scroll-layer>
          <h2>EDUCATION</h2>
          <div className="entries">
            <article className="entry">
              <div className="entry-heading"><h3>Systems Design Engineering, Waterloo</h3><time>2030</time></div>
              <p>B.A.Sc. candidate · 3.9 GPA · President’s Scholarship of Distinction.</p>
            </article>
          </div>
        </div>
      </section>

      <div className="life-controls" aria-label="Game of Life controls">
        <button type="button" onClick={() => setRunning((value) => !value)}>{running ? 'Pause' : 'Play'}</button>
        <button type="button" onClick={() => setReset((value) => value + 1)}>Randomize</button>
        <button type="button" onClick={() => boardRef.current?.cells.fill(0)}>Clear</button>
      </div>
    </main>
  )
}
