// src/three/AnimatedSmokeCanvas.jsx
import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────
// Helper: Converts a hex color (e.g., "#0000FF") to a GLSL vec3 literal string.
function hexToVec3Literal(hex) {
  if (hex[0] === "#") hex = hex.slice(1);
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return `vec3(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)})`;
}

// ─────────────────────────────────────────────────────────────
// Global Constants – Tweak these for the overall effect

// Background color (for areas with no smoke)
const BG_COLOR = "#160E30";

// Particle configuration:
const SMOKE_RANGE = 770;
const PARTICLE_COUNT = 180;
const SMOKE_SCALE = 2.25;
const ROTATION_SPEED = 0.19;
const PLANE_SIZE = 330;
const SMOKE_OPACITY = 0.09;
const SMOOTH_EDGE_START = 0.5;
const SMOOTH_EDGE_END = 0.45;
const GRADIENT_MIX_FACTOR = 1.0;
const NEON_BOOST = 2.0;

// Local brightness modulation (per swirl, computed from local UV.x):
const CENTER_BRIGHTNESS = .25;
const EDGE_BRIGHTNESS = .75;
const BRIGHTNESS_EXPONENT = 1.5;

// Swirl gradient colors (set via hex):
const LEFT_COLOR_HEX = "#0000FF";  // e.g., neon blue
const RIGHT_COLOR_HEX = "#FF0000"; // e.g., neon red
const LEFT_COLOR = hexToVec3Literal(LEFT_COLOR_HEX);
const RIGHT_COLOR = hexToVec3Literal(RIGHT_COLOR_HEX);

// ─────────────────────────────────────────────────────────────
// Spotlight Global Multipliers:
const SPOTLIGHT_DISTANCE_MULTIPLIER = 4.0;  // Increase to let the light travel further.
const SPOTLIGHT_ANGLE_MULTIPLIER = 1.5;       // Increase to widen the beam.

// ─────────────────────────────────────────────────────────────
// Spotlight Parameters – modified so all three spotlights point straight down.

// LEFT SPOTLIGHT: 
// (Keep the offset as desired; only the direction is changed)
const SPOTLIGHT_LEFT_OFFSET = new THREE.Vector2(25, 100);  // example values remain
const SPOTLIGHT_LEFT_INNER = 0.10 * SPOTLIGHT_DISTANCE_MULTIPLIER; 
const SPOTLIGHT_LEFT_OUTER = 0.25 * SPOTLIGHT_DISTANCE_MULTIPLIER; 
const SPOTLIGHT_LEFT_INTENSITY = 2.0;
const SPOTLIGHT_LEFT_DIR = new THREE.Vector2(0, -1); // Now pointing straight down.
const SPOTLIGHT_LEFT_ANGLE_INNER = THREE.MathUtils.degToRad(0.0); // inner angle set to 0° 
const SPOTLIGHT_LEFT_ANGLE_OUTER = THREE.MathUtils.degToRad(30.0 * SPOTLIGHT_ANGLE_MULTIPLIER); // adjusted outer angle

// RIGHT SPOTLIGHT:
const SPOTLIGHT_RIGHT_OFFSET = new THREE.Vector2(25, 100);  
const SPOTLIGHT_RIGHT_INNER = 0.10 * SPOTLIGHT_DISTANCE_MULTIPLIER;
const SPOTLIGHT_RIGHT_OUTER = 0.30 * SPOTLIGHT_DISTANCE_MULTIPLIER;
const SPOTLIGHT_RIGHT_INTENSITY = 2.5;
const SPOTLIGHT_RIGHT_DIR = new THREE.Vector2(0, -1); // Also changed to point straight down.
const SPOTLIGHT_RIGHT_ANGLE_INNER = THREE.MathUtils.degToRad(0.0);
const SPOTLIGHT_RIGHT_ANGLE_OUTER = THREE.MathUtils.degToRad(30.0 * SPOTLIGHT_ANGLE_MULTIPLIER);

