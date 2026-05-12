import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const PLAYER_RADIUS = 5.4
const CAMPFIRE_RADIUS = 1.05
const EYE_HEIGHT = 1.54
const UP = new THREE.Vector3(0, 1, 0)

const DISCOVERIES = [
  {
    id: 'about',
    signal: 'traveler signal',
    world: 'The Quiet One',
    title: 'Logan Zhao',
    subtitle: 'Systems Design Engineering student at the University of Waterloo',
    color: '#7bdff2',
    hex: 0x7bdff2,
    position: [-34, 30, -66],
    radius: 3.15,
    palette: ['#22314f', '#476d89', '#9ed4d7', '#d8b56c'],
    planetStyle: { bands: true, spots: 3 },
    body: [
      'I am a Waterloo Systems Design Engineering student aiming toward machine learning, applied AI, and intelligent tools that turn messy inputs into useful systems.',
      'The thread through my work is creation through algorithmic design: reconstruction pipelines, game-playing agents, evolutionary search, and interfaces that make complex systems feel explorable.',
    ],
    tags: ['Machine learning', 'Algorithmic design', 'Creative systems', 'Systems engineering'],
  },
  {
    id: 'experience',
    signal: 'public sector relay',
    world: 'Blue Giant',
    title: 'Experience',
    subtitle: 'Application Programmer, Ontario Government MPBSDP',
    color: '#8ef6a4',
    hex: 0x8ef6a4,
    position: [68, 38, -24],
    radius: 2.85,
    palette: ['#071c3d', '#115d7e', '#5fb7a1', '#e7efe2'],
    planetStyle: { rings: true, bands: true, ringTilt: 0.42 },
    body: [
      'Built and supported automated QA tooling for Cognos BI reports using the IBM Cognos API and Playwright, helping validate 1,000+ reports per hour and protect reporting integrity.',
      'Worked with Redshift, DBeaver SQL, AWS Lambda ETL, audit logs, and Python Excel automation to clean, transform, monitor, and prepare analytics data across large BI workflows.',
      'Previously organized NRGHacks for 200+ attendees, led a 50+ member coding club, and designed a Rotary club website that helped increase membership.',
    ],
    tags: ['Playwright', 'Cognos API', 'Redshift', 'AWS Lambda', 'Python', 'Leadership'],
  },
  {
    id: 'reminiscence',
    signal: 'memory reconstruction',
    world: 'Amber Seed',
    title: 'Reminiscence',
    subtitle: 'iPhone video to VR-ready Gaussian splats',
    color: '#ffbd6b',
    hex: 0xffbd6b,
    position: [46, 54, 54],
    radius: 2.5,
    palette: ['#1d1609', '#7b3f1d', '#e39b3f', '#f6df9c'],
    planetStyle: { spots: 7, cracked: true },
    body: [
      'Engineered an end-to-end app pipeline that converts iPhone videos into VR-ready Gaussian splats, coordinating a 9-stage workflow across SwiftUI, FastAPI, COLMAP, FastGS, and Unity.',
      'Optimized reconstruction to run in under 2 minutes by streamlining frame extraction, sparse reconstruction, Gaussian splat training, and Unity prefab generation through Python backend automation.',
    ],
    tags: ['PyTorch', 'Swift', 'Unity/C#', 'OpenXR', 'FastAPI', 'github.com/LargoLardo/reminiscence'],
  },
  {
    id: 'synesthesia',
    signal: 'cross-media resonance',
    world: 'Red Hollow',
    title: 'Synthetic Synesthesia',
    subtitle: 'Full-stack cross-media vibe translation',
    color: '#ff7a90',
    hex: 0xff7a90,
    position: [-48, 34, 62],
    radius: 2.7,
    palette: ['#250c17', '#6f1e30', '#c84a51', '#f4b184'],
    planetStyle: { rings: true, spots: 4, ringTilt: -0.24 },
    body: [
      'Built a full-stack cross-media app that encodes an input emotional signature, generates a matching output in another medium, and reached up to 95% emotional-response alignment using TribeV2 scoring.',
      'Improved output quality and cut processing time by owning DataFrame construction in the TribeV2 pipeline and using an evolutionary algorithm to iteratively evolve final outputs.',
    ],
    tags: ['PyTorch', 'Pandas', 'MongoDB', 'React', 'FastAPI', 'github.com/LargoLardo/synthetic_synesthesia'],
  },
  {
    id: 'chess',
    signal: 'search tree beacon',
    world: 'Glass Archive',
    title: 'RL/SL Chess Engine',
    subtitle: 'Policy/value network with MCTS/PUCT search',
    color: '#c69cff',
    hex: 0xc69cff,
    position: [-74, 44, -12],
    radius: 2.35,
    palette: ['#151023', '#4f3c78', '#9f7bd5', '#e1d5ff'],
    planetStyle: { bands: true, spots: 5 },
    body: [
      'Architected a full-stack RL/SL hybrid chess engine from scratch with a policy/value network and MCTS/PUCT move search, reaching expert-level 2000 Elo strength through self-play.',
      'Improved runtime search speed by more than 8x with lazy inference batching, transposition tables, and cached board encodings for deeper lookahead under fixed move-time budgets.',
    ],
    tags: ['PyTorch', 'MCTS', 'React', 'Vite', 'Flask', 'github.com/LargoLardo/lard_plays_chess'],
  },
  {
    id: 'poker',
    signal: 'recursive orbit',
    world: 'Home Frequency',
    title: "Heads-up Hold'em Poker AI",
    subtitle: 'External-sampling MCCFR solver for no-limit poker',
    color: '#f2f59f',
    hex: 0xf2f59f,
    visibilityBoost: 1.2,
    position: [4, 66, -78],
    radius: 2.2,
    palette: ['#19180d', '#55501d', '#b8a94a', '#fff6b0'],
    planetStyle: { rings: true, ringTilt: 0.78 },
    body: [
      "Built a heads-up no-limit Texas Hold'em AI and solver that trained a policy capable of winning more than 10BB/hr against basic heuristics using external-sampling MCCFR with regret matching.",
      'Engineered card abstraction through bucketing with Monte Carlo equity and potential calculations, reaching roughly 80% similarity to known solvers.',
      'Increased training speed by more than 10x on an 8-core CPU with a multiprocessing chunk-and-merge traversal pipeline.',
    ],
    tags: ['NumPy', 'MCCFR', 'Plotly', 'React', 'Flask', 'github.com/LargoLardo/lard_plays_poker'],
  },
  {
    id: 'education',
    signal: 'waterloo transmission',
    world: 'Scholar Moon',
    title: 'Education',
    subtitle: 'University of Waterloo, Systems Design Engineering',
    color: '#9ee493',
    hex: 0x9ee493,
    position: [-26, 78, 50],
    radius: 2.3,
    palette: ['#0b2115', '#245d3b', '#72b36e', '#e2ffd4'],
    planetStyle: { rings: true, bands: true, ringTilt: -0.58 },
    body: [
      'Bachelor of Applied Science in Systems Design Engineering at the University of Waterloo, expected 2030, with a 3.9 GPA.',
      "Recipient of the W.J. Beynon Memorial Entrance Scholarship and President's Scholarship of Distinction.",
    ],
    tags: ['Systems Design Engineering', '3.9 GPA', 'Waterloo', 'Scholarships'],
  },
  {
    id: 'hobbies',
    signal: 'campfire frequency',
    world: 'Hearth Planet',
    title: 'Hobbies',
    subtitle: 'Games, movement, and worlds that make curiosity feel physical',
    color: '#ffcf87',
    hex: 0xffcf87,
    position: [82, 24, 44],
    radius: 2.55,
    palette: ['#261407', '#70411e', '#d1883e', '#ffe0a3'],
    planetStyle: { bands: true, spots: 6 },
    body: [
      'Outside of building things, I enjoy badminton, chess, poker, ultimate frisbee, and games that reward exploration and patient systems thinking.',
      'Outer Wilds is one of the major inspirations for this portfolio: the campfire, signalscope, mystery-first navigation, and feeling of looking into a huge unknown space all come from that love.',
      'Reach me through email, LinkedIn, or GitHub if you want to talk ML, creative tools, game AI, or strange interactive projects.',
    ],
    tags: ['Badminton', 'Chess', 'Poker', 'Ultimate frisbee', 'Outer Wilds', 'logan.zhao@uwaterloo.ca', 'github.com/LargoLardo', 'linkedin.com/in/logan-zhao-328653232'],
  },
]

