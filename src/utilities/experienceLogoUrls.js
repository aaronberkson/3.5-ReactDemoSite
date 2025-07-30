// src/utilities/experienceLogoUrls.js
// grab all SVG URLs from src/assets/exp-logos for Experience
const experienceLogoUrls = Object.values(
  import.meta.glob("../assets/exp-logos/*.svg", {
    eager:  true,
    query:  "?url",
    import: "default"
  })
);

export default experienceLogoUrls;