// MIDDLE SPOTLIGHT:
// This one was already set to point straight down.
const SPOTLIGHT_MIDDLE_Y_OFFSET = 100; // 100px from top.
const SPOTLIGHT_MIDDLE_INNER = 0.15 * SPOTLIGHT_DISTANCE_MULTIPLIER;
const SPOTLIGHT_MIDDLE_OUTER = 0.35 * SPOTLIGHT_DISTANCE_MULTIPLIER;
const SPOTLIGHT_MIDDLE_INTENSITY = 3.0;
const SPOTLIGHT_MIDDLE_DIR = new THREE.Vector2(0.0, -1.0); // Straight down.
const SPOTLIGHT_MIDDLE_ANGLE_INNER = THREE.MathUtils.degToRad(0.0);
const SPOTLIGHT_MIDDLE_ANGLE_OUTER = THREE.MathUtils.degToRad(30.0 * SPOTLIGHT_ANGLE_MULTIPLIER);


// ─────────────────────────────────────────────────────────────
// Static Asset – Smoke Texture.
import smokeTextureURL from "../assets/smoke/0000.png";

// ─────────────────────────────────────────────────────────────
// SceneSetup: Configures the scene's background and fog.
const SceneSetup = () => {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color(BG_COLOR);
    scene.fog = new THREE.Fog(0xc6efff, 1, 300);
  }, [scene]);
  return null;
};