const DISCOVERY_BY_ID = Object.fromEntries(DISCOVERIES.map((item) => [item.id, item]))

function seededRandom(seed) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

const random = seededRandom(37)
const terrainCraters = Array.from({ length: 34 }, () => ({
  x: (random() - 0.5) * 92,
  z: (random() - 0.5) * 92,
  radius: 1.7 + random() * 6.5,
  depth: 0.08 + random() * 0.45,
}))

function smoothstep(edge0, edge1, value) {
  const t = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

function terrainHeight(x, z) {
  const ripples = Math.sin(x * 0.33 + z * 0.18) * 0.045 + Math.sin(z * 0.47) * 0.035
  let h = ripples

  for (const crater of terrainCraters) {
    const dx = x - crater.x
    const dz = z - crater.z
    const dist = Math.sqrt(dx * dx + dz * dz)

    if (dist < crater.radius) {
      const t = dist / crater.radius
      h -= Math.cos(t * Math.PI * 0.5) * crater.depth
      h += Math.exp(-Math.pow((t - 0.86) * 6, 2)) * crater.depth * 0.42
    }
  }

  const campFlatten = 1 - smoothstep(1.2, 6.2, Math.sqrt(x * x + z * z))
  return THREE.MathUtils.lerp(h, 0, campFlatten)
}

function makeMoonTexture(size = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const image = ctx.createImageData(size, size)
  const data = image.data
  const rand = seededRandom(91)

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const grain = rand() * 26
      const wave = Math.sin(x * 0.057) * 8 + Math.sin((x + y) * 0.018) * 10
      const dust = 108 + grain + wave
      const idx = (y * size + x) * 4
      data[idx] = dust * 0.86
      data[idx + 1] = dust * 0.84
      data[idx + 2] = dust * 0.78
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(image, 0, 0)
  return canvas
}

function makePlanetTexture(palette, seed, style = {}, width = 512, height = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, width, height)

  palette.forEach((color, index) => {
    gradient.addColorStop(index / Math.max(1, palette.length - 1), color)
  })

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  if (style.bands) {
    for (let y = 0; y < height; y += 1) {
      const wave = Math.sin(y * 0.045 + seed) * 0.5 + Math.sin(y * 0.12) * 0.25
      const alpha = 0.06 + Math.abs(wave) * 0.14
      ctx.fillStyle = wave > 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`
      ctx.fillRect(0, y, width, 1)
    }
  }

  ctx.globalCompositeOperation = 'multiply'

  const rand = seededRandom(seed)
  for (let i = 0; i < 180; i += 1) {
    const y = rand() * height
    const h = 3 + rand() * 22
    const alpha = 0.045 + rand() * 0.15
    ctx.fillStyle = `rgba(${60 + rand() * 120}, ${70 + rand() * 120}, ${80 + rand() * 120}, ${alpha})`
    ctx.fillRect(0, y, width, h)
  }

  if (style.cracked) {
    ctx.globalCompositeOperation = 'screen'
    ctx.strokeStyle = 'rgba(255, 202, 126, 0.28)'
    ctx.lineWidth = 2

    for (let i = 0; i < 12; i += 1) {
      let x = rand() * width
      let y = rand() * height
      ctx.beginPath()
      ctx.moveTo(x, y)

      for (let j = 0; j < 6; j += 1) {
        x += (rand() - 0.5) * 56
        y += (rand() - 0.5) * 32
        ctx.lineTo(x, y)
      }

      ctx.stroke()
    }
  }

  ctx.globalCompositeOperation = 'screen'
  for (let i = 0; i < (style.spots ?? 0); i += 1) {
    const x = rand() * width
    const y = height * (0.24 + rand() * 0.52)
    const rx = 18 + rand() * 52
    const ry = 9 + rand() * 24
    const spot = ctx.createRadialGradient(x, y, 0, x, y, rx)
    spot.addColorStop(0, 'rgba(255,255,255,0.28)')
    spot.addColorStop(0.45, 'rgba(255,255,255,0.08)')
    spot.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(1, ry / rx)
    ctx.fillStyle = spot
    ctx.beginPath()
    ctx.arc(0, 0, rx, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  for (let i = 0; i < 36; i += 1) {
    const x = rand() * width
    const y = rand() * height
    const r = 8 + rand() * 44
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r)
    glow.addColorStop(0, 'rgba(255,255,255,0.16)')
    glow.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalCompositeOperation = 'source-over'
  return canvas
}

function shortestAngleDelta(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from))
}

function disposeScene(scene, renderer) {
  scene.traverse((object) => {
    if (object.geometry) {
      object.geometry.dispose()
    }

    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.filter(Boolean).forEach((material) => {
      Object.keys(material).forEach((key) => {
        const value = material[key]
        if (value && typeof value.dispose === 'function') {
          value.dispose()
        }
      })
      material.dispose()
    })
  })

  renderer.dispose()
}

function Panel({ discovery, onClose }) {
  if (!discovery) return null

  return (
    <aside className="discovery-panel" style={{ '--accent': discovery.color }}>
      <button className="panel-close" type="button" onClick={onClose} aria-label="Close discovery">
        x
      </button>
      <p className="panel-signal">{discovery.signal}</p>
      <h1>{discovery.title}</h1>
      <p className="panel-subtitle">{discovery.subtitle}</p>
      <div className="panel-body">
        {discovery.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="tag-list">
        {discovery.tags.map((tag) => {
          const href =
            tag.includes('@') ? `mailto:${tag}` : tag.includes('.com') ? `https://${tag}` : null

          return href ? (
            <a key={tag} href={href} target={tag.includes('@') ? undefined : '_blank'} rel="noreferrer">
              {tag}
            </a>
          ) : (
            <span key={tag}>{tag}</span>
          )
        })}
      </div>
    </aside>
  )
}

