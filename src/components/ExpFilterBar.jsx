import React from "react";
import useExpFilterBreakpoint from "../hooks/useExpFilterBreakpoint";
import ExpFilterBarDesktop    from "./ExpFilterBarDesktop";
import ExpFilterBarMobile     from "./ExpFilterBarMobile";

export default function ExpFilterBar({ selectedTag, setSelectedTag }) {
  const isMobile = useExpFilterBreakpoint();
  return isMobile
    ? <ExpFilterBarMobile  selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
    : <ExpFilterBarDesktop selectedTag={selectedTag} setSelectedTag={setSelectedTag} />;
}
