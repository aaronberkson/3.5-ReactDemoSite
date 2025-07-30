// convert-font.mjs
import fs from "fs"
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader.js"

const ttfPath  = "src/assets/fonts/Focal-Bold-Web.ttf"
const jsonPath = "src/assets/fonts/Focal-Bold-Web.json"

// Read & parse the TTF
const buffer   = fs.readFileSync(ttfPath).buffer
const loader   = new TTFLoader()
const fontJson = loader.parse(buffer, "")

// Write out Three.js font JSON
fs.writeFileSync(jsonPath, JSON.stringify(fontJson, null, 2))
console.log(`✅ ${jsonPath} generated`)
