import React from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Environment, OrthographicCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import SkillsHexMultiGlow from "./SkillsHexMultiGlow";
import SkillsHex from "./SkillsHex";

const HEX_SIZE = 59;

export default React.memo(function SkillsStaticContent({ width, height }) {
  const { size, camera, gl } = useThree();

  // adjust camera projection and tone mapping
  React.useLayoutEffect(() => {
    camera.left = -size.width / 2;
    camera.right = size.width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.near = -1000;
    camera.far = 1000;
    camera.updateProjectionMatrix();

    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.2;
  }, [size.width, height, camera, gl]);

  return (
    <>
      <Environment preset="night" background={false} intensity={1.5} rotation={[0, Math.PI / 4, 0]} />

      <OrthographicCamera
        makeDefault
        left={-size.width / 2}
        right={size.width / 2}
        top={height / 2}
        bottom={-height / 2}
        near={-1000}
        far={1000}
        position={[0, 0, 500]}
        zoom={1}
      />

      <ambientLight intensity={0.3} />
      <hemisphereLight skyColor={0xffffff} groundColor={0x444444} intensity={0.3} />
      <directionalLight color={0xffffff} intensity={0.6} position={[50, 50, 100]} />

      <SkillsHexMultiGlow width={width} height={height} hexSize={HEX_SIZE} />
      <SkillsHex width={width} height={height} hexSize={HEX_SIZE} />

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
