import React from "react";
import SkillsStaticContent from "./SkillsStaticContent";
import SkillsDynamicCoins from "./SkillsDynamicCoins";

export default function SkillsScene({ width, height }) {
  return (
    <>
      <SkillsStaticContent width={width} height={height} />
      <SkillsDynamicCoins width={width} hexSize={59} />
    </>
  );
}
