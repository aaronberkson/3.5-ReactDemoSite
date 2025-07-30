// src/three/AnimatedSmokeCanvas.jsx

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import smokeTextureURL from "../assets/smoke/0000.png";

// ← ADD THIS to share the same pause flag as WaveAnimation:
import { useWaveAnimation } from "../contexts/WaveAnimationContext";

// Debug flag for this file
const DEBUG_CONSOLE = false;

// ─────────────────────────────────────────────────────────────
// Helper: Converts a hex color (e.g., "#0000FF") to a GLSL vec3 literal string.
function hexToVec3Literal(hex) {
  if (hex[0] === "#") hex = hex.slice(1);
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  if (DEBUG_CONSOLE) {
    console.log(
      "[IO][AnimatedSmokeCanvas] hexToVec3Literal converts",
      hex,
      "to",
      `vec3(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)})`
    );
  }
  return `vec3(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)})`;
}

// ─────────────────────────────────────────────────────────────
// Global Constants
const BG_COLOR = "#160E30";
const SMOKE_RANGE = 770;
const PARTICLE_COUNT = 180;
const SMOKE_SCALE = 2.25;
const ROTATION_SPEED = 0.19;
const PLANE_SIZE = 330;
const SMOKE_OPACITY = 0.09;
const SMOOTH_EDGE_START = 0.5;
const SMOOTH_EDGE_END = 0.45;
const NEON_BOOST = 2.0;
const CENTER_BRIGHTNESS = 0.25;
const EDGE_BRIGHTNESS = 0.75;
const BRIGHTNESS_EXPONENT = 1.5;

const LEFT_COLOR_HEX = "#0000FF";
const RIGHT_COLOR_HEX = "#FF0000";
const LEFT_COLOR = hexToVec3Literal(LEFT_COLOR_HEX);
const RIGHT_COLOR = hexToVec3Literal(RIGHT_COLOR_HEX);

// Spotlight configuration for the middle spotlight remains unchanged.
const SPOTLIGHT_MIDDLE_Y_OFFSET = 100;
const SPOTLIGHT_MIDDLE_INNER = 0.15 * 4.0;
const SPOTLIGHT_MIDDLE_OUTER = 0.35 * 4.0;
const SPOTLIGHT_MIDDLE_INTENSITY = 3.0;
const SPOTLIGHT_MIDDLE_DIR = new THREE.Vector2(0.0, -1.0);
const SPOTLIGHT_MIDDLE_ANGLE_INNER = THREE.MathUtils.degToRad(0.0);
const SPOTLIGHT_MIDDLE_ANGLE_OUTER = THREE.MathUtils.degToRad(30.0 * 1.5);

// For left/right spotlights, assume a design width of 1280px with 82px margins 
// and 82px gutters. Total available width for cards = 1280 - (4 × 82) = 952px.
// Each card's width ≈ 952 / 3 ≈ 317.33px. 
// Left card center = 82 + (317.33/2) ≈ 240.67px.
// Right card center = 1280 - 240.67 = 1039.33px.
// In the shader, the left spotlight's normalized x is (spotlightLeftOffset.x / uResolution.x)
// and the right is calculated as 1.0 - (spotlightRightOffset.x / uResolution.x).
// Hence, if we set both side spotlights' x offsets to 240.67 (scaled to effective width),
// the normalized left becomes ~240.67/1280 ≈ 0.188 and the right becomes ~1 - 0.188 = 0.812.
// Below a viewport width of 768px (mobile mode), we will disable side spotlights.
  
// ─────────────────────────────────────────────────────────────
// SceneSetup: Sets background and fog.
const SceneSetup = () => {
  const { scene } = useThree();
  useEffect(() => {
    if (DEBUG_CONSOLE) {
      console.log("[IO][AnimatedSmokeCanvas] SceneSetup: Setting scene background to", BG_COLOR);
    }
    scene.background = new THREE.Color(BG_COLOR);
    scene.fog = new THREE.Fog(0xc6efff, 1, 300);
    if (DEBUG_CONSOLE) {
      console.log("[IO][AnimatedSmokeCanvas] SceneSetup: Fog set with color 0xc6efff, near 1, far 300");
    }
  }, [scene]);
  return null;
};

