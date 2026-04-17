import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

/* ─── NOISE ─────────────────────────────────────────────────────────── */
const lrp = (a, b, t) => a + (b - a) * t
const hsh = (x, y) => { const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return h - Math.floor(h) }
function vn(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy)
  return lrp(lrp(hsh(ix, iy), hsh(ix + 1, iy), ux), lrp(hsh(ix, iy + 1), hsh(ix + 1, iy + 1), ux), uy)
}
function fbm(x, y, o = 5) {
  let v = 0, a = 0.5, f = 1, m = 0
  for (let i = 0; i < o; i++) { v += vn(x * f, y * f) * a; m += a; a *= 0.5; f *= 2.1 }
  return v / m
}

/* ─── TEXTURE GENERATORS ─────────────────────────────────────────────── */
function makePlanetTex(W = 512, H = 256) {
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d'), id = ctx.createImageData(W, H), d = id.data
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const th = (x / W) * Math.PI * 2, ph = (y / H) * Math.PI
      const sx = Math.sin(ph) * Math.cos(th), sy = Math.cos(ph), sz = Math.sin(ph) * Math.sin(th)
      const base = fbm(sx * 2.8 + 1.3, sy * 2.8 + sz * 2.5 + 0.7)
      const detail = fbm(sx * 9 + 5, sy * 9 + sz * 8 + 3) * 0.06
      const val = base + detail
      const n = (vn(x * 0.1, y * 0.1) - 0.5) * 20
      let r, g, b
      if (val < 0.34)      [r, g, b] = [8,  30, 65]
      else if (val < 0.41) [r, g, b] = [15, 52, 90]
      else if (val < 0.46) [r, g, b] = [22, 82, 108]
      else if (val < 0.50) [r, g, b] = [188, 160, 85]
      else if (val < 0.58) [r, g, b] = [50, 90, 40]
      else if (val < 0.66) [r, g, b] = [88, 118, 52]
      else if (val < 0.75) [r, g, b] = [125, 92, 52]
      else if (val < 0.85) [r, g, b] = [152, 125, 92]
      else                 [r, g, b] = [208, 198, 178]
      const i = (y * W + x) * 4
      d[i]   = Math.min(255, Math.max(0, r + n))
      d[i+1] = Math.min(255, Math.max(0, g + n * 0.55))
      d[i+2] = Math.min(255, Math.max(0, b + n * 0.2))
      d[i+3] = 255
    }
  }
  ctx.putImageData(id, 0, 0); return c
}

function makeCloudTex(W = 512, H = 256) {
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d'), id = ctx.createImageData(W, H), d = id.data
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const th = (x / W) * Math.PI * 2, ph = (y / H) * Math.PI
      const sx = Math.sin(ph) * Math.cos(th), sy = Math.cos(ph), sz = Math.sin(ph) * Math.sin(th)
      const h = fbm(sx * 4 + 7, sy * 4 + sz * 4 + 5, 4)
      const a = h > 0.57 ? Math.pow((h - 0.57) / 0.43, 0.6) * 210 : 0
      const i = (y * W + x) * 4
      d[i]=255; d[i+1]=255; d[i+2]=255; d[i+3]=a
    }
  }
  ctx.putImageData(id, 0, 0); return c
}

/* ─── SCENE DATA ─────────────────────────────────────────────────────── */
const PLANET_R = 2.2
const spt = (theta, phi, r = PLANET_R) => new THREE.Vector3(
  r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)
)

const NODES = [
  { id: 'about',      label: 'About',      theta: 0.4,   phi: 1.35, color: '#4fc3f7', hex: 0x4fc3f7 },
  { id: 'projects',   label: 'Projects',   theta: 1.85,  phi: 1.05, color: '#81c784', hex: 0x81c784 },
  { id: 'skills',     label: 'Skills',     theta: -0.85, phi: 1.55, color: '#ffb74d', hex: 0xffb74d },
  { id: 'experience', label: 'Experience', theta: 3.25,  phi: 1.15, color: '#f06292', hex: 0xf06292 },
  { id: 'contact',    label: 'Contact',    theta: -1.75, phi: 0.88, color: '#ce93d8', hex: 0xce93d8 },
]

