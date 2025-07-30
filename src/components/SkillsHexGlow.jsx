// src/components/SkillsHexGlow.jsx
import React, { useMemo, useRef, useEffect } from "react"
import * as THREE                         from "three"
import { CatmullRomCurve3, TubeGeometry } from "three"
import { useFrame }                       from "@react-three/fiber"
import { useWaveAnimation }               from "../contexts/WaveAnimationContext"

// ─────────────── DEBUG ───────────────
const DEBUG_CONSOLE = true
const log = (...args) => {
  if (DEBUG_CONSOLE) console.log("[IO][SkillsHexGlow]", ...args)
}

// ─────────────── CONFIGURATION ───────────────
const TRAIL_Z             = 8
const ORB_Z               = 8

const TRAIL_RENDER_ORDER  = 0
const ORB_RENDER_ORDER    = 1

const TRAIL_THICKNESS_F   = 0.0125
const TRAIL_GLOW_FACTOR   = 1.2
const ORB_RADIUS_F        = 0.05
const ORB_GLOW_SCALE      = 2

const TRAIL_OPACITY       = 1.0
const TRAIL_GLOW_OPACITY  = 0.5
const ORB_OPACITY         = 1.0
const ORB_GLOW_OPACITY    = 0.2

const MIN_EASE_EXP        = 1
const MAX_EASE_EXP        = 4

export const SPEED_FACTOR_MIN    = 2
export const SPEED_FACTOR_MAX    = 5

const DEFAULT_FADE_POWER  = 1.5

// Throttle tube rebuilds
const REBUILD_INTERVAL = 1 / 30 // ~30 FPS

// 9-stop default palette with labels
export const DEFAULT_PALETTE = [
  0x07c6fa, // New Cyan => KEEPER BRIGHT
  0xff1493, // Bold Neon Magenta => KEEPER BRIGHT
  0x9b2057, // In-between Magenta & Yellow) => MEDIUM
  0xffaa05, // Gold => KEEPER BRIGHT
  0xffa500, // Orange => BRIGHT, Similar to Gold
  0xff5300, // In-between Orange–Red => KEEPER BRIGHT
  0xff0000  // Red => KEEPER BRIGHT
]

