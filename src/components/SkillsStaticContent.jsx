// src/components/SkillsStaticContent.jsx
import React, { useLayoutEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Environment, OrthographicCamera, Preload } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import SkillsHexMultiGlow from "./SkillsHexMultiGlow";
import SkillsHex from "./SkillsHex";

const HEX_SIZE = 59;

export default React.memo(function SkillsStaticContent({ width, height, active }) {
  const { size, camera, gl, invalidate } = useThree();
  const hasInitialized = useRef(false);

  // adjust camera projection and tone mapping before first render
  useLayoutEffect(() => {
    camera.left   = -size.width / 2;
    camera.right  =  size.width / 2;
    camera.top    =  height / 2;
    camera.bottom = -height / 2;
    camera.near   = -1000;
    camera.far    =  1000;
    camera.updateProjectionMatrix();

    gl.toneMapping         = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.2;

    // trigger one render to compile shaders
    if (!hasInitialized.current) {
      invalidate();
      hasInitialized.current = true;
    }
  }, [size.width, height, camera, gl, invalidate]);

  // pause render loop when not active
  useFrame(() => {
    if (!active) gl.setAnimationLoop(null);
    else gl.setAnimationLoop(() => {});
  });

  return (
    <>
      {/* preload environment textures & lighting */}
      <Environment
        preset="night"
        background={false}
        intensity={1.5}
        rotation={[0, Math.PI / 4, 0]}
      />

      {/* orthographic camera setup */}
      <OrthographicCamera
        makeDefault
        left={-size.width / 2}
        right={ size.width / 2}
        top={ height / 2}
        bottom={-height / 2}
        near={-1000}
        far={ 1000}
        position={[0, 0, 500]}
        zoom={1}
      />

      {/* lights */}
      <ambientLight intensity={0.3} />
      <hemisphereLight
        skyColor={0xffffff}
        groundColor={0x444444}
        intensity={0.3}
      />
      <directionalLight
        color={0xffffff}
        intensity={0.6}
        position={[50, 50, 100]}
      />

      {/* your hexagon meshes */}
      <SkillsHexMultiGlow
        width={width}
        height={height}
        hexSize={HEX_SIZE}
      />
      <SkillsHex
        width={width}
        height={height}
        hexSize={HEX_SIZE}
      />

      {/* force pre-compilation of all materials/shaders */}
      <Preload all />

      {/* bloom postprocessing */}
      <EffectComposer multisampling={4}>
        <Bloom
          kernelSize={KernelSize.SMALL}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.1}
          intensity={1.2}
        />
      </EffectComposer>
    </>
  );
});
