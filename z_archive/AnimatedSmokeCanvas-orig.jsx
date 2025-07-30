// src/three/AnimatedSmokeCanvas.jsx
import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────
// Constants – tweak these to adjust the overall effect

// Background color (only where there is no fog)
const BG_COLOR = "#160E30";

// Neon gradient colors (provided from the wave animation)
const COLOR_0_HEX = 0x0000FF; // Blue
const COLOR_1_HEX = 0x800080; // Purple
const COLOR_2_HEX = 0xFF1493; // Pink
const COLOR_3_HEX = 0xFFA500; // Orange
const COLOR_4_HEX = 0xFF0000; // Red

// Particle spatial distribution and behavior
const SMOKE_RANGE = 770;         // Particles appear with coordinates in [-SMOKE_RANGE, SMOKE_RANGE]
const PARTICLE_COUNT = 280;      // Number of smoke particles
const SMOKE_SCALE = 2.25;        // Scale factor for each smoke particle
const ROTATION_SPEED = 0.16;     // Rotation speed multiplier (per frame)
const PLANE_SIZE = 330;          // Base width/height for the plane geometry
const SMOKE_OPACITY = 0.15;      // Overall opacity for the smoke material
const SMOOTH_EDGE_START = 0.5;   // Start fading the edges once UV distance exceeds this value
const SMOOTH_EDGE_END = 0.45;    // Completely mask out pixels when UV distance exceeds this value

// Gradient segment boundaries (normalized 0–1) for left-to-right fade.
// These are now defined so that their GLSL substitution will yield float literals.
const GRAD_BOUNDARY1 = 0.3;  // End of blue→purple blend
const GRAD_BOUNDARY2 = 0.6;  // End of purple→pink blend
const GRAD_BOUNDARY3 = 0.9;  // End of pink→orange blend
const GRAD_BOUNDARY4 = 1.2;  // End of orange→red blend

// const GRAD_BOUNDARY1 = 0.20;  
// const GRAD_BOUNDARY2 = 0.45;  
// const GRAD_BOUNDARY3 = 0.70;  
// const GRAD_BOUNDARY4 = 1.00;  

// Mix factor between screen-space coordinate and local vUv.x.
// 0.0: use pure screen coordinate (sharp vertical stripes), 1.0: use local UV coordinate.
const GRADIENT_MIX_FACTOR = 0.3;

// Neon boost factor to intensify the glow.
const NEON_BOOST = 2.0;

// ─────────────────────────────────────────────────────────────
// Static import of one smoke texture from your assets.
// (This uses the first frame “0000.png” in your src/assets/smoke directory.)
import smokeTextureURL from "../assets/smoke/0000.png";

// ─────────────────────────────────────────────────────────────
// SceneSetup: sets background color and fog for the scene.
const SceneSetup = () => {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color(BG_COLOR);
    // Apply fog with a light bluish color (fog affects objects, not the background)
    scene.fog = new THREE.Fog(0xc6efff, 1, 300);
  }, [scene]);
  return null;
};

// ─────────────────────────────────────────────────────────────
// SmokeParticles: creates PARTICLE_COUNT smoke elements.
// Each element is a plane (of size PLANE_SIZE) using a custom shader material that applies
// both a radial alpha mask (to hide hard edges) and a neon gradient tint.
// The gradient is computed from a mix between screen-space x coordinate and local UV's x.
const SmokeParticles = () => {
  const { size } = useThree(); // Get current canvas size for the gradient.
  
  // Load the smoke texture.
  const smokeTexture = useLoader(THREE.TextureLoader, smokeTextureURL);
  useEffect(() => {
    smokeTexture.encoding = THREE.sRGBEncoding;
    smokeTexture.minFilter = THREE.LinearFilter;
    smokeTexture.magFilter = THREE.LinearFilter;
  }, [smokeTexture]);

  // Shared geometry: a plane with width and height PLANE_SIZE.
  const smokeGeometry = useMemo(() => new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE), []);

  // Custom shader material.
  const smokeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: smokeTexture },
        opacity: { value: SMOKE_OPACITY },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      // The fragment shader applies a radial mask to hide sharp edges, and tints the texture
      // with a left-to-right neon gradient. The gradient is a mix between the screen-space x 
      // coordinate (gl_FragCoord.x) and the local uv coordinate (vUv.x) controlled by GRADIENT_MIX_FACTOR.
      fragmentShader: `
        uniform sampler2D map;
        uniform float opacity;
        uniform vec2 uResolution;
        varying vec2 vUv;
        
        // Neon colors defined in normalized RGB (0.0 - 1.0)
        vec3 blue   = vec3(0.0, 0.0, 1.0);
        vec3 purple = vec3(0.5, 0.0, 0.5);
        vec3 pink   = vec3(1.0, 0.082, 0.576);
        vec3 orange = vec3(1.0, 0.647, 0.0);
        vec3 red    = vec3(1.0, 0.0, 0.0);
        
        // Computes the gradient color based on the value t.
        vec3 getGradientColor(float t) {
          if(t < ${GRAD_BOUNDARY1.toFixed(2)}) {
            return mix(blue, purple, t / ${GRAD_BOUNDARY1.toFixed(2)});
          } else if(t < ${GRAD_BOUNDARY2.toFixed(2)}) {
            return mix(purple, pink, (t - ${GRAD_BOUNDARY1.toFixed(2)}) / (${GRAD_BOUNDARY2.toFixed(2)} - ${GRAD_BOUNDARY1.toFixed(2)}));
          } else if(t < ${GRAD_BOUNDARY3.toFixed(2)}) {
            return mix(pink, orange, (t - ${GRAD_BOUNDARY2.toFixed(2)}) / (${GRAD_BOUNDARY3.toFixed(2)} - ${GRAD_BOUNDARY2.toFixed(2)}));
          } else {
            return mix(orange, red, (t - ${GRAD_BOUNDARY3.toFixed(2)}) / (${GRAD_BOUNDARY4.toFixed(2)} - ${GRAD_BOUNDARY3.toFixed(2)}));
          }
        }
        
        void main(){
          vec4 texColor = texture2D(map, vUv);
          // Radial mask: fade out pixels near the edge of the plane.
          float d = distance(vUv, vec2(0.5, 0.5));
          float mask = smoothstep(${SMOOTH_EDGE_START.toFixed(2)}, ${SMOOTH_EDGE_END.toFixed(2)}, d);
          
          // Compute normalized x coordinate from screen space and mix with local uv.x.
          float t_screen = gl_FragCoord.x / uResolution.x;
          float t_uv = vUv.x;
          float t = mix(t_screen, t_uv, ${GRADIENT_MIX_FACTOR.toFixed(2)});
          
          // Get the gradient color.
          vec3 gradColor = getGradientColor(t);
          // Apply neon boost.
          vec3 finalColor = texColor.rgb * gradColor * ${NEON_BOOST.toFixed(2)};
          
          gl_FragColor = vec4(finalColor, texColor.a * mask * opacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, [smokeTexture, size]);

  // Generate an array of PARTICLE_COUNT particle parameters.
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
  
  // Each SmokeElement renders a mesh that rotates slowly over time.
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
// AnimatedSmokeCanvas: integrates the scene, OrbitControls, lights, and smoke particles.
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
