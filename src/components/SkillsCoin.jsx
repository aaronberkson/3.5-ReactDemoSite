// src/components/SkillsCoin.jsx
import React, {
  useRef,
  useMemo,
  useLayoutEffect,
  useState
} from "react"
import { useThree, useFrame }                from "@react-three/fiber"
import { Vector3, Shape, ExtrudeGeometry, PlaneGeometry } from "three"
import { Text, Text3D }                              from "@react-three/drei"
import fontJson   from "../assets/fonts/Focal-Medium-Web.json"
import SkillsCoinLogo from "./SkillsCoinLogo"
import * as THREE                            from "three"

// ───── VIEW PRESET ─────
const VIEW_MODE = 0
const ROTATION_PRESETS = {
  0: [0,                  0,               0],
  1: [-Math.PI / 12,     -Math.PI / 12,    0],
  2: [ Math.PI / 12,      Math.PI / 12,    0],
  3: [-Math.PI / 12,      Math.PI + Math.PI/6, 0]
}

// ───── GEOMETRY CONSTANTS ─────
const COIN_SCALE         = 0.9    // relative to hexSize
const BORDER_THICKNESS   = 0.1    // fraction of radius
const RIM_DEPTH_FACTOR   = 0.15   // fraction of hexSize
const FACE_DEPTH_FACTOR  = 0.04   // fraction of hexSize
const BEVEL_ENABLED      = true
const BEVEL_SIZE_FACTOR  = 0.02
const BEVEL_THICK_FACTOR = 0.15
const BEVEL_SEGMENTS     = 2

// ───── COLOR PALETTE ─────
const COLOR_MAP = {
  // Cyan variants
  cyan:            0x07c6fa,  // original
  cyanLight:       0x00e5ff,  // gentle pastel
  cyanDeep:        0x00b8d4,  // saturated mid-tone
  cyanMint:        0x5eead4,  // vibrant mint
  cyanShade:       0x006d80,  // dark, steely cyan
  cyanRich:        0x0097a7,  // deep, jewel-like cyan
  cyanMidnight:    0x004e66,  // richest, moody cyan

  // NEW deep cyans
  cyanPeacock:     0x004b6e,  // peacock-blue cyan
  cyanLagoon:      0x007c91,  // ocean lagoon tone
  cyanElectric:    0x00c9ff,  // bright, electric cyan

  // Blue variants
  blue:            0x0000ff,  // original
  royalBlue:       0x4169e1,  // vivid mid-tone blue
  cornflowerBlue:  0x6495ed,  // classic soft blue

  // NEW vibrant blues
  sapphire:        0x0f52ba,  // rich deep blue
  ultramarine:     0x3f00ff,  // intense purple-blue
  cerulean:        0x007ba7,  // bright mid-tone blue
  cobalt:          0x0047ab,  // classic dark blue
  azure:           0x007fff,  // pure vivid azure
  persianBlue:     0x1c39bb,  // saturated royal blue
  denim:           0x1560bd,  // strong muted blue
  midnightBlue:    0x191970,  // almost-black navy
  electricBlue:    0x0652ff,  // neon-bright blue

  // Purple variants
  purple:          0x9933ff,  // original
  indigo:          0x4b0082,  // blue-purple bridge
  slateBlue:       0x6a5acd,  // muted blue-purple
  mediumSlateBlue: 0x7b68ee,  // lighter slate-blue
  amethyst:        0x9966cc,  // warm lavender-purple
  periwinkle:      0xccccff,  // pale blue-purple
  lavender:        0xe6e6fa,  // soft, dusty pastel

  // Existing accents
  magenta:         0xff1493,
  plum:            0x9b2057,
  gold:            0xffaa05,
  orange:          0xffa500,
  coral:           0xff5300,
  red:             0xff0000,
  teal:            0x008080,
  mintCream:       0xf5fffa,
  peach:           0xffd1b3,
  slateGray:       0x708090
}