// ─────────────────────────────────────────────────────────────
// SmokeParticles: Loads the smoke texture and renders PARTICLE_COUNT swirls.
const SmokeParticles = () => {
  const { size } = useThree();
  if (DEBUG_CONSOLE) {
    console.log("[IO][AnimatedSmokeCanvas] SmokeParticles: Canvas size:", size);
  }
  // useLoader waits for the texture to load before returning.
  const smokeTexture = useLoader(THREE.TextureLoader, smokeTextureURL);
  useEffect(() => {
    smokeTexture.encoding = THREE.SRGBColorSpace;
    smokeTexture.minFilter = THREE.LinearFilter;
    smokeTexture.magFilter = THREE.LinearFilter;
    if (DEBUG_CONSOLE) {
      console.log("[IO][AnimatedSmokeCanvas] SmokeParticles: smokeTexture loaded and filters set.");
    }
  }, [smokeTexture]);

  // ────────────────────────────────────────────────────────────
  // Part 2: ShaderMaterial setup
  const smokeGeometry = useMemo(() => {
    if (DEBUG_CONSOLE) {
      console.log("[IO][AnimatedSmokeCanvas] SmokeParticles: Creating PlaneGeometry with PLANE_SIZE", PLANE_SIZE);
    }
    return new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);
  }, []);

  const smokeMaterial = useMemo(() => {
    if (DEBUG_CONSOLE) {
      console.log("[IO][AnimatedSmokeCanvas] SmokeParticles: Creating ShaderMaterial for smoke.");
    }
    // Compute effective canvas width (capped at 1280), so design values remain consistent.
    const effectiveWidth = Math.min(size.width, 1280);
    // Determine if we are in mobile mode (viewport width below 768).
    const isMobile = size.width <= 768;
    // Compute left offset based on the design: 240.67px from left edge (of a 1280 design),
    // scaled to effective width.
    const leftOffset = 240.67 * (effectiveWidth / 1280);

    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: smokeTexture },
        opacity: { value: SMOKE_OPACITY },
        // Pass the effective width as horizontal resolution.
        uResolution: { value: new THREE.Vector2(effectiveWidth, size.height) },
        centerBrightness: { value: CENTER_BRIGHTNESS },
        edgeBrightness: { value: EDGE_BRIGHTNESS },
        brightnessExponent: { value: BRIGHTNESS_EXPONENT },
        // For non-mobile mode, side spotlights are enabled.
        spotlightLeftOffset: {
          value: isMobile ? new THREE.Vector2(0, 0) : new THREE.Vector2(leftOffset, 100),
        },
        spotlightLeftInner: { value: 0.10 * 4.0 },
        spotlightLeftOuter: { value: 0.25 * 4.0 },
        spotlightLeftIntensity: { value: isMobile ? 0.0 : 2.0 },
        spotlightLeftDir: { value: new THREE.Vector2(0, -1) },
        spotlightLeftAngleInner: { value: THREE.MathUtils.degToRad(0.0) },
        spotlightLeftAngleOuter: { value: THREE.MathUtils.degToRad(30.0 * 1.5) },
        // For the right spotlight, we mirror the left by specifying the same offset value.
        spotlightRightOffset: {
          value: isMobile ? new THREE.Vector2(0, 0) : new THREE.Vector2(leftOffset, 100),
        },
        spotlightRightInner: { value: 0.10 * 4.0 },
        spotlightRightOuter: { value: 0.30 * 4.0 },
        spotlightRightIntensity: { value: isMobile ? 0.0 : 2.5 },
        spotlightRightDir: { value: new THREE.Vector2(0, -1) },
        spotlightRightAngleInner: { value: THREE.MathUtils.degToRad(0.0) },
        spotlightRightAngleOuter: { value: THREE.MathUtils.degToRad(30.0 * 1.5) },
        // The middle spotlight remains active in all cases.
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
          vScreenPos = ndc * 0.5 + 0.5;
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
        uniform vec2 spotlightLeftOffset;
        uniform float spotlightLeftInner;
        uniform float spotlightLeftOuter;
        uniform float spotlightLeftIntensity;
        uniform vec2 spotlightLeftDir;
        uniform float spotlightLeftAngleInner;
        uniform float spotlightLeftAngleOuter;
        uniform vec2 spotlightRightOffset;
        uniform float spotlightRightInner;
        uniform float spotlightRightOuter;
        uniform float spotlightRightIntensity;
        uniform vec2 spotlightRightDir;
        uniform float spotlightRightAngleInner;
        uniform float spotlightRightAngleOuter;
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
          
          vec2 spotLeftPos = vec2(spotlightLeftOffset.x / uResolution.x, 1.0 - (spotlightLeftOffset.y / uResolution.y));
          float distAttenLeft = getDistanceAtten(vScreenPos, spotLeftPos, spotlightLeftInner, spotlightLeftOuter);
          float angAttenLeft = getAngularAtten(vScreenPos, spotLeftPos, spotlightLeftDir, spotlightLeftAngleInner, spotlightLeftAngleOuter);
          float leftLight = spotlightLeftIntensity * distAttenLeft * angAttenLeft;
          
          vec2 spotRightPos = vec2(1.0 - (spotlightRightOffset.x / uResolution.x), 1.0 - (spotlightRightOffset.y / uResolution.y));
          float distAttenRight = getDistanceAtten(vScreenPos, spotRightPos, spotlightRightInner, spotlightRightOuter);
          float angAttenRight = getAngularAtten(vScreenPos, spotRightPos, spotlightRightDir, spotlightRightAngleInner, spotlightRightAngleOuter);
          float rightLight = spotlightRightIntensity * distAttenRight * angAttenRight;
          
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

  // ─────────────────────────────────────────────────────────────
  // generate particle array
  const particles = useMemo(() => {
    if (DEBUG_CONSOLE) {
      console.log("[IO][AnimatedSmokeCanvas] SmokeParticles: Generating", PARTICLE_COUNT, "particles.");
    }
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

  // ─────────────────────────────────────────────────────────────
  // surgical replacement of SmokeElement with pause logic
  const SmokeElement = ({ position, rotationZ }) => {
    const meshRef = useRef();
    const { isPaused } = useWaveAnimation();        // ← same pause flag
    const firstFrameLogged = useRef(false);

    useFrame((state, delta) => {
      if (isPaused) return;                         // ← bail out while paused

      if (meshRef.current) {
        meshRef.current.rotation.z += delta * ROTATION_SPEED;
        if (!firstFrameLogged.current && DEBUG_CONSOLE) {
          console.log(
            "[IO][AnimatedSmokeCanvas] SmokeElement: First useFrame call for a particle at position",
            position,
            "delta:",
            delta
          );
          firstFrameLogged.current = true;
        }
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

  // render all particles
  return (
    <>
      {particles.map((p, i) => (
        <SmokeElement key={i} position={p.position} rotationZ={p.rotationZ} />
      ))}
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// AnimatedSmokeCanvas: Renders the smoke scene. It now accepts an onReady callback,
// which is invoked after the Canvas is created and two animation frames have been rendered.
const AnimatedSmokeCanvas = ({ onReady }) => {
  if (DEBUG_CONSOLE) {
    console.log("[IO][AnimatedSmokeCanvas] Rendering AnimatedSmokeCanvas component.");
  }
  return (
    <Canvas
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      camera={{ position: [0, 0, 1000], fov: 75 }}
      onCreated={(state) => {
        if (DEBUG_CONSOLE) {
          console.log("[IO][AnimatedSmokeCanvas] Canvas onCreated callback triggered.", state);
        }
        // Wait for two animation frames for a warm-up before calling onReady
        requestAnimationFrame(() => {
          if (DEBUG_CONSOLE) {
            console.log("[IO][AnimatedSmokeCanvas] First animation frame after Canvas creation.");
          }
          requestAnimationFrame(() => {
            if (DEBUG_CONSOLE) {
              console.log("[IO][AnimatedSmokeCanvas] Second animation frame after Canvas creation. Calling onReady callback.");
            }
            if (onReady) onReady();
          });
        });
      }}
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