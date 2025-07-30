// src/three/AnimatedSmokeCanvas.jsx
import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────
// Constants – tweak these to adjust the overall effect

// Background color (only where there is no fog)
const BG_COLOR = "#160E30";

// We'll work in black and white so we ignore the neon color stops.
// (Our shader will use a grayscale gradient.)
  
// Particle spatial distribution and behavior
const SMOKE_RANGE = 770;         // Particles are placed between -SMOKE_RANGE and +SMOKE_RANGE
const PARTICLE_COUNT = 260;      // Number of smoke particles
const SMOKE_SCALE = 2.25;        // Scale factor for each smoke particle
const ROTATION_SPEED = 0.19;     // Rotation speed multiplier per frame
const PLANE_SIZE = 330;          // Base width/height for the plane geometry
const SMOKE_OPACITY = 0.09;      // Overall opacity for the smoke material
const SMOOTH_EDGE_START = 0.5;   // UV distance where soft edge fading begins
const SMOOTH_EDGE_END = 0.45;    // UV distance where soft edge fading completes

// Gradient segment boundaries for consistency – note that for a grayscale gradient we use the full [0,1] range.
const GRAD_BOUNDARY1 = 0.25;  
const GRAD_BOUNDARY2 = 0.5;   
const GRAD_BOUNDARY3 = 0.75;  
const GRAD_BOUNDARY4 = 1.0;   

// We now use only the local UV coordinate for the gradient.
const GRADIENT_MIX_FACTOR = 1.0;

// Neon boost factor (you can adjust this to increase overall brightness).
const NEON_BOOST = 2.0;

// ─────────────────────────────────────────────────────────────
// Brightness modulation constants.
// edgeBrightness is the brightness multiplier at the edges (t≈0 or 1)
// centerBrightness is used at the center (t≈0.5), so values below 1 darken the center.
const CENTER_BRIGHTNESS  = 0.7;
const EDGE_BRIGHTNESS    = 1.0;
const BRIGHTNESS_EXPONENT = 1.5;

// ─────────────────────────────────────────────────────────────
// Static import for the smoke texture.
// (This uses the first frame “0000.png” from your src/assets/smoke directory.)
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
// SmokeParticles: creates PARTICLE_COUNT smoke elements.
// Each element is a plane (of size PLANE_SIZE) using a custom shader material.
// The fragment shader applies a radial alpha mask and computes a grayscale (black-to-white)
// gradient based solely on the local UV (vUv.x). Then it modulates brightness so that the
// center is darker (adjustable via uniforms) and the edges are brighter.
const SmokeParticles = () => {
  const { size } = useThree();  
  const smokeTexture = useLoader(THREE.TextureLoader, smokeTextureURL);
  useEffect(() => {
    smokeTexture.encoding = THREE.sRGBEncoding;
    smokeTexture.minFilter = THREE.LinearFilter;
    smokeTexture.magFilter = THREE.LinearFilter;
  }, [smokeTexture]);

  const smokeGeometry = useMemo(() => new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE), []);

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
        
        // In this black and white version, we define a simple grayscale gradient.
        // Given a normalized t (from 0 to 1), the gradient is vec3(t) (black to white).
        vec3 getGradientColor(float t) {
          return vec3(t);
        }
        
        void main(){
          // Sample the smoke texture.
          vec4 texColor = texture2D(map, vUv);
          // Apply a radial mask so that the edges of the plane fade out.
          float d = distance(vUv, vec2(0.5, 0.5));
          float mask = smoothstep(${SMOOTH_EDGE_START.toFixed(2)}, ${SMOOTH_EDGE_END.toFixed(2)}, d);
          
          // Use the local UV.x to drive the gradient.
          float t = vUv.x;
          vec3 gradColor = getGradientColor(t);
          
          // Compute brightness modulation:
          // diff is 1.0 at the edges (t=0 or 1) and 0 at the center (t=0.5).
          float diff = 1.0 - abs(t - 0.5) * 2.0;
          float modulator = pow(diff, brightnessExponent);
          // Manually interpolate between edgeBrightness and centerBrightness.
          float brightnessFactor = edgeBrightness * (1.0 - modulator) + centerBrightness * modulator;
          
          vec3 finalColor = gradColor * brightnessFactor * ${NEON_BOOST.toFixed(2)};
          gl_FragColor = vec4(finalColor, texColor.a * mask * opacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, [smokeTexture, size]);

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
        geometry={smokeGeometry}
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
// AnimatedSmokeCanvas: sets up the scene, controls, lights, and renders the smoke particles.
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