// ─────────────────────────────────────────────────────────────
// SmokeParticles: Creates PARTICLE_COUNT swirls using a ShaderMaterial that combines
// a local gradient (from LEFT_COLOR → white → RIGHT_COLOR) with a global spotlight effect,
// computed from each particle's stable screen-space position.
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
        // Left spotlight uniforms:
        spotlightLeftOffset: { value: SPOTLIGHT_LEFT_OFFSET },
        spotlightLeftInner: { value: SPOTLIGHT_LEFT_INNER },
        spotlightLeftOuter: { value: SPOTLIGHT_LEFT_OUTER },
        spotlightLeftIntensity: { value: SPOTLIGHT_LEFT_INTENSITY },
        spotlightLeftDir: { value: SPOTLIGHT_LEFT_DIR },
        spotlightLeftAngleInner: { value: SPOTLIGHT_LEFT_ANGLE_INNER },
        spotlightLeftAngleOuter: { value: SPOTLIGHT_LEFT_ANGLE_OUTER },
        // Right spotlight uniforms:
        spotlightRightOffset: { value: SPOTLIGHT_RIGHT_OFFSET },
        spotlightRightInner: { value: SPOTLIGHT_RIGHT_INNER },
        spotlightRightOuter: { value: SPOTLIGHT_RIGHT_OUTER },
        spotlightRightIntensity: { value: SPOTLIGHT_RIGHT_INTENSITY },
        spotlightRightDir: { value: SPOTLIGHT_RIGHT_DIR },
        spotlightRightAngleInner: { value: SPOTLIGHT_RIGHT_ANGLE_INNER },
        spotlightRightAngleOuter: { value: SPOTLIGHT_RIGHT_ANGLE_OUTER },
        // Middle spotlight uniforms:
        spotlightMiddleYOffset: { value: SPOTLIGHT_MIDDLE_Y_OFFSET },
        spotlightMiddleInner: { value: SPOTLIGHT_MIDDLE_INNER },
        spotlightMiddleOuter: { value: SPOTLIGHT_MIDDLE_OUTER },
        spotlightMiddleIntensity: { value: SPOTLIGHT_MIDDLE_INTENSITY },
        spotlightMiddleDir: { value: SPOTLIGHT_MIDDLE_DIR },
        spotlightMiddleAngleInner: { value: SPOTLIGHT_MIDDLE_ANGLE_INNER },
        spotlightMiddleAngleOuter: { value: SPOTLIGHT_MIDDLE_ANGLE_OUTER },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec2 vScreenPos;
        void main(){
          vUv = uv;
          vec4 clipPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vec2 ndc = clipPos.xy / clipPos.w;
          vScreenPos = ndc * 0.5 + 0.5; // normalized screen coordinates (0..1)
          gl_Position = clipPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float opacity;
        uniform vec2 uResolution;
        uniform float centerBrightness;
        uniform float edgeBrightness;
        uniform float brightnessExponent;
        // Left spotlight uniforms:
        uniform vec2 spotlightLeftOffset;
        uniform float spotlightLeftInner;
        uniform float spotlightLeftOuter;
        uniform float spotlightLeftIntensity;
        uniform vec2 spotlightLeftDir;
        uniform float spotlightLeftAngleInner;
        uniform float spotlightLeftAngleOuter;
        // Right spotlight uniforms:
        uniform vec2 spotlightRightOffset;
        uniform float spotlightRightInner;
        uniform float spotlightRightOuter;
        uniform float spotlightRightIntensity;
        uniform vec2 spotlightRightDir;
        uniform float spotlightRightAngleInner;
        uniform float spotlightRightAngleOuter;
        // Middle spotlight uniforms:
        uniform float spotlightMiddleYOffset;
        uniform float spotlightMiddleInner;
        uniform float spotlightMiddleOuter;
        uniform float spotlightMiddleIntensity;
        uniform vec2 spotlightMiddleDir;
        uniform float spotlightMiddleAngleInner;
        uniform float spotlightMiddleAngleOuter;
        varying vec2 vUv;
        varying vec2 vScreenPos;
        
        const vec3 white = vec3(1.0);
        const vec3 leftColor = ${LEFT_COLOR};
        const vec3 rightColor = ${RIGHT_COLOR};
        
        vec3 getGradientColor(float t) {
          if (t < 0.5) {
            return mix(leftColor, white, t / 0.5);
          } else {
            return mix(white, rightColor, (t - 0.5) / 0.5);
          }
        }
        
        float getDistanceAtten(vec2 fragPos, vec2 spotPos, float inner, float outer) {
          float d = distance(fragPos, spotPos);
          return 1.0 - smoothstep(inner, outer, d);
        }
        
        float getAngularAtten(vec2 fragPos, vec2 spotPos, vec2 spotDir, float angleInner, float angleOuter) {
          vec2 toFrag = normalize(fragPos - spotPos);
          float angleDiff = acos(clamp(dot(toFrag, normalize(spotDir)), -1.0, 1.0));
          return 1.0 - smoothstep(angleInner, angleOuter, angleDiff);
        }
        
        void main(){
          vec4 texColor = texture2D(map, vUv);
          float d = distance(vUv, vec2(0.5, 0.5));
          float mask = smoothstep(${SMOOTH_EDGE_START.toFixed(2)}, ${SMOOTH_EDGE_END.toFixed(2)}, d);
          
          float t = vUv.x;
          vec3 localColor = getGradientColor(t);
          float diff = 1.0 - abs(t - 0.5) * 2.0;
          float modulator = pow(diff, brightnessExponent);
          float localBrightness = mix(edgeBrightness, centerBrightness, modulator);
          
          // Left Spotlight:
          vec2 spotLeftPos = vec2(spotlightLeftOffset.x / uResolution.x, 1.0 - (spotlightLeftOffset.y / uResolution.y));
          float distAttenLeft = getDistanceAtten(vScreenPos, spotLeftPos, spotlightLeftInner, spotlightLeftOuter);
          float angAttenLeft = getAngularAtten(vScreenPos, spotLeftPos, spotlightLeftDir, spotlightLeftAngleInner, spotlightLeftAngleOuter);
          float leftLight = spotlightLeftIntensity * distAttenLeft * angAttenLeft;
          
          // Right Spotlight:
          vec2 spotRightPos = vec2(1.0 - (spotlightRightOffset.x / uResolution.x), 1.0 - (spotlightRightOffset.y / uResolution.y));
          float distAttenRight = getDistanceAtten(vScreenPos, spotRightPos, spotlightRightInner, spotlightRightOuter);
          float angAttenRight = getAngularAtten(vScreenPos, spotRightPos, spotlightRightDir, spotlightRightAngleInner, spotlightRightAngleOuter);
          float rightLight = spotlightRightIntensity * distAttenRight * angAttenRight;
          
          // Middle Spotlight:
          vec2 spotMiddlePos = vec2(0.5, 1.0 - (spotlightMiddleYOffset / uResolution.y));
          float distAttenMiddle = getDistanceAtten(vScreenPos, spotMiddlePos, spotlightMiddleInner, spotlightMiddleOuter);
          float angAttenMiddle = getAngularAtten(vScreenPos, spotMiddlePos, spotlightMiddleDir, spotlightMiddleAngleInner, spotlightMiddleAngleOuter);
          float middleLight = spotlightMiddleIntensity * distAttenMiddle * angAttenMiddle;
          
          float spotlightFactor = 1.0 + leftLight + rightLight + middleLight;
          
          vec3 finalColor = texColor.rgb * localColor * localBrightness * spotlightFactor * ${NEON_BOOST.toFixed(1)};
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
// AnimatedSmokeCanvas: Sets up the scene, controls, and renders the smoke.
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