export default function SkillsCoin({
  q,
  r,
  hexSize = 44,              // must match SkillsHex grid
  title = "Title",           // label text
  link = "https://react.dev",// optional URL for click-through
  materialProps = {},        // overrides for the coin material
  color = "purple",          // key in your COLOR_MAP
  logoPaths = [],            // array of SVGLoader.Path from your collection
  logoSideBrightness = 0.33, // 0–1 mix for side-wall HSL
  logoSizeFactor = .85,     // fraction of coin diameter
  logoYFactor = 75,           // fraction of coin radius (vertical offset)
  logoZOffset = 0.02,         // forward offset in world units
  extrudeFactor = 2,
  textSize
}) {
  const groupRef   = useRef()
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const textRef = useRef()

  const outerR   = hexSize * COIN_SCALE
  const innerR   = outerR * (1 - BORDER_THICKNESS)

  useLayoutEffect(() => {
    if (textRef.current) {
      const geom = textRef.current.geometry
      geom.computeBoundingBox()
      geom.center()
    }
  }, [])

  const parCurrent = useRef([0, 0])
  const parTarget  = useRef([0, 0])

  // 1) hex grid placement (flat‐topped)
  const H_SP = hexSize * 1.5
  const V_SP = hexSize * Math.sqrt(3)
  const x    = q * H_SP
  const y    = r * V_SP + ((q & 1) * (V_SP / 2))
  const z    = 0.5

  // 2) coin radii & depths

  const rimDepth = hexSize * RIM_DEPTH_FACTOR
  const faceDepth= hexSize * FACE_DEPTH_FACTOR
  const textDepth = faceDepth * 1.2
  const bevelSize  = hexSize * BEVEL_SIZE_FACTOR
  const bevelThick = hexSize * BEVEL_THICK_FACTOR

  // 2a) 3D text sizing & bevel parameters
  const defaultTextSize = outerR * 0.16
  const textSizeValue   = textSize ?? defaultTextSize
  const textHeight    = faceDepth * 1.8              // how deep the letters extrude
  const bevelThicknessValue = faceDepth * (BEVEL_THICK_FACTOR * 8)
  const bevelSizeValue      = faceDepth * (BEVEL_SIZE_FACTOR * 8)

  // 3) 2D hexagon & inner hole shapes
  const hexShape = useMemo(() => {
    const s = new Shape()
    for (let i = 0; i < 6; i++) {
      const a  = (Math.PI / 3) * i
      const vx = Math.cos(a) * outerR
      const vy = Math.sin(a) * outerR
      i === 0 ? s.moveTo(vx, vy) : s.lineTo(vx, vy)
    }
    s.closePath()
    return s
  }, [outerR])

  const innerShape = useMemo(() => {
    const s = new Shape()
    for (let i = 0; i < 6; i++) {
      const a  = (Math.PI / 3) * i
      const vx = Math.cos(a) * innerR
      const vy = Math.sin(a) * innerR
      i === 0 ? s.moveTo(vx, vy) : s.lineTo(vx, vy)
    }
    s.closePath()
    return s
  }, [innerR])

  // 4) extruded rim & face
  const borderGeo = useMemo(() => {
    const shape = hexShape.clone()
    shape.holes = [innerShape]
    return new ExtrudeGeometry(shape, {
      depth:           rimDepth,
      bevelEnabled:    BEVEL_ENABLED,
      bevelSize:       bevelSize,
      bevelThickness:  bevelThick,
      bevelSegments:   BEVEL_SEGMENTS
    })
  }, [hexShape, innerShape, rimDepth, bevelSize, bevelThick])

  const faceGeo = useMemo(() => {
    return new ExtrudeGeometry(innerShape, {
      depth:         faceDepth,
      bevelEnabled:  false
    })
  }, [innerShape, faceDepth])

  // 5) transparent plane for pointer events
  const planeGeo = useMemo(
    () => new PlaneGeometry(outerR * 2, outerR * 2),
    [outerR]
  )

  // 6) single shiny PBR material (now color-configurable)
  const { scene } = useThree()
  const envMap     = scene.environment
  const coinMat = useMemo(() => {
    // look up the hex by name, default to purple if not found
    const baseColor = COLOR_MAP[color] ?? COLOR_MAP.purple
    return new THREE.MeshStandardMaterial({
      color:             baseColor,
      emissive:          0x442200,
      emissiveIntensity: 0.3,
      roughness:         0.25,
      metalness:         0.8,
      envMap,
      envMapIntensity:   2.0,
      side:              THREE.DoubleSide,
      transparent:       true,
      opacity:           0.66,
      ...materialProps
    })
  }, [envMap, materialProps, color])

  // 6b) logo material: bright front, muted sides
  const logoMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color:             0xffffff,
      roughness:         0.2,
      metalness:         0.5,
      emissive:          0xffffff,
      emissiveIntensity: 0.3,
      toneMapped:        false,
    })
  }, [])

  // 7) apply base rotation, scale & position
  const baseRot = ROTATION_PRESETS[VIEW_MODE] || ROTATION_PRESETS[0]
  useLayoutEffect(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.set(...baseRot)
    groupRef.current.scale.set(COIN_SCALE, COIN_SCALE, COIN_SCALE)
    groupRef.current.position.set(x, y, z)
  }, [baseRot, x, y, z])

  // 8) reset click state
  useLayoutEffect(() => {
    if (!clicked) return
    const id = setTimeout(() => setClicked(false), 100)
    return () => clearTimeout(id)
  }, [clicked])

  // 9) idle float + hover parallax
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const g = groupRef.current

    // scale spring
    let target = COIN_SCALE
    if (clicked) target *= 0.95
    else if (hovered) target *= 1.1
    g.scale.setScalar(g.scale.x + (target - g.scale.x) * 0.06)

    if (!hovered && !clicked) {
      // idle animation
      g.rotation.x = baseRot[0] + Math.sin(t * 0.25) * 0.05
      g.rotation.y = baseRot[1] + Math.sin(t * 0.3) * 0.2
      g.position.x = x + Math.sin(t * 0.6) * 0.1
      g.position.y = y + Math.cos(t * 0.6) * 0.05 + Math.sin(t * 1.2) * 0.15
      g.position.z = z + Math.sin(t * 1.5) * 0.2
    } else {
      // hover parallax
      let [tx, ty] = parTarget.current
      let [cx, cy] = parCurrent.current
      cx += (tx - cx) * 0.08
      cy += (ty - cy) * 0.08
      parCurrent.current = [cx, cy]
      g.rotation.y = baseRot[1] + cx * 0.3
      g.rotation.x = baseRot[0] + cy * 0.3
      g.position.y = y + Math.sin(t * 1.2) * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {/* hit plane */}
      <mesh
        geometry={planeGeo}
        material={new THREE.MeshBasicMaterial({
          transparent: true,
          opacity:     0,
          side:        THREE.DoubleSide
        })}
        position={[0, 0, rimDepth + faceDepth + 0.01]}
        onPointerOver={e => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={e => {
          e.stopPropagation()
          setHovered(false)
          document.body.style.cursor = "auto"
        }}
        onPointerMove={e => {
          e.stopPropagation()
          const p = e.object.worldToLocal(e.point.clone())
          parTarget.current = [
            Math.max(-1, Math.min(1, p.x / outerR)),
            Math.max(-1, Math.min(1, p.y / outerR))
          ]
        }}
        onPointerDown={e => {
          e.stopPropagation()
          setClicked(true)
          link && setTimeout(() => window.open(link, "_blank"), 100)
        }}
      />

      {/* rim & face */}
      <mesh geometry={borderGeo} material={coinMat} castShadow receiveShadow />
      <mesh
        geometry={faceGeo}
        material={coinMat}
        position={[0, 0, rimDepth - faceDepth]}
        castShadow
        receiveShadow
      />

      {/* extruded SVG logo → call SkillsCoinLogo */}

{logoPaths.length > 0 && (
  <group
    position={[
      0,
      outerR * logoYFactor,
      rimDepth + faceDepth/2 + logoZOffset
    ]}
  >
    <SkillsCoinLogo
      paths={logoPaths}
      size={outerR * logoSizeFactor}
      depth={faceDepth}
      extrudeFactor={extrudeFactor}
      sideBrightness={logoSideBrightness}
    />
  </group>
)}






      {/*
        It uses Focal Medium, extrudes it, bevels it, and sits it atop the coin face.
      */}
      
      <Text3D
        ref={textRef}
        font={fontJson}
        size={textSizeValue}
        height={textHeight}
        curveSegments={12}
        bevelEnabled={BEVEL_ENABLED}
        bevelThickness={bevelThicknessValue}
        bevelSize={bevelSizeValue}
        bevelSegments={BEVEL_SEGMENTS}
        position={[0, -outerR * 0.45, rimDepth + textHeight * 0.5 + 0.02]}
      >

        <meshStandardMaterial
          attach="material-0"
          color="#ffffff"
          roughness={0.1}
          metalness={0.6}
          emissive="#ffffff"
          emissiveIntensity={0.4}
          toneMapped={false}
        />


        <meshStandardMaterial
          attach="material-1"
          color="#999"
          roughness={0.7}
          metalness={0.2}
          emissive="#000000"
          toneMapped={false}
        />


        <meshStandardMaterial
          attach="material-2"
          color="#ffffff"
          roughness={0.1}
          metalness={0.6}
          emissive="#ffffff"
          emissiveIntensity={0.4}
          toneMapped={false}
        />

        {title}
      </Text3D>

    </group>
  )
}
