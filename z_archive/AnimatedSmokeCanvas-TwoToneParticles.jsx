// src/three/AnimatedSmokeCanvas.jsx
import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────
// Constants – tweak these to adjust the overall effect

// Background color (only where there is no fog)
const BG_COLOR = "#160E30";

// (We no longer use neon color stops since the middle is forced to white.)
// Left outer color is blue; right outer color is red.

// Particle spatial distribution and behavior
const SMOKE_RANGE = 770;         // Particles are placed between -SMOKE_RANGE and +SMOKE_RANGE
const PARTICLE_COUNT = 260;      // Number of smoke particles
const SMOKE_SCALE = 2.25;        // Scale factor for each smoke particle
const ROTATION_SPEED = 0.19;     // Rotation speed multiplier per frame
const PLANE_SIZE = 330;          // Base width/height for the plane geometry
const SMOKE_OPACITY = 0.09;      // Overall opacity for the smoke material
const SMOOTH_EDGE_START = 0.5;   // UV distance where soft edge fading begins
const SMOOTH_EDGE_END = 0.45;    // UV distance where soft edge fading completes

// For this version we use the full local UV range, so set the mix factor to 1.
const GRADIENT_MIX_FACTOR = 1.0;

// Neon boost factor to intensify the glow.
const NEON_BOOST = 2.0;

// ─────────────────────────────────────────────────────────────
// Brightness modulation constants.
// These control the overall brightness: the smoke will be adjusted so that the center 
// (white) appears at a brightness of centerBrightness and the edges (colored) at edgeBrightness.
const CENTER_BRIGHTNESS = 0.7;  // Brightness factor at the center (white)
const EDGE_BRIGHTNESS   = 1.0;  // Brightness factor at the edges (color)
const BRIGHTNESS_EXPONENT = 1.5; // Controls the curvature of the brightness transition

// ─────────────────────────────────────────────────────────────
// Static import for the smoke texture.
// (Uses the first frame “0000.png” from your src/assets/smoke directory.)
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
// Each particle is a plane (size PLANE_SIZE) using a custom shader material.
// In the fragment shader:
//   1. A radial mask fades out the edges of the plane.
//   2. The gradient is computed solely based on the local UV.x coordinate.
//      • For t in [0, 0.5]: the color transitions from blue (at t=0) to white (at t=0.5).
//      • For t in [0.5, 1]: the color transitions from white (at t=0.5) to red (at t=1).
//   3. A brightness factor (adjustable via uniforms) is applied, allowing you to tweak the smoke’s brightness.
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
        
        // White color.
        vec3 white = vec3(1.0);
        // Left outer color (blue) and right outer color (red) from the original version.
        vec3 leftColor = vec3(0.0, 0.0, 1.0);
        vec3 rightColor = vec3(1.0, 0.0, 0.0);
        
        // getGradientColor: based solely on local vUv.x.
        // If t < 0.5: gradient from leftColor (t=0) to white (t=0.5).
        // If t ≥ 0.5: gradient from white (t=0.5) to rightColor (t=1).
        vec3 getGradientColor(float t) {
          if(t < 0.5) {
            return mix(leftColor, white, t / 0.5);
          } else {
            return mix(white, rightColor, (t - 0.5) / 0.5);
          }
        }
        
        void main(){
          vec4 texColor = texture2D(map, vUv);
          // Radial mask to fade edges.
          float d = distance(vUv, vec2(0.5, 0.5));
          float mask = smoothstep(${SMOOTH_EDGE_START.toFixed(2)}, ${SMOOTH_EDGE_END.toFixed(2)}, d);
          
          // Use the local UV.x coordinate to compute the gradient.
          float t = vUv.x;
          vec3 gradColor = getGradientColor(t);
          
          // Compute brightness modulation.
          // diff is 1.0 at the edges (t=0 or t=1) and 0 at the center (t=0.5).
          float diff = 1.0 - abs(t - 0.5) * 2.0;
          float modulator = pow(diff, brightnessExponent);
          float brightnessFactor = edgeBrightness * (1.0 - modulator) + centerBrightness * modulator;
          
          vec3 finalColor = texColor.rgb * gradColor * brightnessFactor * ${NEON_BOOST.toFixed(2)};
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
// AnimatedSmokeCanvas: sets up the scene, controls, lighting, and renders the smoke particles.
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