const PROJECTS_DATA = [
  {
    title: 'TribeV2 Brain Encoder',
    desc: 'Multimodal pipeline predicting fMRI neural activations from audio/visual stimuli. Built on top of the TribeV2 architecture with custom extractors and forced-alignment audio preprocessing.',
    tags: ['PyTorch', 'fMRI', 'Transformers', 'CUDA'], color: '#81c784',
    detail: 'Handles full inference pipeline from raw media → feature extraction → brain-space prediction. VRAM-optimized for 16GB GPUs with lazy weight loading.',
  },
  {
    title: 'Evolutionary Text Optimizer',
    desc: 'Genetic algorithm loop using a local LLaMA 3.2 model (via Ollama) as a mutation operator. Scores text candidates by Pearson correlation against a target brainmap vector.',
    tags: ['Genetic Algorithm', 'LLaMA', 'Ollama', 'Python'], color: '#81c784',
    detail: 'Implements tournament selection, JSON-robust mutation parsing, and parallel fitness evaluation. Targets brain state optimization via neural encoding feedback.',
  },
  {
    title: 'CFR / MCCFR Poker Solver',
    desc: 'Full external sampling MCCFR implementation for Kuhn, Leduc, and Texas Hold\'em. Includes card abstraction, action abstraction, multi-street handling, and blueprint strategy.',
    tags: ['CFR', 'MCCFR', 'Game Theory', 'Python'], color: '#81c784',
    detail: 'Correctly implements CFR+ regret clipping with vanilla averaging. Verified convergence on Kuhn Poker. Subgame solving architecture for endgame refinement.',
  },
  {
    title: 'Neural Activation Visualizer',
    desc: 'Interactive 3D Plotly.js visualizations of neural brainmap activations. Surface-rendered cortical meshes with annotation layers and region highlighting.',
    tags: ['Plotly', 'WebGL', 'Neuroscience', 'JavaScript'], color: '#81c784',
    detail: 'Parses .npy activation arrays and maps them to cortical surface meshes. Supports comparison overlays, percentile-based colorscaling, and interactive ROI selection.',
  },
]

/* ─── UI COMPONENTS ─────────────────────────────────────────────────── */
function AboutPanel() {
  return (
    <div>
      <div style={{ fontSize: '2.8rem', marginBottom: '1rem', opacity: 0.85, letterSpacing: '-0.02em' }}>◉</div>
      <h1 style={{ margin: '0 0 0.25rem', fontSize: '2.2rem', fontWeight: 200, letterSpacing: '0.45em', color: 'white' }}>LOGAN</h1>
      <p style={{ color: '#4fc3f7', letterSpacing: '0.22em', marginBottom: '2rem', fontSize: '0.68rem', opacity: 0.75, margin: '0 0 1.8rem' }}>
        ML ENGINEER · CREATIVE DEVELOPER
      </p>
      <p style={{ lineHeight: 1.95, color: 'rgba(255,255,255,0.68)', marginBottom: '1.8rem', fontSize: '0.84rem' }}>
        Building at the intersection of machine learning, game theory, and creative systems.
        I explore the space where rigorous math meets emergent creativity — from brain encoding
        models to evolutionary text optimization and poker-solving AI.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {['Brain Encoding', 'Evolutionary Systems', 'Game Theory', 'Poker AI', 'Neuroscience', 'WSL2 / Linux'].map(t => (
          <span key={t} style={{ padding: '4px 11px', border: '1px solid rgba(79,195,247,0.35)', color: 'rgba(79,195,247,0.8)', fontSize: '0.65rem', letterSpacing: '0.07em' }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

function ProjectCard({ p, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        marginBottom: '10px', padding: '14px 16px', cursor: 'pointer',
        border: `1px solid rgba(129,199,132,${hov ? 0.4 : 0.13})`,
        background: `rgba(129,199,132,${hov ? 0.08 : 0.03})`,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ color: '#81c784', fontSize: '0.84rem', letterSpacing: '0.08em', marginBottom: '5px' }}>{p.title}</div>
      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.73rem', lineHeight: 1.65, marginBottom: '8px' }}>{p.desc}</div>
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {p.tags.map(t => <span key={t} style={{ fontSize: '0.6rem', padding: '2px 7px', background: 'rgba(129,199,132,0.1)', color: 'rgba(129,199,132,0.75)', letterSpacing: '0.04em' }}>{t}</span>)}
      </div>
      <div style={{ color: 'rgba(129,199,132,0.35)', fontSize: '0.6rem', marginTop: '8px', letterSpacing: '0.15em' }}>EXPLORE →</div>
    </div>
  )
}

function ProjectDetail({ project, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,4,20,0.96)',
      backdropFilter: 'blur(24px)', zIndex: 30,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '40px', animation: 'fadeScale 0.25s ease',
      fontFamily: "'Courier New', monospace",
    }}>
      <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.35)', cursor:'pointer', fontSize:'0.65rem', letterSpacing:'0.2em', padding:0, marginBottom:'2.5rem', textAlign:'left', fontFamily:'inherit', textTransform:'uppercase' }}>
        ← Back to Projects
      </button>
      <div style={{ color: '#81c784', fontSize: '1.2rem', letterSpacing: '0.12em', marginBottom: '0.8rem' }}>{project.title}</div>
      <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {project.tags.map(t => <span key={t} style={{ fontSize: '0.62rem', padding: '3px 9px', background: 'rgba(129,199,132,0.12)', color: '#81c784', letterSpacing: '0.04em' }}>{t}</span>)}
      </div>
      <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, fontSize: '0.82rem', marginBottom: '1.5rem' }}>{project.desc}</p>
      <div style={{ padding: '18px 20px', border: '1px solid rgba(129,199,132,0.18)', background: 'rgba(129,199,132,0.04)' }}>
        <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.6rem', letterSpacing: '0.25em', marginBottom: '10px', textTransform: 'uppercase' }}>Technical Notes</div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', lineHeight: 1.85, margin: 0 }}>{project.detail}</p>
      </div>
    </div>
  )
}

