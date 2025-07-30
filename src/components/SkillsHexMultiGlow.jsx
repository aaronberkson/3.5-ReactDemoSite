// src/components/SkillsHexMultiGlow.jsx
import React, { useState, useEffect, useMemo } from "react"
import SkillsHexGlow,
       { DEFAULT_PALETTE, SPEED_FACTOR_MIN, SPEED_FACTOR_MAX }
  from "./SkillsHexGlow"

// ─────────────── CONFIGURATION ───────────────
// how many glows to create (inclusive)
const COUNT_MIN    = 8
const COUNT_MAX    = 16

// how many seconds between each spawn (inclusive)
const STAGGER_MIN  = 1   // seconds
const STAGGER_MAX  = 3   // seconds

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

// helper to mount a glow after a delay
function DelayedGlow({ delay, color, speedFactor, ...props }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const handle = setTimeout(() => setReady(true), delay * 1000)
    return () => clearTimeout(handle)
  }, [delay])
  return ready
    ? <SkillsHexGlow color={color} speedFactor={speedFactor} {...props} />
    : null
}

export default function SkillsHexMultiGlow(props) {
  // decide once how many glows we'll have
  const count = useMemo(
    () => Math.floor(randomBetween(COUNT_MIN, COUNT_MAX + 1)),
    []
  )

  // build an array of { delay, color, speedFactor }, with first glow at delay=0
  const glows = useMemo(() => {
    let sum = 0
    let lastColor = null
    let lastSpeed = null
    const arr = []

    for (let i = 0; i < count; i++) {
      // accumulate stagger for every glow
      sum += randomBetween(STAGGER_MIN, STAGGER_MAX)

      // pick a color different from the last
      let color
      do {
        color = DEFAULT_PALETTE[
          Math.floor(Math.random() * DEFAULT_PALETTE.length)
        ]
      } while (color === lastColor)
      lastColor = color

      // pick a speedFactor different from the last
      let speed
      do {
        speed = randomBetween(SPEED_FACTOR_MIN, SPEED_FACTOR_MAX)
      } while (speed === lastSpeed)
      lastSpeed = speed

      arr.push({ delay: sum, color, speedFactor: speed })
    }

    // remove any delay for the very first glow
    if (arr.length > 0) {
      arr[0].delay = 0
    }

    return arr
  }, [count])

  return (
    <>
      {glows.map(({ delay, color, speedFactor }, i) => (
        <DelayedGlow
          key={i}
          delay={delay}
          color={color}
          speedFactor={speedFactor}
          {...props}
        />
      ))}
    </>
  )
}