export default function SkillsHexGlow({
  width,
  height,
  hexSize         = 44,
  minPath         = 800,
  maxPath         = 1200,
  trailCount      = 120,
  groupLen        = 20,
  fadePower       = DEFAULT_FADE_POWER,
  palette         = DEFAULT_PALETTE,
  color,           // optional override for MAIN_COLOR
  speedFactor      // optional override for BASE_SPEED factor
}) {
  const { isPaused } = useWaveAnimation()
  log("render", { width, height, hexSize, trailCount })

  // Precompute grid spacing
  const H = hexSize * 1.5
  const V = hexSize * Math.sqrt(3)

  // Pick main color (allow prop override)
  const MAIN_COLOR = useMemo(() => {
    const chosen = color !== undefined
      ? new THREE.Color(color)
      : new THREE.Color(palette[Math.floor(Math.random() * palette.length)])
    if (DEBUG_CONSOLE) log("MAIN_COLOR chosen", `#${chosen.getHexString()}`)
    return chosen
  }, [palette, color])

  // Base speed (allow prop override)
  const BASE_SPEED = useMemo(() => {
    const sf = speedFactor !== undefined
      ? speedFactor
      : Math.random() * (SPEED_FACTOR_MAX - SPEED_FACTOR_MIN) + SPEED_FACTOR_MIN
    const val = hexSize * sf
    if (DEBUG_CONSOLE) log("BASE_SPEED computed", { sf, val })
    return val
  }, [hexSize, speedFactor])

  // Random path length
  const PATH_LENGTH = useMemo(
    () => {
      const len = Math.floor(Math.random() * (maxPath - minPath + 1)) + minPath
      if (DEBUG_CONSOLE) log("PATH_LENGTH", len)
      return len
    },
    [minPath, maxPath]
  )

  // Random easing exponents per group
  const groupCount = Math.ceil(PATH_LENGTH / groupLen)
  const groupExps = useMemo(
    () => {
      const arr = Array.from({ length: groupCount }, () =>
        Math.random() * (MAX_EASE_EXP - MIN_EASE_EXP) + MIN_EASE_EXP
      )
      if (DEBUG_CONSOLE) log("groupExps length", arr.length)
      return arr
    },
    [groupCount]
  )

  // Build hex-vertex graph
  const { vertices, adjacency } = useMemo(() => {
    const map = new Map(), edges = []
    const reg = (x,y) => {
      const k = `${x.toFixed(3)},${y.toFixed(3)}`
      if (!map.has(k)) map.set(k, new THREE.Vector2(x,y))
      return k
    }
    const corners = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI/3)*i
      return [Math.cos(a)*hexSize, Math.sin(a)*hexSize]
    })
    const cMin = Math.floor((-width/2 - hexSize*2)/H)
    const cMax = Math.ceil(( width/2 + hexSize*2)/H)
    const rMin = Math.floor((-height/2 - hexSize*2)/V)
    const rMax = Math.ceil(( height/2 + hexSize*2)/V)

    for (let q=cMin; q<=cMax; q++){
      for (let r=rMin; r<=rMax; r++){
        const cx = q*H, cy = r*V + ((q&1)*V/2)
        if (
          cx < -width/2-hexSize*2 || cx > width/2+hexSize*2 ||
          cy < -height/2-hexSize*2|| cy > height/2+hexSize*2
        ) continue
        const keys = corners.map(([dx,dy]) => reg(cx+dx, cy+dy))
        for (let i=0; i<6; i++) edges.push([keys[i], keys[(i+1)%6]])
      }
    }
    const adj = new Map()
    map.forEach((_,k)=>adj.set(k,new Set()))
    edges.forEach(([a,b]) => {
      adj.get(a).add(b)
      adj.get(b).add(a)
    })
    const verts = Array.from(map.entries()).map(([key,pos])=>({key,pos}))
    if (DEBUG_CONSOLE) log("graph built", { vertices: verts.length, edges: edges.length })
    return { vertices: verts, adjacency: adj }
  }, [width, height, hexSize, H, V])

  // Random-walk path
  const path = useMemo(() => {
    if (vertices.length < 2) return []
    const keys = vertices.map(v=>v.key)
    let curr = keys[Math.floor(Math.random()*keys.length)], prev = null
    const walk = []
    for (let i=0; i<PATH_LENGTH; i++){
      walk.push(curr)
      const nbrs = Array.from(adjacency.get(curr))
      const opts = nbrs.filter(n=>n!==prev)
      prev = curr
      curr = opts.length
        ? opts[Math.floor(Math.random()*opts.length)]
        : nbrs[0] || curr
    }
    if (DEBUG_CONSOLE) log("path generated", walk.length)
    return walk
  }, [vertices, adjacency, PATH_LENGTH])

  // Fade alphaMap
  const alphaMap = useMemo(() => {
    const size = 256, data = new Uint8Array(size*4)
    for (let i=0; i<size; i++){
      const a = Math.pow(1 - i/(size-1), fadePower)
      data.set([255,255,255, Math.floor(a*255)], i*4)
    }
    const tex = new THREE.DataTexture(data, size,1,THREE.RGBAFormat)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    tex.needsUpdate = true
    return tex
  }, [fadePower])

  // Trail materials
  const trailMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: MAIN_COLOR,
    transparent: true,
    opacity: TRAIL_OPACITY,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    alphaMap
  }), [MAIN_COLOR, alphaMap])

  const trailGlowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: MAIN_COLOR,
    transparent: true,
    opacity: TRAIL_GLOW_OPACITY,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), [MAIN_COLOR])

  // Initial trail & geometry
  const initialTrail = useMemo(() => {
    if (!path.length) return []
    const p0 = vertices.find(v=>v.key===path[0]).pos
    const arr = Array(trailCount).fill().map(
      () => new THREE.Vector3(p0.x,p0.y,TRAIL_Z)
    )
    if (DEBUG_CONSOLE) log("initialTrail created", arr.length)
    return arr
  }, [path, vertices, trailCount])

  const initialCoreTube = useMemo(() => {
    if (initialTrail.length < 2) return new THREE.BufferGeometry()
    const curve = new CatmullRomCurve3(initialTrail)
    return new TubeGeometry(
      curve, trailCount * 2,
      hexSize * TRAIL_THICKNESS_F,
      6, false
    )
  }, [initialTrail, trailCount, hexSize])

  const initialGlowTube = useMemo(() => {
    if (initialTrail.length < 2) return new THREE.BufferGeometry()
    const curve = new CatmullRomCurve3(initialTrail)
    return new TubeGeometry(
      curve, trailCount * 2,
      hexSize * TRAIL_THICKNESS_F * TRAIL_GLOW_FACTOR,
      6, false
    )
  }, [initialTrail, trailCount, hexSize])

  // Refs & state
  const coreRef   = useRef()
  const glowRef   = useRef()
  const sphereRef = useRef()
  const trailRef  = useRef(initialTrail)
  const stateRef  = useRef({ idx: 0, t: 0, dur: 0, accum: 0 })
  const doneRef   = useRef(false)

  // Cleanup on unmount
  useEffect(() => {
    log("mounted")
    return () => {
      log("unmount → disposing geometries")
      trailRef.current = []
      coreRef.current?.geometry.dispose()
      glowRef.current?.geometry.dispose()
    }
  }, [])

  // Set initial orb
  useEffect(() => {
    if (initialTrail.length) {
      const p = initialTrail[0]
      sphereRef.current.position.set(p.x, p.y, ORB_Z)
      log("initial orb position set", { x: p.x, y: p.y })
    }
  }, [initialTrail])

  // Animation loop
  useFrame((_, delta) => {
    const st = stateRef.current
    if (doneRef.current || isPaused) return

    if (path.length < 2) return

    // DEFENSIVE GUARD
    if (st.idx < 0 || st.idx >= path.length) {
      if (DEBUG_CONSOLE) log("idx out of bounds → reset", st.idx)
      st.idx = 0
      st.dur = 0
      st.t   = 0
      return
    }

    // Segment start
    if (st.dur === 0) {
      const a = vertices.find(v=>v.key===path[st.idx]).pos
      const b = vertices.find(v=>v.key===path[(st.idx+1)%path.length]).pos
      const dist = a.distanceTo(b)
      st.dur = dist / BASE_SPEED
      st.t = 0
    }

    // Advance
    st.t += delta
    const frac = Math.min(st.t / st.dur, 1)
    const a = vertices.find(v=>v.key===path[st.idx]).pos
    const b = vertices.find(v=>v.key===path[(st.idx+1)%path.length]).pos
    const x = THREE.MathUtils.lerp(a.x, b.x, frac)
    const y = THREE.MathUtils.lerp(a.y, b.y, frac)
    sphereRef.current.position.set(x, y, ORB_Z)

    // Teleport‐reset / first‐frame guard
    const currP = new THREE.Vector3(x, y, TRAIL_Z)
    if (trailRef.current.length === 0) {
      trailRef.current = Array.from({ length: trailCount }, () => currP.clone())
      if (DEBUG_CONSOLE) log("trail reseeded (empty)")
    }

    const prevP = trailRef.current[0]
    const jumpThreshold = hexSize * 1.1

    if (prevP.distanceTo(currP) > jumpThreshold) {
      trailRef.current = Array.from({ length: trailCount }, () => currP.clone())
      if (DEBUG_CONSOLE) log("big jump detected → trail reset")
    } else {
      trailRef.current.unshift(currP)
      if (trailRef.current.length > trailCount) {
        trailRef.current.pop()
      }
    }

    // pad endpoints so CatmullRom never reads undefined
    st.accum += delta
    if (st.accum >= REBUILD_INTERVAL) {
      st.accum = 0
      const rawPts    = trailRef.current
      const paddedPts = [rawPts[0], ...rawPts, rawPts[rawPts.length - 1]]
      const curve = new CatmullRomCurve3(paddedPts)

      // rebuild core tube
      const oldCore = coreRef.current.geometry
      const newCore = new TubeGeometry(
        curve,
        trailCount * 2,
        hexSize * TRAIL_THICKNESS_F,
        6,
        false
      )
      coreRef.current.geometry = newCore
      oldCore.dispose()

      // rebuild glow tube
      const oldGlow = glowRef.current.geometry
      const newGlow = new TubeGeometry(
        curve,
        trailCount * 2,
        hexSize * TRAIL_THICKNESS_F * TRAIL_GLOW_FACTOR,
        6,
        false
      )
      glowRef.current.geometry = newGlow
      oldGlow.dispose()

    }

    // Advance or reset at end
    if (frac === 1) {
      if (st.idx < path.length - 2) {
        st.idx++
      } else {
        st.idx = 0
      }
      st.dur = 0
    }
  })

  return (
    <>
      <mesh
        ref={glowRef}
        geometry={initialGlowTube}
        material={trailGlowMat}
        renderOrder={TRAIL_RENDER_ORDER}
      />
      <mesh
        ref={coreRef}
        geometry={initialCoreTube}
        material={trailMat}
        renderOrder={TRAIL_RENDER_ORDER}
      />
      <group ref={sphereRef} renderOrder={ORB_RENDER_ORDER}>
        <mesh>
          <sphereGeometry args={[hexSize * ORB_RADIUS_F, 12, 12]} />
          <meshStandardMaterial
            color={MAIN_COLOR}
            emissive={MAIN_COLOR}
            emissiveIntensity={1}
            transparent
            opacity={ORB_OPACITY}
          />
        </mesh>
        <mesh scale={[ORB_GLOW_SCALE, ORB_GLOW_SCALE, 1]}>
          <sphereGeometry args={[hexSize * ORB_RADIUS_F, 12, 12]} />
          <meshBasicMaterial
            color={MAIN_COLOR}
            transparent
            blending={THREE.AdditiveBlending}
            opacity={ORB_GLOW_OPACITY}
            depthWrite={false}
          />
        </mesh>
      </group>
    </>
  )
}