function PortfolioSidebar({ open, activeId, onSelect, onClose }) {
  return (
    <aside className={`section-sidebar ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="section-sidebar-header">
        <div>
          <span>DIRECTORY</span>
          <strong>Portfolio Sections</strong>
        </div>
        <button type="button" onClick={onClose} aria-label="Close sections">
          x
        </button>
      </div>

      <div className="section-list">
        {DISCOVERIES.map((discovery) => (
          <button
            className={activeId === discovery.id ? 'is-active' : ''}
            type="button"
            key={discovery.id}
            onClick={() => onSelect(discovery.id)}
            style={{ '--accent': discovery.color }}
          >
            <span>{discovery.world}</span>
            <strong>{discovery.title}</strong>
            <small>{discovery.subtitle}</small>
          </button>
        ))}
      </div>
    </aside>
  )
}

export default function App() {
  const mountRef = useRef(null)
  const scopeActiveRef = useRef(false)
  const discoveredIdsRef = useRef(new Set())
  const discoveryEventsRef = useRef([])
  const cameraTargetRef = useRef(null)
  const [scopeActiveState, setScopeActiveState] = useState(false)
  const [scopeProximity, setScopeProximity] = useState(0)
  const scopeProximityRef = useRef(0)
  const [focusedTarget, setFocusedTarget] = useState(null)
  const [activeDiscovery, setActiveDiscovery] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ignited, setIgnited] = useState(false)

  const activeData = useMemo(() => DISCOVERY_BY_ID[activeDiscovery] ?? null, [activeDiscovery])
  const focusedData = useMemo(() => DISCOVERY_BY_ID[focusedTarget] ?? null, [focusedTarget])

  const setScopeActive = useCallback((value) => {
    scopeActiveRef.current = value
    setScopeActiveState(value)
  }, [])

  const revealDiscovery = useCallback((id) => {
    if (!id) return

    const firstDiscovery = !discoveredIdsRef.current.has(id)
    if (firstDiscovery) {
      discoveredIdsRef.current.add(id)
      discoveryEventsRef.current.push({ id, firstDiscovery: true })
    }
    setActiveDiscovery(id)
  }, [])

  const selectDiscovery = useCallback(
    (id) => {
      cameraTargetRef.current = id
      revealDiscovery(id)
    },
    [revealDiscovery],
  )

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.FogExp2(0x020202, 0.018)

    const camera = new THREE.PerspectiveCamera(68, mount.clientWidth / mount.clientHeight, 0.05, 220)
    camera.position.set(0, EYE_HEIGHT, 4.15)

    const ambient = new THREE.HemisphereLight(0x090b12, 0x0a0704, 0.04)
    scene.add(ambient)

    const moonMaterial = new THREE.MeshStandardMaterial({
      map: new THREE.CanvasTexture(makeMoonTexture()),
      color: 0x9a948a,
      roughness: 1,
      metalness: 0,
    })
    moonMaterial.map.wrapS = THREE.RepeatWrapping
    moonMaterial.map.wrapT = THREE.RepeatWrapping
    moonMaterial.map.repeat.set(11, 11)

    const groundGeometry = new THREE.PlaneGeometry(120, 120, 176, 176)
    const groundPositions = groundGeometry.attributes.position
    for (let i = 0; i < groundPositions.count; i += 1) {
      const x = groundPositions.getX(i)
      const z = groundPositions.getY(i)
      groundPositions.setZ(i, terrainHeight(x, z))
    }
    groundGeometry.computeVertexNormals()

    const ground = new THREE.Mesh(groundGeometry, moonMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const rocks = new THREE.Group()
    const rockGeometry = new THREE.DodecahedronGeometry(0.24, 0)
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x69645c, roughness: 0.96 })
    const rockRand = seededRandom(244)

    for (let i = 0; i < 82; i += 1) {
      const angle = rockRand() * Math.PI * 2
      const radius = 4.2 + rockRand() * 44
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      if (Math.sqrt(x * x + z * z) < 7.2) continue

      const rock = new THREE.Mesh(rockGeometry, rockMaterial)
      const scale = 0.32 + rockRand() * 1.4
      rock.position.set(x, terrainHeight(x, z) + scale * 0.12, z)
      rock.rotation.set(rockRand() * Math.PI, rockRand() * Math.PI, rockRand() * Math.PI)
      rock.scale.set(scale * 1.25, scale * 0.7, scale)
      rock.castShadow = true
      rock.receiveShadow = true
      rocks.add(rock)
    }

    scene.add(rocks)

    const starGeometry = new THREE.BufferGeometry()
    const starCount = 800
    const starRadiusConst = 70
    const starPositions = new Float32Array(starCount * 3)
    const starColors = new Float32Array(starCount * 3)
    const starRand = seededRandom(612)

    for (let i = 0; i < starCount; i += 1) {
      const theta = starRand() * Math.PI * 2
      const phi = Math.acos(THREE.MathUtils.lerp(0.015, 0.985, starRand()))
      const radius = starRadiusConst + starRand() * starRadiusConst / 2
      const y = Math.cos(phi) * radius
      const x = Math.sin(phi) * Math.cos(theta) * radius
      const z = Math.sin(phi) * Math.sin(theta) * radius
      const brightness = 0.16 + starRand() * 0.22
      const cold = starRand() > 0.28

      starPositions[i * 3] = x
      starPositions[i * 3 + 1] = Math.abs(y) + 2
      starPositions[i * 3 + 2] = z
      starColors[i * 3] = cold ? brightness * 0.9 : brightness * 1.25
      starColors[i * 3 + 1] = brightness
      starColors[i * 3 + 2] = cold ? brightness * 1.35 : brightness * 0.86
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        size: 0.72,
        vertexColors: true,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    )
    scene.add(stars)

    const anchorStarCount = 300
    const anchorStarRadiusConst = 100
    const anchorStarGeometry = new THREE.BufferGeometry()
    const anchorStarPositions = new Float32Array(anchorStarCount * 3)
    const anchorStarColors = new Float32Array(anchorStarCount * 3)
    const anchorRand = seededRandom(1717)

    for (let i = 0; i < anchorStarCount; i += 1) {
      const theta = anchorRand() * Math.PI * 2
      const phi = Math.acos(THREE.MathUtils.lerp(0.08, 0.98, anchorRand()))
      const radius = anchorStarRadiusConst + anchorRand() * anchorStarRadiusConst / 2
      const y = Math.cos(phi) * radius
      const twinkle = 0.24 + anchorRand() * 0.28

      anchorStarPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius
      anchorStarPositions[i * 3 + 1] = Math.abs(y) + 4
      anchorStarPositions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius
      anchorStarColors[i * 3] = twinkle
      anchorStarColors[i * 3 + 1] = twinkle * (0.9 + anchorRand() * 0.25)
      anchorStarColors[i * 3 + 2] = twinkle * (0.95 + anchorRand() * 0.35)
    }

    anchorStarGeometry.setAttribute('position', new THREE.BufferAttribute(anchorStarPositions, 3))
    anchorStarGeometry.setAttribute('color', new THREE.BufferAttribute(anchorStarColors, 3))
    const anchorStars = new THREE.Points(
      anchorStarGeometry,
      new THREE.PointsMaterial({
        size: 1.35,
        vertexColors: true,
        transparent: true,
        opacity: 0.34,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    )
    scene.add(anchorStars)

    const constellationGroup = new THREE.Group()
    const guideStarPositions = new Float32Array([
      -34, 44, -82,
      -25, 52, -89,
      -12, 48, -84,
      -2, 58, -92,
      9, 53, -86,
      75, 36, -18,
      84, 46, -5,
      78, 56, 10,
      90, 42, 22,
      69, 50, 30,
      31, 39, 78,
      16, 52, 86,
      -2, 48, 82,
      -18, 58, 90,
      -34, 44, 76,
      -78, 34, 20,
      -90, 47, 7,
      -84, 55, -10,
      -70, 43, -28,
      -92, 60, -35,
      -18, 72, -34,
      0, 82, -12,
      22, 76, 4,
      8, 88, 32,
      -20, 80, 24,
    ])
    const guideStarGeometry = new THREE.BufferGeometry()
    guideStarGeometry.setAttribute('position', new THREE.BufferAttribute(guideStarPositions, 3))
    const guideStars = new THREE.Points(
      guideStarGeometry,
      new THREE.PointsMaterial({
        color: 0xf7efd2,
        size: 1.45,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    )
    constellationGroup.add(guideStars)

    const constellationPairs = [
      [0, 1],
      [1, 2],
      [0, 2],
      [2, 3],
      [2, 4],
      [3, 4],
      [5, 6],
      [6, 7],
      [7, 8],
      [7, 9],
      [10, 11],
      [11, 12],
      [12, 13],
      [12, 14],
      [15, 16],
      [16, 17],
      [17, 18],
      [17, 19],
      [20, 21],
      [21, 22],
      [22, 23],
      [23, 24],
      [20, 24],
    ]
    const constellationLines = new Float32Array(constellationPairs.length * 6)
    constellationPairs.forEach(([from, to], index) => {
      for (let axis = 0; axis < 3; axis += 1) {
        constellationLines[index * 6 + axis] = guideStarPositions[from * 3 + axis]
        constellationLines[index * 6 + 3 + axis] = guideStarPositions[to * 3 + axis]
      }
    })
    const constellationGeometry = new THREE.BufferGeometry()
    constellationGeometry.setAttribute('position', new THREE.BufferAttribute(constellationLines, 3))
    const constellationBeamMaterial = new THREE.MeshBasicMaterial({
      color: 0x8be8ff,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })
    constellationPairs.forEach(([from, to]) => {
      const start = new THREE.Vector3(
        guideStarPositions[from * 3],
        guideStarPositions[from * 3 + 1],
        guideStarPositions[from * 3 + 2],
      )
      const end = new THREE.Vector3(
        guideStarPositions[to * 3],
        guideStarPositions[to * 3 + 1],
        guideStarPositions[to * 3 + 2],
      )
      const direction = end.clone().sub(start)
      const length = direction.length()
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, length, 8, 1, true), constellationBeamMaterial)
      beam.position.copy(start).add(end).multiplyScalar(0.5)
      beam.quaternion.setFromUnitVectors(UP, direction.normalize())
      constellationGroup.add(beam)
    })
    constellationGroup.add(
      new THREE.LineSegments(
        constellationGeometry,
        new THREE.LineBasicMaterial({
          color: 0x5fbfff,
          transparent: true,
          opacity: 0.1,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fog: false,
        }),
      ),
    )
    constellationGroup.add(
      new THREE.LineSegments(
        constellationGeometry,
        new THREE.LineBasicMaterial({
          color: 0x9bdfff,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fog: false,
        }),
      ),
    )
    scene.add(constellationGroup)

    const campfire = new THREE.Group()
    scene.add(campfire)

    const coalMaterial = new THREE.MeshStandardMaterial({
      color: 0x170806,
      emissive: 0xff3b12,
      emissiveIntensity: 0,
      roughness: 0.8,
    })
    const coalGeometry = new THREE.IcosahedronGeometry(0.12, 1)
    for (let i = 0; i < 20; i += 1) {
      const angle = (i / 20) * Math.PI * 2
      const radius = 0.12 + Math.random() * 0.32
      const coal = new THREE.Mesh(coalGeometry, coalMaterial)
      coal.position.set(Math.cos(angle) * radius, 0.08, Math.sin(angle) * radius)
      coal.scale.setScalar(0.65 + Math.random() * 1.1)
      coal.castShadow = true
      campfire.add(coal)
    }

    const logGeometry = new THREE.CylinderGeometry(0.095, 0.13, 1.28, 14)
    const logMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a2514,
      roughness: 0.9,
      emissive: 0x240804,
      emissiveIntensity: 0.08,
    })
    for (let i = 0; i < 5; i += 1) {
      const log = new THREE.Mesh(logGeometry, logMaterial)
      log.position.set(0, 0.18 + i * 0.018, 0)
      log.rotation.z = Math.PI / 2 + (i % 2) * 0.1
      log.rotation.y = (i / 5) * Math.PI * 2
      log.castShadow = true
      log.receiveShadow = true
      campfire.add(log)
    }

    const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x8a8177, roughness: 1 })
    const stoneGeometry = new THREE.DodecahedronGeometry(0.18, 0)
    for (let i = 0; i < 18; i += 1) {
      const angle = (i / 18) * Math.PI * 2
      const stone = new THREE.Mesh(stoneGeometry, stoneMaterial)
      stone.position.set(Math.cos(angle) * 0.82, 0.11, Math.sin(angle) * 0.82)
      stone.scale.set(1.1, 0.72, 0.92)
      stone.rotation.set(angle * 0.7, angle, angle * 0.31)
      stone.castShadow = true
      stone.receiveShadow = true
      campfire.add(stone)
    }

    const signX = -1.62
    const signZ = -1.34
    const signGroup = new THREE.Group()
    signGroup.position.set(signX, terrainHeight(signX, signZ), signZ)
    signGroup.rotation.y = 0.18
    scene.add(signGroup)

    const signTopPlankMaterial = new THREE.MeshStandardMaterial({
      color: 0x75431f,
      roughness: 0.92,
      metalness: 0,
    })
    const signBottomPlankMaterial = new THREE.MeshStandardMaterial({
      color: 0x5f351b,
      roughness: 0.94,
      metalness: 0,
    })
    const signPostMaterial = new THREE.MeshStandardMaterial({
      color: 0x4b2814,
      roughness: 0.95,
      metalness: 0,
    })
    const signGrainMaterial = new THREE.MeshBasicMaterial({
      color: 0x241209,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    })
    const signTextMaterial = new THREE.MeshBasicMaterial({
      color: 0x050505,
      toneMapped: false,
      fog: false,
    })
    const signPostGeometry = new THREE.CylinderGeometry(0.055, 0.075, 1.05, 8)
    const signPost = new THREE.Mesh(signPostGeometry, signPostMaterial)
    signPost.position.set(-0.14, 0.42, -0.04)
    signPost.rotation.z = -0.24
    signPost.castShadow = true
    signPost.receiveShadow = true
    signGroup.add(signPost)

    const signBoardGroup = new THREE.Group()
    signBoardGroup.position.set(0, 0.91, 0)
    signBoardGroup.rotation.z = -0.17
    signGroup.add(signBoardGroup)

    const topPlank = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.26, 0.1), signTopPlankMaterial)
    topPlank.position.set(0.02, 0.08, 0)
    topPlank.rotation.z = -0.025
    topPlank.castShadow = true
    topPlank.receiveShadow = true
    signBoardGroup.add(topPlank)

    const bottomPlank = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.3, 0.1), signBottomPlankMaterial)
    bottomPlank.position.set(-0.04, -0.14, -0.006)
    bottomPlank.rotation.z = 0.015
    bottomPlank.castShadow = true
    bottomPlank.receiveShadow = true
    signBoardGroup.add(bottomPlank)

    const signRand = seededRandom(805)
    const grainGeometry = new THREE.BoxGeometry(1, 1, 0.009)
    const addGrain = (yMin, yMax, count, maxWidth) => {
      for (let i = 0; i < count; i += 1) {
        const grain = new THREE.Mesh(grainGeometry, signGrainMaterial)
        const length = 0.28 + signRand() * maxWidth
        const thickness = 0.005 + signRand() * 0.009
        grain.position.set((signRand() - 0.5) * 1.2, yMin + signRand() * (yMax - yMin), 0.057)
        grain.scale.set(length, thickness, 1)
        grain.rotation.z = (signRand() - 0.5) * 0.12
        signBoardGroup.add(grain)
      }
    }
    addGrain(-0.02, 0.18, 16, 1.28)
    addGrain(-0.26, -0.04, 18, 1.36)

    const letterBarGeometry = new THREE.BoxGeometry(1, 1, 0.018)
    const addLetterBar = (x, y, width, height, rotation = 0) => {
      const bar = new THREE.Mesh(letterBarGeometry, signTextMaterial)
      bar.position.set(x, y, 0.066)
      bar.scale.set(width, height, 1)
      bar.rotation.z = rotation
      signBoardGroup.add(bar)
    }
    const addBlockLetter = (letter, x, y, scale = 1) => {
      const t = 0.022 * scale
      const w = 0.12 * scale
      const h = 0.2 * scale
      const halfW = w / 2
      const halfH = h / 2

      if (letter === 'L') {
        addLetterBar(x - halfW, y, t, h)
        addLetterBar(x - halfW / 2, y - halfH, w, t)
      }
      if (letter === 'O') {
        addLetterBar(x - halfW, y, t, h)
        addLetterBar(x + halfW, y, t, h)
        addLetterBar(x, y + halfH, w, t)
        addLetterBar(x, y - halfH, w, t)
      }
      if (letter === 'K') {
        addLetterBar(x - halfW, y, t, h)
        addLetterBar(x + halfW * 0.35, y + halfH * 0.32, t, h * 0.62, -0.72)
        addLetterBar(x + halfW * 0.35, y - halfH * 0.32, t, h * 0.62, 0.72)
      }
      if (letter === 'U') {
        addLetterBar(x - halfW, y + t * 0.8, t, h - t * 1.6)
        addLetterBar(x + halfW, y + t * 0.8, t, h - t * 1.6)
        addLetterBar(x, y - halfH, w, t)
      }
      if (letter === 'P') {
        addLetterBar(x - halfW, y, t, h)
        addLetterBar(x, y + halfH, w, t)
        addLetterBar(x, y, w, t)
        addLetterBar(x + halfW, y + halfH * 0.5, t, h * 0.5)
      }
    }
    ;[
      ['L', -0.29, 0.08],
      ['O', -0.1, 0.08],
      ['O', 0.1, 0.08],
      ['K', 0.31, 0.08],
      ['U', -0.1, -0.15],
      ['P', 0.1, -0.15],
    ].forEach(([letter, x, y]) => addBlockLetter(letter, x, y, 0.92))

    const flameGroup = new THREE.Group()
    campfire.add(flameGroup)

    const flameMaterials = [
      new THREE.MeshBasicMaterial({
        color: 0xffe09a,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      new THREE.MeshBasicMaterial({
        color: 0xff7d2d,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      new THREE.MeshBasicMaterial({
        color: 0x5bc7ff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ]
    const flameMeshes = [
      new THREE.Mesh(new THREE.ConeGeometry(0.23, 0.92, 18), flameMaterials[1]),
      new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.72, 18), flameMaterials[0]),
      new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.34, 16), flameMaterials[2]),
    ]

    flameMeshes.forEach((flame, index) => {
      flame.position.y = [0.56, 0.5, 0.28][index]
      flame.rotation.y = index * 1.7
      flameGroup.add(flame)
    })

    const fireLight = new THREE.PointLight(0xff8a2f, 0, 13.5, 1.7)
    fireLight.position.set(0, 1.15, 0)
    fireLight.castShadow = true
    fireLight.shadow.mapSize.set(1024, 1024)
    campfire.add(fireLight)

    const lowGlow = new THREE.PointLight(0xff3b18, 0, 4.2, 2)
    lowGlow.position.set(0, 0.24, 0)
    campfire.add(lowGlow)

    const sparkCount = 90
    const sparkGeometry = new THREE.BufferGeometry()
    const sparkPositions = new Float32Array(sparkCount * 3)
    const sparkSeeds = Array.from({ length: sparkCount }, (_, index) => {
      const r = seededRandom(index + 700)
      return {
        angle: r() * Math.PI * 2,
        radius: r() * 0.22,
        speed: 0.34 + r() * 0.9,
        offset: r() * 5,
      }
    })

    sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3))
    const sparks = new THREE.Points(
      sparkGeometry,
      new THREE.PointsMaterial({
        color: 0xffb15a,
        size: 0.045,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    campfire.add(sparks)

    const planetMeshes = []
    const planetRings = []
    const planetDecorRings = []
    const skyGroup = new THREE.Group()
    scene.add(skyGroup)

    DISCOVERIES.forEach((discovery, index) => {
      const planetTexture = new THREE.CanvasTexture(
        makePlanetTexture(discovery.palette, index + 10, discovery.planetStyle),
      )
      planetTexture.colorSpace = THREE.SRGBColorSpace
      const visibilityBoost = discovery.visibilityBoost ?? 1
      const planetMaterial = new THREE.MeshBasicMaterial({
        map: planetTexture,
        color: discoveredIdsRef.current.has(discovery.id) ? 0xffffff : 0x242424,
        transparent: false,
        depthWrite: true,
        toneMapped: false,
        fog: false,
      })
      const planet = new THREE.Mesh(new THREE.SphereGeometry(discovery.radius, 48, 32), planetMaterial)
      planet.position.set(...discovery.position)
      planet.userData.discoveryId = discovery.id
      planet.userData.discovered = discoveredIdsRef.current.has(discovery.id)
      planet.userData.discoveryGlow = 0
      planet.userData.hoverScale = 1
      planet.renderOrder = 3
      skyGroup.add(planet)
      planetMeshes.push(planet)

      const fullBrightShell = new THREE.Mesh(
        new THREE.SphereGeometry(discovery.radius * 1.018, 48, 32),
        new THREE.MeshBasicMaterial({
          color: discovery.hex,
          transparent: true,
          opacity: discoveredIdsRef.current.has(discovery.id) ? Math.min(0.48, 0.18 * visibilityBoost) : 0,
          depthTest: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          toneMapped: false,
          fog: false,
        }),
      )
      fullBrightShell.position.copy(planet.position)
      fullBrightShell.renderOrder = 7
      skyGroup.add(fullBrightShell)
      planet.userData.fullBrightShell = fullBrightShell

      const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(discovery.radius * 1.09, 32, 16),
        new THREE.MeshBasicMaterial({
          color: discovery.hex,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          toneMapped: false,
          fog: false,
        }),
      )
      atmosphere.position.copy(planet.position)
      skyGroup.add(atmosphere)
      planet.userData.atmosphere = atmosphere

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(discovery.radius * 1.35, discovery.radius * 2.35, 96),
        new THREE.MeshBasicMaterial({
          color: discovery.hex,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          toneMapped: false,
          fog: false,
        }),
      )
      ring.position.copy(planet.position)
      skyGroup.add(ring)
      planetRings.push(ring)

      let decorRing = null
      if (discovery.planetStyle?.rings) {
        decorRing = new THREE.Mesh(
          new THREE.RingGeometry(discovery.radius * 1.32, discovery.radius * 2.12, 128),
          new THREE.MeshBasicMaterial({
            color: discovery.hex,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            toneMapped: false,
            fog: false,
          }),
        )
        decorRing.position.copy(planet.position)
        decorRing.rotation.set(Math.PI / 2 + discovery.planetStyle.ringTilt, index * 0.48, index * 0.2)
        skyGroup.add(decorRing)
      }
      planetDecorRings.push(decorRing)
    })

    const burstCount = 900
    const burstPositions = new Float32Array(burstCount * 3)
    const burstVelocities = new Float32Array(burstCount * 3)
    const burstColors = new Float32Array(burstCount * 3)
    const burstBaseColors = new Float32Array(burstCount * 3)
    const burstAges = new Float32Array(burstCount)
    const burstLifetimes = new Float32Array(burstCount)
    const burstRand = seededRandom(1042)
    let burstCursor = 0

    const burstGeometry = new THREE.BufferGeometry()
    burstGeometry.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3))
    burstGeometry.setAttribute('color', new THREE.BufferAttribute(burstColors, 3))
    const burstParticles = new THREE.Points(
      burstGeometry,
      new THREE.PointsMaterial({
        size: 4.2,
        sizeAttenuation: false,
        vertexColors: true,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    )
    burstParticles.frustumCulled = false
    burstParticles.renderOrder = 8
    skyGroup.add(burstParticles)

    const spawnDiscoveryBurst = (planet, index, firstDiscovery) => {
      if (!firstDiscovery) return

      const discovery = DISCOVERIES[index]
      const color = new THREE.Color(discovery.hex)
      const burstSize = 230
      const visibilityBoost = discovery.visibilityBoost ?? 1
      planet.userData.discovered = true
      planet.userData.discoveryGlow = Math.max(planet.userData.discoveryGlow, 2.4)
      planet.material.color.setRGB(1 * visibilityBoost, 1 * visibilityBoost, 1 * visibilityBoost)
      planet.userData.fullBrightShell.material.opacity = Math.max(
        planet.userData.fullBrightShell.material.opacity,
        Math.min(0.5, 0.3 * visibilityBoost),
      )

      for (let i = 0; i < burstSize; i += 1) {
        const slot = burstCursor
        burstCursor = (burstCursor + 1) % burstCount

        const y = burstRand() * 2 - 1
        const theta = burstRand() * Math.PI * 2
        const radial = Math.sqrt(1 - y * y)
        const dx = radial * Math.cos(theta)
        const dy = y
        const dz = radial * Math.sin(theta)
        const surface = discovery.radius * (1.08 + burstRand() * 0.5)
        const speed = 7 + burstRand() * 12

        burstPositions[slot * 3] = planet.position.x + dx * surface
        burstPositions[slot * 3 + 1] = planet.position.y + dy * surface
        burstPositions[slot * 3 + 2] = planet.position.z + dz * surface
        burstVelocities[slot * 3] = dx * speed + (burstRand() - 0.5) * 2.4
        burstVelocities[slot * 3 + 1] = dy * speed + burstRand() * 1.8
        burstVelocities[slot * 3 + 2] = dz * speed + (burstRand() - 0.5) * 2.4
        burstAges[slot] = 0
        burstLifetimes[slot] = 0.48 + burstRand() * 0.58
        const sparkleColor = color.clone().lerp(new THREE.Color(0xffffff), 0.08 + burstRand() * 0.16)
        const sparkleIntensity = 2.4 + burstRand() * 1.35
        burstBaseColors[slot * 3] = sparkleColor.r * sparkleIntensity
        burstBaseColors[slot * 3 + 1] = sparkleColor.g * sparkleIntensity
        burstBaseColors[slot * 3 + 2] = sparkleColor.b * sparkleIntensity
      }

      burstGeometry.attributes.position.needsUpdate = true
      burstGeometry.attributes.color.needsUpdate = true
      burstParticles.material.opacity = 1
    }

    const raycaster = new THREE.Raycaster()
    const center = new THREE.Vector2(0, 0)
    const cameraDirection = new THREE.Vector3()
    const targetDirection = new THREE.Vector3()
    const planetTint = new THREE.Color()
    const pressed = new Set()
    const velocity = new THREE.Vector3()
    const forward = new THREE.Vector3()
    const right = new THREE.Vector3()
    const drag = {
      active: false,
      pointerId: null,
      x: 0,
      y: 0,
      moved: 0,
    }

    let yaw = 0
    let pitch = -0.17
    let cameraPanTarget = null
    let localFocus = null
    const scopeSparkTimes = new Map()
    let hasSetIgnited = false
    let lastTime = performance.now()
    let raf = 0

    const triggerScopeDiscovery = (id, elapsed) => {
      if (!id || !scopeActiveRef.current) return

      const lastSpark = scopeSparkTimes.get(id) ?? -Infinity
      if (elapsed - lastSpark < 1.2) return

      const firstDiscovery = !discoveredIdsRef.current.has(id)
      if (!firstDiscovery) return

      scopeSparkTimes.set(id, elapsed)
      discoveredIdsRef.current.add(id)
      discoveryEventsRef.current.push({ id, firstDiscovery: true })
    }

    const setFocus = (id, elapsed) => {
      if (localFocus === id) return
      triggerScopeDiscovery(id, elapsed)
      localFocus = id
      setFocusedTarget(id)
    }

    const clampPlayer = () => {
      const flatLength = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z)

      if (flatLength > PLAYER_RADIUS) {
        const scale = PLAYER_RADIUS / flatLength
        camera.position.x *= scale
        camera.position.z *= scale
      }

      const innerLength = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z)
      if (innerLength < CAMPFIRE_RADIUS) {
        const angle = Math.atan2(camera.position.z, camera.position.x || 0.001)
        camera.position.x = Math.cos(angle) * CAMPFIRE_RADIUS
        camera.position.z = Math.sin(angle) * CAMPFIRE_RADIUS
      }

      camera.position.y = terrainHeight(camera.position.x, camera.position.z) + EYE_HEIGHT
    }

    const openFocusedPlanet = () => {
      if (!scopeActiveRef.current || !localFocus) return
      revealDiscovery(localFocus)
    }

    const onPointerDown = (event) => {
      if (event.button === 2) {
        setScopeActive(true)
        return
      }

      if (event.button !== 0) return

      drag.active = true
      drag.pointerId = event.pointerId
      drag.x = event.clientX
      drag.y = event.clientY
      drag.moved = 0
      cameraPanTarget = null
      mount.setPointerCapture(event.pointerId)
    }

    const onPointerMove = (event) => {
      if (!drag.active || drag.pointerId !== event.pointerId) return

      const dx = event.clientX - drag.x
      const dy = event.clientY - drag.y
      drag.x = event.clientX
      drag.y = event.clientY
      drag.moved += Math.abs(dx) + Math.abs(dy)

      yaw -= dx * 0.003
      pitch = THREE.MathUtils.clamp(pitch - dy * 0.0028, -0.65, 1.18)
    }

    const onPointerUp = (event) => {
      if (event.button === 2) {
        setScopeActive(false)
        return
      }

      if (!drag.active || drag.pointerId !== event.pointerId) return

      if (drag.moved < 7) {
        openFocusedPlanet()
      }

      drag.active = false
      drag.pointerId = null
      if (mount.hasPointerCapture(event.pointerId)) {
        mount.releasePointerCapture(event.pointerId)
      }
    }

    const onContextMenu = (event) => event.preventDefault()

    const onKeyDown = (event) => {
      if (event.repeat && event.code !== 'Space') return
      if (event.code === 'Escape') {
        setActiveDiscovery(null)
        setSidebarOpen(false)
        setScopeActive(false)
      }
      if (event.code === 'Space') {
        event.preventDefault()
        setScopeActive(true)
      }
      pressed.add(event.code)

      if (event.code === 'Enter') {
        openFocusedPlanet()
      }
    }

    const onKeyUp = (event) => {
      if (event.code === 'Space') {
        event.preventDefault()
        setScopeActive(false)
      }
      pressed.delete(event.code)
    }

    const onBlur = () => {
      pressed.clear()
      setScopeActive(false)
    }

    const resize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    mount.addEventListener('pointerdown', onPointerDown)
    mount.addEventListener('pointermove', onPointerMove)
    mount.addEventListener('pointerup', onPointerUp)
    mount.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    window.addEventListener('resize', resize)

    const tick = (time) => {
      raf = requestAnimationFrame(tick)
      const elapsed = time * 0.001
      const dt = Math.min(0.04, (time - lastTime) * 0.001)
      lastTime = time
      const ignition = smoothstep(0.85, 2.65, elapsed)
      const firePulse = 0.78 + Math.sin(elapsed * 17.1) * 0.12 + Math.sin(elapsed * 29.7) * 0.06
      const scopeAmount = scopeActiveRef.current ? 1 : 0

      ambient.intensity = 0.025 + ignition * 0.035
      fireLight.intensity = ignition * (8.6 + firePulse * 4.2)
      lowGlow.intensity = ignition * (1.8 + firePulse)
      coalMaterial.emissiveIntensity = ignition * (0.5 + firePulse * 0.3)

      flameMeshes.forEach((flame, index) => {
        const wave = Math.sin(elapsed * (8 + index * 1.8) + index * 2.1)
        const wobble = 1 + wave * 0.12
        flame.scale.set(0.9 + wave * 0.08, ignition * wobble, 0.9 - wave * 0.05)
        flame.rotation.y += dt * (0.8 + index * 0.25)
        flame.position.x = Math.sin(elapsed * 7 + index) * 0.035
        flame.position.z = Math.cos(elapsed * 6.4 + index) * 0.035
        flame.material.opacity = ignition * [0.52, 0.65, 0.34][index]
      })

      sparks.material.opacity = ignition * 0.82
      for (let i = 0; i < sparkCount; i += 1) {
        const seed = sparkSeeds[i]
        const life = (elapsed * seed.speed + seed.offset) % 1
        const drift = life * life
        sparkPositions[i * 3] = Math.cos(seed.angle + elapsed * 0.35) * (seed.radius + drift * 0.42)
        sparkPositions[i * 3 + 1] = 0.22 + life * 1.75
        sparkPositions[i * 3 + 2] = Math.sin(seed.angle + elapsed * 0.35) * (seed.radius + drift * 0.42)
      }
      sparkGeometry.attributes.position.needsUpdate = true

      const requestedTargetId = cameraTargetRef.current
      if (requestedTargetId) {
        cameraTargetRef.current = null
        const planetIndex = DISCOVERIES.findIndex((discovery) => discovery.id === requestedTargetId)
        if (planetIndex >= 0) {
          targetDirection.copy(planetMeshes[planetIndex].position).sub(camera.position).normalize()
          cameraPanTarget = {
            yaw: Math.atan2(-targetDirection.x, -targetDirection.z),
            pitch: THREE.MathUtils.clamp(Math.asin(targetDirection.y), -0.65, 1.18),
          }
        }
      }

      if (cameraPanTarget) {
        const panEase = 1 - Math.exp(-dt * 2.8)
        const yawDelta = shortestAngleDelta(yaw, cameraPanTarget.yaw)
        yaw += yawDelta * panEase
        pitch = THREE.MathUtils.lerp(pitch, cameraPanTarget.pitch, panEase)

        if (Math.abs(yawDelta) < 0.004 && Math.abs(pitch - cameraPanTarget.pitch) < 0.004) {
          yaw = cameraPanTarget.yaw
          pitch = cameraPanTarget.pitch
          cameraPanTarget = null
        }
      }

      const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ')
      camera.quaternion.setFromEuler(euler)
      forward.set(0, 0, -1).applyQuaternion(camera.quaternion)
      forward.y = 0
      forward.normalize()
      right.crossVectors(forward, UP).normalize()
      velocity.set(0, 0, 0)

      if (pressed.has('KeyW') || pressed.has('ArrowUp')) velocity.add(forward)
      if (pressed.has('KeyS') || pressed.has('ArrowDown')) velocity.sub(forward)
      if (pressed.has('KeyD') || pressed.has('ArrowRight')) velocity.add(right)
      if (pressed.has('KeyA') || pressed.has('ArrowLeft')) velocity.sub(right)

      if (velocity.lengthSq() > 0) {
        velocity.normalize().multiplyScalar((scopeActiveRef.current ? 1.05 : 1.85) * dt)
        camera.position.add(velocity)
        clampPlayer()
      }

      camera.fov = THREE.MathUtils.lerp(camera.fov, scopeActiveRef.current ? 34 : 68, 0.12)
      camera.updateProjectionMatrix()

      stars.rotation.y += dt * 0.006
      anchorStars.rotation.y += dt * 0.004
      constellationGroup.rotation.y += dt * 0.003

      while (discoveryEventsRef.current.length > 0) {
        const event = discoveryEventsRef.current.shift()
        const planetIndex = DISCOVERIES.findIndex((discovery) => discovery.id === event.id)
        if (planetIndex >= 0) {
          spawnDiscoveryBurst(planetMeshes[planetIndex], planetIndex, event.firstDiscovery)
        }
      }

      let activeBurstParticles = false
      let burstParticlesChanged = false
      for (let i = 0; i < burstCount; i += 1) {
        if (burstAges[i] >= burstLifetimes[i]) {
          continue
        }

        burstParticlesChanged = true
        burstAges[i] += dt
        const life = Math.min(1, burstAges[i] / burstLifetimes[i])
        const flare = Math.sin(Math.PI * life)
        const fade = Math.pow(1 - life, 2.15) * (0.85 + flare * 1.1) * (0.76 + Math.sin(elapsed * 24 + i) * 0.24)
        activeBurstParticles = activeBurstParticles || fade > 0.01

        burstVelocities[i * 3] *= 0.992
        burstVelocities[i * 3 + 1] *= 0.992
        burstVelocities[i * 3 + 2] *= 0.992
        burstPositions[i * 3] += burstVelocities[i * 3] * dt
        burstPositions[i * 3 + 1] += burstVelocities[i * 3 + 1] * dt
        burstPositions[i * 3 + 2] += burstVelocities[i * 3 + 2] * dt
        burstColors[i * 3] = burstBaseColors[i * 3] * fade
        burstColors[i * 3 + 1] = burstBaseColors[i * 3 + 1] * fade
        burstColors[i * 3 + 2] = burstBaseColors[i * 3 + 2] * fade
      }
      burstGeometry.attributes.position.needsUpdate = burstParticlesChanged
      burstGeometry.attributes.color.needsUpdate = burstParticlesChanged
      burstParticles.material.opacity = THREE.MathUtils.lerp(burstParticles.material.opacity, activeBurstParticles ? 1 : 0, 0.08)

      raycaster.setFromCamera(center, camera)
      const hits = scopeActiveRef.current ? raycaster.intersectObjects(planetMeshes, false) : []
      let focusedId = hits.length ? hits[0].object.userData.discoveryId : null
      let proximity = 0

      if (scopeActiveRef.current) {
        camera.getWorldDirection(cameraDirection)
        let bestAngle = Infinity

        planetMeshes.forEach((planet, index) => {
          targetDirection.copy(planet.position).sub(camera.position)
          const distance = targetDirection.length()
          targetDirection.multiplyScalar(1 / distance)
          const angle = cameraDirection.angleTo(targetDirection)
          const lockAngle = Math.atan(DISCOVERIES[index].radius / distance) + 0.09
          const scanAngle = lockAngle * 3.8
          proximity = Math.max(proximity, THREE.MathUtils.clamp(1 - angle / scanAngle, 0, 1))

          if (!focusedId && angle < lockAngle && angle < bestAngle) {
            bestAngle = angle
            focusedId = planet.userData.discoveryId
          }
        })
      }
      if (Math.abs(proximity - scopeProximityRef.current) > 0.025) {
        scopeProximityRef.current = proximity
        setScopeProximity(proximity)
      }
      setFocus(focusedId, elapsed)

      planetMeshes.forEach((planet, index) => {
        const discovery = DISCOVERIES[index]
        const focused = focusedId === discovery.id
        const visibilityBoost = discovery.visibilityBoost ?? 1
        planet.userData.discoveryGlow = Math.max(0, planet.userData.discoveryGlow - dt * 0.72)
        const burstGlow = planet.userData.discoveryGlow
        const targetScale = focused ? 1.32 : 1 + Math.min(0.18, burstGlow * 0.05)
        planet.scale.setScalar(THREE.MathUtils.lerp(planet.scale.x, targetScale, focused ? 0.18 : 0.08))
        const materialBrightness = planet.userData.discovered
          ? focused
            ? 1.2 * visibilityBoost
            : 0.88 * visibilityBoost
          : scopeAmount
            ? focused
              ? 0.46 * visibilityBoost
              : 0.06 * Math.min(visibilityBoost, 1.12)
            : (0.018 + Math.min(0.04, burstGlow * 0.02)) * Math.min(visibilityBoost, 1.08)
        planetTint.setRGB(materialBrightness, materialBrightness, materialBrightness)
        planet.material.color.lerp(planetTint, focused ? 0.24 : 0.12)
        const fullBrightShell = planet.userData.fullBrightShell
        const shellOpacity = Math.min(
          1,
          (planet.userData.discovered
            ? focused
              ? 0.28
              : 0.18
            : scopeAmount && focused
              ? 0.04
              : Math.min(0.025, burstGlow * 0.02)) * visibilityBoost,
        )
        fullBrightShell.material.opacity = THREE.MathUtils.lerp(
          fullBrightShell.material.opacity,
          shellOpacity,
          focused ? 0.18 : 0.12,
        )
        fullBrightShell.scale.setScalar(planet.scale.x * (planet.userData.discovered ? 1.035 : 1.015))
        planet.rotation.y += dt * (0.05 + index * 0.01)
        planet.userData.atmosphere.material.opacity = THREE.MathUtils.lerp(
          planet.userData.atmosphere.material.opacity,
          scopeAmount
            ? focused
              ? 0.22
              : planet.userData.discovered
                ? 0.2
                : 0.025
            : planet.userData.discovered
              ? Math.min(0.32, 0.2 + burstGlow * 0.05)
              : Math.min(0.035, burstGlow * 0.035),
          0.1,
        )

        const ring = planetRings[index]
        ring.lookAt(camera.position)
        ring.material.opacity = THREE.MathUtils.lerp(
          ring.material.opacity,
          planet.userData.discovered
            ? focused
              ? 0.36
              : 0.25
            : scopeAmount
              ? focused
                ? 0.2
                : 0.025
              : Math.min(0.04, burstGlow * 0.025),
          0.1,
        )
        ring.scale.setScalar(
          (planet.userData.discovered ? 1.62 : focused ? 1.24 : 1) +
            Math.sin(elapsed * 2.2 + index) * 0.055 +
            Math.min(0.18, burstGlow * 0.04),
        )

        const decorRing = planetDecorRings[index]
        if (decorRing) {
          decorRing.material.opacity = THREE.MathUtils.lerp(
            decorRing.material.opacity,
            planet.userData.discovered
              ? focused
                ? 0.28
                : 0.2
              : scopeAmount
                ? focused
                  ? 0.18
                  : 0.03
                : Math.min(0.03, burstGlow * 0.02),
            0.1,
          )
          decorRing.rotation.z += dt * 0.035
        }
      })

      if (elapsed > 2.9 && !hasSetIgnited) {
        hasSetIgnited = true
        setIgnited(true)
      }

      renderer.render(scene, camera)
    }

    clampPlayer()
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      mount.removeEventListener('pointerdown', onPointerDown)
      mount.removeEventListener('pointermove', onPointerMove)
      mount.removeEventListener('pointerup', onPointerUp)
      mount.removeEventListener('contextmenu', onContextMenu)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('resize', resize)

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      disposeScene(scene, renderer)
    }
  }, [revealDiscovery, setScopeActive])

  return (
    <main
      className={`space-app ${scopeActiveState ? 'is-scoping' : ''} ${ignited ? 'is-lit' : ''} ${
        sidebarOpen ? 'has-sidebar' : ''
      }`}
      style={{
        '--scope-lock-scale': 1 - scopeProximity * 0.72,
        '--scope-lock-opacity': 0.24 + scopeProximity * 0.76,
      }}
    >
      <div ref={mountRef} className="scene-mount" />

      <div className="darkness" aria-hidden="true" />
      <div className="boot-title" aria-hidden="true">
        logan&apos;s portfolio
      </div>
      <div className="vignette" aria-hidden="true" />

      <header className="hud-brand">
        <span>LOGAN ZHAO'S</span>
        <strong>PORTFOLIO</strong>
      </header>

      <button
        className="sections-button"
        type="button"
        aria-expanded={sidebarOpen}
        onClick={() => setSidebarOpen((open) => !open)}
      >
        SECTIONS
      </button>

      <button
        className="scope-button"
        type="button"
        aria-pressed={scopeActiveState}
        onMouseDown={() => setScopeActive(true)}
        onMouseUp={() => setScopeActive(false)}
        onMouseLeave={() => setScopeActive(false)}
        onTouchStart={(event) => {
          event.preventDefault()
          setScopeActive(true)
        }}
        onTouchEnd={() => setScopeActive(false)}
      >
        SCOPE
      </button>

      <div className="scope-overlay" aria-hidden="true">
        <div className="scope-ring" />
        <div className="scope-lock-circle" />
        <div className="scope-crosshair" />
      </div>

      <div className="signal-readout" style={{ '--signal-color': focusedData?.color ?? '#f7f2d6' }}>
        <span>{scopeActiveState ? 'SIGNAL' : 'CAMPFIRE'}</span>
        <strong>{focusedData?.world ?? (scopeActiveState ? 'NO LOCK' : 'ONLINE')}</strong>
      </div>

      <div className="controls-hud" aria-label="Controls">
        <span>DRAG LOOK</span>
        <span>WASD MOVE</span>
        <span>SPACE TO SCOPE IN</span>
      </div>

      <PortfolioSidebar
        open={sidebarOpen}
        activeId={activeDiscovery}
        onSelect={selectDiscovery}
        onClose={() => setSidebarOpen(false)}
      />
      <Panel discovery={activeData} onClose={() => setActiveDiscovery(null)} />
    </main>
  )
}