function ProjectsPanel() {
  const [active, setActive] = useState(null)
  return (
    <div style={{ position: 'relative' }}>
      <h2 style={{ margin: '0 0 1.4rem', fontWeight: 200, letterSpacing: '0.35em', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Projects</h2>
      {PROJECTS_DATA.map((p, i) => <ProjectCard key={i} p={p} onClick={() => setActive(p)} />)}
      {active && <ProjectDetail project={active} onClose={() => setActive(null)} />}
    </div>
  )
}

function SkillsPanel() {
  const cats = [
    { name: 'ML / AI', items: ['PyTorch', 'Transformers', 'CUDA', 'fMRI Analysis', 'Evolutionary Algorithms', 'CFR / MCCFR'] },
    { name: 'Languages', items: ['Python', 'JavaScript', 'TypeScript', 'C++', 'GLSL'] },
    { name: 'Tools & Systems', items: ['Linux / WSL2', 'Ollama', 'HuggingFace', 'Docker', 'Three.js', 'React', 'PokerKit'] },
    { name: 'Domain', items: ['Neuroscience', 'Poker AI', 'Optimization', 'Audio Processing', 'Game Theory'] },
  ]
  return (
    <div>
      <h2 style={{ margin: '0 0 1.5rem', fontWeight: 200, letterSpacing: '0.35em', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Skills</h2>
      {cats.map((cat, i) => (
        <div key={i} style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: '#ffb74d', fontSize: '0.62rem', letterSpacing: '0.28em', marginBottom: '9px', opacity: 0.75 }}>{cat.name}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {cat.items.map(s => <span key={s} style={{ padding: '4px 10px', border: '1px solid rgba(255,183,77,0.18)', color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>{s}</span>)}
          </div>
        </div>
      ))}
    </div>
  )
}

function ExperiencePanel() {
  const entries = [
    { role: 'ML Research Engineer', co: 'Independent', period: '2024–Present', desc: 'Brain encoding pipelines, evolutionary optimization systems, game-theoretic AI. Working across neuroscience datasets, LLM tooling, and competitive game solvers.' },
    { role: 'Software Developer', co: 'Previous Role', period: '2022–2024', desc: 'Full-stack systems, ML model deployment, and production architecture across multiple environments.' },
    { role: 'Open Source Contributor', co: 'Community', period: '2020–Present', desc: 'ML tooling, game theory implementations, and creative coding projects.' },
  ]
  return (
    <div>
      <h2 style={{ margin: '0 0 1.5rem', fontWeight: 200, letterSpacing: '0.35em', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Experience</h2>
      {entries.map((e, i) => (
        <div key={i} style={{ marginBottom: '1.8rem', paddingLeft: '14px', borderLeft: '1px solid rgba(240,98,146,0.3)' }}>
          <div style={{ color: '#f06292', fontSize: '0.86rem', letterSpacing: '0.07em', marginBottom: '3px' }}>{e.role}</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', marginBottom: '8px', letterSpacing: '0.04em' }}>{e.co} · {e.period}</div>
          <div style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.77rem', lineHeight: 1.8 }}>{e.desc}</div>
        </div>
      ))}
    </div>
  )
}

function ContactPanel() {
  return (
    <div>
      <h2 style={{ margin: '0 0 1.5rem', fontWeight: 200, letterSpacing: '0.35em', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Contact</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', lineHeight: 1.9, marginBottom: '2.5rem' }}>
        Interested in ML research, creative collaboration,<br />or anything at the edge of possibility?
      </p>
      {[
        { label: 'Email',    val: 'hello@logan.dev',          href: 'mailto:hello@logan.dev' },
        { label: 'GitHub',   val: 'github.com/logan',          href: '#' },
        { label: 'LinkedIn', val: 'linkedin.com/in/logan',     href: '#' },
      ].map((c, i) => (
        <div key={i} style={{ marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.6rem', letterSpacing: '0.22em', width: '72px', textTransform: 'uppercase' }}>{c.label}</span>
          <a href={c.href} style={{ color: '#ce93d8', textDecoration: 'none', fontSize: '0.84rem', letterSpacing: '0.02em' }}>{c.val}</a>
        </div>
      ))}
    </div>
  )
}

const PANEL_MAP = { about: AboutPanel, projects: ProjectsPanel, skills: SkillsPanel, experience: ExperiencePanel, contact: ContactPanel }

function NodePanel({ nodeId, color }) {
  const Content = PANEL_MAP[nodeId]
  return (
    <div style={{
      position: 'absolute', top: 0, right: 0,
      width: 'min(440px, 90vw)', height: '100%',
      background: 'rgba(1,5,22,0.9)', backdropFilter: 'blur(18px)',
      borderLeft: `1px solid ${color}28`,
      padding: '80px 30px 40px', overflowY: 'auto',
      color: 'white', fontFamily: "'Courier New', monospace",
      animation: 'slideIn 0.38s cubic-bezier(0.16,1,0.3,1)',
      zIndex: 10, boxSizing: 'border-box',
    }}>
      {Content && <Content />}
    </div>
  )
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────── */
export default function Portfolio() {
  const mountRef = useRef(null)
  const ctrl    = useRef({})
  const [activeNode, setActiveNode] = useState(null)
  const [hovered,    setHovered]    = useState(null)
  const [mode,       setMode]       = useState('orbit')
  const [hint,       setHint]       = useState('drag to orbit  ·  click nodes to explore')

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(el.clientWidth, el.clientHeight)
    el.appendChild(renderer.domElement)

    /* ── Scene ── */
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000510)

    /* ── Camera ── */
    const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 1000)
    camera.position.set(0, 1.5, 7)
    camera.lookAt(0, 0, 0)

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0x18264a, 1.3))
    const dirLight = new THREE.DirectionalLight(0xfff3e0, 2.4)
    dirLight.position.set(50, 20, 30); scene.add(dirLight)
    // Subtle fill from below
    const fillLight = new THREE.DirectionalLight(0x2255aa, 0.3)
    fillLight.position.set(-30, -20, -20); scene.add(fillLight)

    /* ── Starfield ── */
    {
      const N = 4500
      const pos = new Float32Array(N * 3), col = new Float32Array(N * 3)
      for (let i = 0; i < N; i++) {
        const t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1)
        const r = 180 + Math.random() * 100
        pos[i*3]   = r * Math.sin(p) * Math.cos(t)
        pos[i*3+1] = r * Math.cos(p)
        pos[i*3+2] = r * Math.sin(p) * Math.sin(t)
        const c = 0.65 + Math.random() * 0.35
        const warm = Math.random() > 0.72
        col[i*3]   = warm ? c        : c * 0.82
        col[i*3+1] = c * 0.88
        col[i*3+2] = warm ? c * 0.72 : c
      }
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      g.setAttribute('color',    new THREE.BufferAttribute(col, 3))
      scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.38, vertexColors: true, sizeAttenuation: true })))
    }

    /* ── Sun ── */
    {
      const sunPos = new THREE.Vector3(50, 20, 30)
      const sunMesh = new THREE.Mesh(
        new THREE.SphereGeometry(7, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xfffde7 })
      )
      sunMesh.position.copy(sunPos)
      scene.add(sunMesh)
      // Glow halo
      sunMesh.add(new THREE.Mesh(
        new THREE.SphereGeometry(14, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.09, side: THREE.BackSide })
      ))
      // Outer diffuse glow
      sunMesh.add(new THREE.Mesh(
        new THREE.SphereGeometry(22, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.04, side: THREE.BackSide })
      ))
    }

    /* ── Planet group ── */
    const pGroup = new THREE.Group()
    scene.add(pGroup)

    // Planet surface
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(PLANET_R, 64, 64),
      new THREE.MeshPhongMaterial({ map: new THREE.CanvasTexture(makePlanetTex()), shininess: 7, specular: new THREE.Color(0x111122) })
    )
    pGroup.add(planet)

    // Atmosphere (rim shader)
    pGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(PLANET_R * 1.065, 32, 32),
      new THREE.ShaderMaterial({
        uniforms: { sunDir: { value: new THREE.Vector3(50, 20, 30).normalize() } },
        vertexShader: `
          varying vec3 vN, vP;
          void main() {
            vN = normalize(normalMatrix * normal);
            vP = (modelViewMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          uniform vec3 sunDir;
          varying vec3 vN, vP;
          void main() {
            float rim = pow(1.0 - abs(dot(normalize(-vP), vN)), 3.8);
            float lit = max(0.0, dot(vN, sunDir)) * 0.3;
            vec3 col = mix(vec3(0.10, 0.40, 0.95), vec3(0.42, 0.70, 1.0), lit);
            gl_FragColor = vec4(col, rim * 0.62);
          }`,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      })
    ))

    // Cloud layer
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(PLANET_R * 1.018, 48, 48),
      new THREE.MeshPhongMaterial({
        map: new THREE.CanvasTexture(makeCloudTex()),
        transparent: true, opacity: 0.8, depthWrite: false,
      })
    )
    pGroup.add(clouds)

    /* ── Node markers ── */
    const nodeMeshes = [], nodeRings = [], nodeGlows = []
    NODES.forEach((nd, idx) => {
      const pos = spt(nd.theta, nd.phi, PLANET_R + 0.18)

      // Core dot
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 16, 16),
        new THREE.MeshBasicMaterial({ color: nd.hex })
      )
      dot.position.copy(pos)
      dot.userData = { nodeIdx: idx }
      pGroup.add(dot); nodeMeshes.push(dot)

      // Ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.09, 0.13, 32),
        new THREE.MeshBasicMaterial({ color: nd.hex, side: THREE.DoubleSide, transparent: true, opacity: 0.4 })
      )
      ring.position.copy(pos)
      ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize())
      pGroup.add(ring); nodeRings.push(ring)

      // Soft glow sphere
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 12),
        new THREE.MeshBasicMaterial({ color: nd.hex, transparent: true, opacity: 0.08 })
      )
      glow.position.copy(pos)
      pGroup.add(glow); nodeGlows.push(glow)
    })

    /* ── Camera state machine ── */
    let camMode = 'orbit'
    const orb = { r: 7, theta: 0, phi: Math.PI / 2 - 0.2 }
    let animT = 0
    let fromPos = null, fromQ = null, toPos = null, toQ = null
    let zoomNodeIdx = -1

    /* ── Free look ── */
    let flYaw = 0, flPitch = 0, isLocked = false

    const onLockChange = () => {
      isLocked = !!document.pointerLockElement
      if (!isLocked && camMode === 'freelook') {
        camMode = 'orbit'
        setMode('orbit')
        setHint('drag to orbit  ·  click nodes to explore')
      }
    }
    const onLockedMove = e => {
      if (!isLocked || camMode !== 'freelook') return
      flYaw   -= e.movementX * 0.0022
      flPitch  = Math.max(-1.52, Math.min(1.52, flPitch - e.movementY * 0.0022))
    }
    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('mousemove', onLockedMove)

    /* ── Orbit mouse ── */
    let dragging = false, mdPt = null, lastPt = null
    const ray = new THREE.Raycaster(), m2d = new THREE.Vector2()
    const ndc = e => {
      const r = el.getBoundingClientRect()
      m2d.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    }

    const onDown = e => { dragging = true; mdPt = { x: e.clientX, y: e.clientY }; lastPt = { ...mdPt }; el.style.cursor = 'grabbing' }
    const onMove = e => {
      if (!dragging) {
        if (camMode !== 'orbit') return
        ndc(e); ray.setFromCamera(m2d, camera)
        const hits = ray.intersectObjects(nodeMeshes)
        setHovered(hits.length ? hits[0].object.userData.nodeIdx : null)
        el.style.cursor = hits.length ? 'pointer' : 'grab'
        return
      }
      const dx = e.clientX - lastPt.x, dy = e.clientY - lastPt.y
      lastPt = { x: e.clientX, y: e.clientY }
      if (camMode === 'orbit') {
        orb.theta -= dx * 0.007
        orb.phi = Math.max(0.12, Math.min(Math.PI - 0.12, orb.phi + dy * 0.007))
      }
    }
    const onUp = e => {
      const dist = Math.hypot(e.clientX - mdPt.x, e.clientY - mdPt.y)
      dragging = false; el.style.cursor = 'grab'
      if (dist < 5 && camMode === 'orbit') {
        ndc(e); ray.setFromCamera(m2d, camera)
        const hits = ray.intersectObjects(nodeMeshes)
        if (hits.length) zoomTo(hits[0].object.userData.nodeIdx)
      }
    }

    function zoomTo(idx) {
      const dir = nodeMeshes[idx].position.clone().normalize()
      toPos = dir.multiplyScalar(4.8)
      fromPos = camera.position.clone(); fromQ = camera.quaternion.clone()
      const tc = new THREE.PerspectiveCamera()
      tc.position.copy(toPos); tc.lookAt(0, 0, 0)
      toQ = tc.quaternion.clone()
      camMode = 'zooming'; animT = 0; zoomNodeIdx = idx
      setHovered(null); el.style.cursor = 'default'
    }

    ctrl.current.goBack = () => {
      if (camMode !== 'inspect') return
      fromPos = camera.position.clone(); fromQ = camera.quaternion.clone()
      toPos = new THREE.Vector3(
        orb.r * Math.sin(orb.phi) * Math.cos(orb.theta),
        orb.r * Math.cos(orb.phi),
        orb.r * Math.sin(orb.phi) * Math.sin(orb.theta)
      )
      const tc = new THREE.PerspectiveCamera()
      tc.position.copy(toPos); tc.lookAt(0, 0, 0)
      toQ = tc.quaternion.clone()
      camMode = 'returning'; animT = 0
      setActiveNode(null)
    }

    ctrl.current.enterFreeLook = () => {
      el.requestPointerLock().catch(() => {
        // Fallback if pointer lock is blocked (e.g. iframe sandbox)
        // Just note it in hint
        setHint('Pointer lock unavailable in this context')
        setTimeout(() => setHint('drag to orbit  ·  click nodes to explore'), 2500)
      })
      camMode = 'freelook'
      flYaw   = orb.theta + Math.PI
      flPitch = -orb.phi + Math.PI / 2
      setMode('freelook'); setHint('')
    }

    el.addEventListener('mousedown', onDown)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseup',   onUp)

    const obs = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight
      camera.aspect = w / h; camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    obs.observe(el)

    /* ── Animation loop ── */
    let raf, clk = 0
    const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

    function tick() {
      raf = requestAnimationFrame(tick)
      clk += 0.016

      // Slow cloud drift
      clouds.rotation.y += 0.00016

      // Node pulse animations
      nodeMeshes.forEach((m, i) => {
        const s = 1 + Math.sin(clk * 2.1 + i * 1.35) * 0.28
        m.scale.setScalar(s)
        const rs = 1 + Math.sin(clk * 1.55 + i * 0.85) * 0.15
        nodeRings[i].scale.setScalar(rs)
        nodeRings[i].material.opacity = 0.22 + Math.sin(clk * 1.9 + i * 0.7) * 0.22
        nodeGlows[i].material.opacity = 0.05 + Math.sin(clk * 1.4 + i) * 0.04
      })

      // Camera modes
      if (camMode === 'orbit') {
        camera.position.set(
          orb.r * Math.sin(orb.phi) * Math.cos(orb.theta),
          orb.r * Math.cos(orb.phi),
          orb.r * Math.sin(orb.phi) * Math.sin(orb.theta)
        )
        camera.lookAt(0, 0, 0)

      } else if (camMode === 'zooming' || camMode === 'returning') {
        animT = Math.min(1, animT + 0.019)
        const et = ease(animT)
        camera.position.lerpVectors(fromPos, toPos, et)
        camera.quaternion.slerpQuaternions(fromQ, toQ, et)
        if (animT >= 1) {
          if (camMode === 'zooming') {
            camMode = 'inspect'
            setMode('inspect')
            setActiveNode(zoomNodeIdx)
            setHint('')
          } else {
            camMode = 'orbit'
            setMode('orbit')
            setHint('drag to orbit  ·  click nodes to explore')
          }
        }

      } else if (camMode === 'freelook') {
        const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), flYaw)
        const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), flPitch)
        camera.quaternion.multiplyQuaternions(qY, qX)
      }

      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      obs.disconnect()
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseup',   onUp)
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('mousemove', onLockedMove)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  /* ── JSX ── */
  const ff = "'Courier New', monospace"

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', background: '#000510', fontFamily: ff }}>

      {/* Three.js canvas mount */}
      <div ref={mountRef} style={{ position: 'absolute', inset: 0, cursor: 'grab' }} />

      {/* Top-left title */}
      {mode === 'orbit' && (
        <div style={{ position: 'absolute', top: 28, left: 32, pointerEvents: 'none', zIndex: 5 }}>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem', letterSpacing: '0.45em', textTransform: 'uppercase' }}>
            Logan
          </span>
          <span style={{ color: '#4fc3f7', opacity: 0.55, fontSize: '0.78rem', letterSpacing: '0.45em' }}>
            {' '}/ Portfolio
          </span>
        </div>
      )}

      {/* Free look button */}
      {mode === 'orbit' && (
        <button
          onClick={() => ctrl.current.enterFreeLook?.()}
          style={{
            position: 'absolute', top: 24, right: 32, zIndex: 5,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.45)', padding: '7px 15px',
            cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.22em',
            textTransform: 'uppercase', fontFamily: ff, transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
        >
          ↗ Free Look
        </button>
      )}

      {/* Back button */}
      {mode === 'inspect' && (
        <button
          onClick={() => ctrl.current.goBack?.()}
          style={{
            position: 'absolute', top: 24, left: 32, zIndex: 11,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.45)', padding: '7px 15px',
            cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.22em',
            textTransform: 'uppercase', fontFamily: ff, transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
        >
          ← Back
        </button>
      )}

      {/* Free look mode label */}
      {mode === 'freelook' && (
        <div style={{ position: 'absolute', top: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 5, pointerEvents: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.62rem', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
          Free Look  ·  ESC to return
        </div>
      )}

      {/* Bottom hint */}
      {hint && mode !== 'freelook' && (
        <div style={{ position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 5, pointerEvents: 'none', color: 'rgba(255,255,255,0.28)', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          {hint}
        </div>
      )}

      {/* Hovered node label */}
      {hovered !== null && mode === 'orbit' && (
        <div style={{ position: 'absolute', bottom: 62, left: '50%', transform: 'translateX(-50%)', zIndex: 5, pointerEvents: 'none', color: NODES[hovered].color, fontSize: '0.72rem', letterSpacing: '0.3em', textTransform: 'uppercase', whiteSpace: 'nowrap', animation: 'fadeUp 0.15s ease' }}>
          ▶ {NODES[hovered].label}
        </div>
      )}

      {/* Node legend (orbit mode) */}
      {mode === 'orbit' && (
        <div style={{ position: 'absolute', bottom: 26, right: 32, zIndex: 5, display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {NODES.map(n => (
            <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: n.color, boxShadow: `0 0 4px ${n.color}` }} />
              <span style={{ fontSize: '0.56rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase' }}>{n.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Content panel */}
      {mode === 'inspect' && activeNode !== null && (
        <NodePanel nodeId={NODES[activeNode].id} color={NODES[activeNode].color} />
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);   }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
      `}</style>
    </div>
  )
}