import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useRef } from 'react'

function ObamaSphere() {
  const meshRef = useRef()
  const texture = useLoader(THREE.TextureLoader, '/face.jpg')

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.4
      meshRef.current.position.y = 1.3 + Math.sin(t * 1.2) * 0.08
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 1.3, 0]} castShadow>
      <sphereGeometry args={[0.75, 64, 64]} />
      <meshStandardMaterial
      map={texture}
      roughness={0.85}
      metalness={0.05}
      />
    </mesh>
  )
}

function Ground() {
  const colorMap = useLoader(THREE.TextureLoader, '/ground.jpg')
  const heightMap = useLoader(THREE.TextureLoader, '/ground.jpg')

  colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping
  heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping

  colorMap.repeat.set(5, 5)
  heightMap.repeat.set(5, 5)

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20, 256, 256]} />
      <meshStandardMaterial
        map={colorMap}
        displacementMap={heightMap}
        displacementScale={0.8}
        roughness={1}
      />
    </mesh>
  )
}

function VignetteRing() {
  return (
    <mesh position={[0, 4, -6]}>
      <planeGeometry args={[30, 20]} />
      <meshBasicMaterial color="black" transparent opacity={0.35} />
    </mesh>
  )
}

function Scene() {
  return (
    <>
    <color attach="background" args={['#000000']} />

    <ambientLight intensity={0.15} />
    <hemisphereLight intensity={0.2} groundColor="#111111" />
    <spotLight
      position={[0, 8, 2]}
      angle={0.45}
      penumbra={1}
      intensity={45}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
    />

    <group position={[0, -0.05, 0]}>
      <Ground />
    </group>

    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <ObamaSphere />
    </Float>

    <VignetteRing />

    <OrbitControls
      enablePan={false}
      enableZoom={false}
      minPolarAngle={Math.PI / 2.8}
      maxPolarAngle={Math.PI / 2.05}
    />
    </>
  )
}

export default function App() {
  return (
    <div className="app">
      <div className="overlay">
        <h1>
          now let me be<br />sphere:
        </h1>
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 2.2, 5.5], fov: 42 }}
        gl={{ antialias: true }}
      >
        <fog attach="fog" args={['#000000', 5, 15]} />
        <Scene />
      </Canvas>
    </div>
  )
}