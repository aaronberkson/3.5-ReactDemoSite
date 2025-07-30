// src/three/AnimatedSmokeCanvas.jsx
import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────
// Helper function to convert a hex color (e.g. "#0000FF") to a GLSL vec3 literal string.
function hexToVec3Literal(hex) {
  // Remove the '#' if it's present.
  if (hex[0] === "#") {
    hex = hex.slice(1);
  }
  // Parse the red, green, and blue components.
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Convert each to a normalized value between 0 and 1, with 3 decimal places.
  const nr = (r / 255).toFixed(3);
  const ng = (g / 255).toFixed(3);
  const nb = (b / 255).toFixed(3);
  return `vec3(${nr}, ${ng}, ${nb})`;
}

// ─────────────────────────────────────────────────────────────
// Constants – tweak these to adjust the overall effect

// Background color (where no smoke is rendered)
const BG_COLOR = "#160E30";

// Particle configuration
const SMOKE_RANGE = 770;
const PARTICLE_COUNT = 260;
const SMOKE_SCALE = 2.25;
const ROTATION_SPEED = 0.19;
const PLANE_SIZE = 330;
const SMOKE_OPACITY = 0.09;
const SMOOTH_EDGE_START = 0.5;
const SMOOTH_EDGE_END = 0.45;

// We use the full local UV
const GRADIENT_MIX_FACTOR = 1.0;

// Overall neon boost factor.
const NEON_BOOST = 2.0;

// Brightness modulation constants.
const CENTER_BRIGHTNESS = 0.7;
const EDGE_BRIGHTNESS = 1.0;
const BRIGHTNESS_EXPONENT = 1.5;

// ─────────────────────────────────────────────────────────────
// Color constants: Specify the two end colors as hex values.
const LEFT_COLOR_HEX = "#0000FF"; // for example: neon blue
const RIGHT_COLOR_HEX = "#FF0000"; // for example: neon red

// Convert the hex values to GLSL literal strings.
const LEFT_COLOR = hexToVec3Literal(LEFT_COLOR_HEX);
const RIGHT_COLOR = hexToVec3Literal(RIGHT_COLOR_HEX);

// ─────────────────────────────────────────────────────────────
// Static asset – smoke texture.
import smokeTextureURL from "../assets/smoke/0000.png";

// ─────────────────────────────────────────────────────────────
// SceneSetup: configures the scene's background and fog.
const SceneSetup = () => {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color(BG_COLOR);
    scene.fog = new THREE.Fog(0xc6efff, 1, 300);
  }, [scene]);
  return null;
};

// ─────────────────────────────────────────────────────────────
// SmokeParticles: creates PARTICLE_COUNT smoke particles.
// Each particle uses a custom shader material that computes its gradient based on
// its local UV.x coordinate. The gradient is defined as follows:
//   For t in [0, 0.5]: it interpolates from LEFT_COLOR (at t=0) to white (at t=0.5).
//   For t in [0.5, 1]: it interpolates from white (at t=0.5) to RIGHT_COLOR (at t=1).
// A brightness modulation factor is applied so that brightness is EDGE_BRIGHTNESS at the edges
// and CENTER_BRIGHTNESS at the center.
const SmokeParticles = () => {
  const { size } = useThree();
  const smokeTexture = useLoader(THREE.TextureLoader, smokeTextureURL);
  useEffect(() => {
    smokeTexture.encoding = THREE.sRGBEncoding;
    smokeTexture.minFilter = THREE.LinearFilter;
    smokeTexture.magFilter = THREE.LinearFilter;
  }, [smokeTexture]);

  const geometry = useMemo(() => new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE), []);

  const smokeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: smokeTexture },
        opacity: { value: SMOKE_OPACITY },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
        centerBrightness: { value: CENTER_BRIGHTNESS },
        edgeBrightness: { value: EDGE_BRIGHTNESS },
        brightnessExponent: { value: BRIGHTNESS_EXPONENT },
      },
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float opacity;
        uniform vec2 uResolution;
        uniform float centerBrightness;
        uniform float edgeBrightness;
        uniform float brightnessExponent;
        varying vec2 vUv;
        
        // Define white.
        const vec3 white = vec3(1.0);
        // Use the user-defined LEFT_COLOR and RIGHT_COLOR.
        const vec3 leftColor = ${LEFT_COLOR};
        const vec3 rightColor = ${RIGHT_COLOR};
        
        // getGradientColor: computes the gradient based on local UV.x.
        // For t in [0, 0.5]: interpolate from leftColor to white.
        // For t in [0.5, 1]: interpolate from white to rightColor.
        vec3 getGradientColor(float t) {
          if (t < 0.5) {
            return mix(leftColor, white, t / 0.5);
          } else {
            return mix(white, rightColor, (t - 0.5) / 0.5);
          }
        }
        
        void main(){
          vec4 texColor = texture2D(map, vUv);
          // Apply a radial alpha mask for soft edges.
          float d = distance(vUv, vec2(0.5, 0.5));
          float mask = smoothstep(${SMOOTH_EDGE_START.toFixed(2)}, ${SMOOTH_EDGE_END.toFixed(2)}, d);
          
          // Compute gradient from local UV.x.
          float t = vUv.x;
          vec3 gradColor = getGradientColor(t);
          
          // Compute brightness modulation: brightness = edgeBrightness at t = 0 and 1, and centerBrightness at t = 0.5.
          float diff = 1.0 - abs(t - 0.5) * 2.0;
          float modulator = pow(diff, brightnessExponent);
          float brightnessFactor = mix(edgeBrightness, centerBrightness, modulator);
          
          vec3 finalColor = texColor.rgb * gradColor * brightnessFactor * ${NEON_BOOST.toFixed(1)};
          gl_FragColor = vec4(finalColor, texColor.a * mask * opacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, [smokeTexture, size]);

  // Generate particle positions.
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = THREE.MathUtils.randFloat(-SMOKE_RANGE, SMOKE_RANGE);
      const y = THREE.MathUtils.randFloat(-SMOKE_RANGE, SMOKE_RANGE);
      const z = THREE.MathUtils.randFloat(-SMOKE_RANGE, SMOKE_RANGE);
      const rotationZ = Math.random() * Math.PI * 2;
      arr.push({ position: [x, y, z], rotationZ });
    }
    return arr;
  }, []);

  const SmokeElement = ({ position, rotationZ }) => {
    const meshRef = useRef();
    useFrame((state, delta) => {
      if (meshRef.current) {
        meshRef.current.rotation.z += delta * ROTATION_SPEED;
      }
    });
    return (
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={smokeMaterial}
        position={position}
        rotation={[0, 0, rotationZ]}
        scale={[SMOKE_SCALE, SMOKE_SCALE, SMOKE_SCALE]}
      />
    );
  };

  return (
    <>
      {particles.map((p, i) => (
        <SmokeElement key={i} position={p.position} rotationZ={p.rotationZ} />
      ))}
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// AnimatedSmokeCanvas: sets up the scene, controls, lighting, and renders the particles.
const AnimatedSmokeCanvas = () => {
  return (
    <Canvas
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      camera={{ position: [0, 0, 1000], fov: 75 }}
    >
      <SceneSetup />
      <OrbitControls enableDamping={true} />
      <ambientLight intensity={0.5} />
      <hemisphereLight skyColor={0xd6e6ff} groundColor={0xa38c08} intensity={1} />
      <SmokeParticles />
    </Canvas>
  );
};

export default AnimatedSmokeCanvas;
