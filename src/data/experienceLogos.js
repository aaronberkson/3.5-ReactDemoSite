// src/data/experienceLogos.js

import marshURL     from "../assets/exp-logos/exp-logo-marsh.svg"
import cbsURL       from "../assets/exp-logos/exp-logo-cbsnews.svg"
import blawURL      from "../assets/exp-logos/exp-logo-blaw-twotone.svg"
import schwabURL    from "../assets/exp-logos/exp-logo-schwab-long.svg"
import rfishURL     from "../assets/exp-logos/exp-logo-razorfish-now.svg"
import bloombergURL from "../assets/exp-logos/exp-logo-bloomberg-terminal-twotone.svg"
import pruURL       from "../assets/exp-logos/exp-logo-pru-blue.svg"
import novartisURL  from "../assets/exp-logos/exp-logo-novartis.svg"
import christiesURL from "../assets/exp-logos/exp-logo-christies-long-simple.svg"
import nbcuURL      from "../assets/exp-logos/exp-logo-nbcu.svg"
import kpmgURL      from "../assets/exp-logos/exp-logo-kpmg.svg"
import cogniacURL   from "../assets/exp-logos/exp-logo-cogniac.svg"
import instinetURL  from "../assets/exp-logos/exp-logo-instinet.svg"
import bnyURL       from "../assets/exp-logos/exp-logo-bny.svg"
import digitalisURL from "../assets/exp-logos/exp-logo-digitalis.svg"
import toyotaURL    from "../assets/exp-logos/exp-logo-toyota.svg"
import avayaURL     from "../assets/exp-logos/exp-logo-avaya.svg"
import starwoodURL  from "../assets/exp-logos/exp-logo-starwood.svg"

// your tag list
export const ALL_TAGS = [
  "All",
  "Artificial Intelligence",
  "B2B",
  "B2C",
  "Data Viz",
  "FinTech",
  "Legal",
  "Luxury",
  "Media",
  "Pharma",
  "SaaS",
  "Tech",
  "Travel"
]

// your full logo definitions
const logos = [
  { svgPath: rfishURL,      link: "https://www.razorfish.com/",       tags: ["B2B","B2C","Media","Data Viz","FinTech"],                                     scale: 0.3,   tiltX: 0.25, sideBrightness: 0.22 },
  { svgPath: bloombergURL,  link: "https://www.bloomberg.com/",       tags: ["B2B","FinTech","Media","Artificial Intelligence","Data Viz","SaaS","Tech"],   scale: 0.3,   tiltX: 0.25, sideBrightness: 0.36 },
  { svgPath: blawURL,       link: "https://pro.bloomberglaw.com/",    tags: ["B2B","Legal","Artificial Intelligence","Data Viz","SaaS","Tech"],             scale: 0.3,   tiltX: 0.25, sideBrightness: 0.36 },
  { svgPath: schwabURL,     link: "https://www.schwab.com/",          tags: ["B2C","FinTech"],                                                              scale: 0.3,   tiltX: 0.25, sideBrightness: 0.5  },
  { svgPath: cbsURL,        link: "https://www.cbsnews.com/",         tags: ["B2C","Media"],                                                                scale: 0.3,   tiltX: 0.25, sideBrightness: 0.33 },
  { svgPath: nbcuURL,       link: "https://www.nbcuniversal.com/",    tags: ["B2C","Media"],                                                                scale: 0.3,   tiltX: 0.25, sideBrightness: 0.26 },
  { svgPath: pruURL,        link: "https://www.prudential.com/",      tags: ["B2C","FinTech"],                                                              scale: 0.3,   tiltX: 0.25, sideBrightness: 0.33 },
  { svgPath: marshURL,      link: "https://www.marshmclennan.com/",   tags: ["B2B","FinTech"],                                                              scale: 0.3,   tiltX: 0.25, sideBrightness: 0.44 },
  { svgPath: christiesURL,  link: "https://www.christies.com/",       tags: ["B2C","Luxury"],                                                               scale: 0.3,   tiltX: 0.25, sideBrightness: 0.33 },
  { svgPath: toyotaURL,     link: "https://www.toyota.com/",          tags: ["B2C"],                                                                        scale: 0.31,  tiltX: 0.25, sideBrightness: 0.33 },
  { svgPath: digitalisURL,  link: "https://www.digitalis.com/",       tags: ["B2B","Legal","Artificial Intelligence","Data Viz","SaaS","Tech",],             scale: 0.255, tiltX: 0.25, sideBrightness: .22  },
  { svgPath: cogniacURL,    link: "https://www.cogniac.ai/",          tags: ["B2B","Artificial Intelligence","Data Viz","SaaS","Tech"],                     scale: 0.33,  tiltX: 0.25, sideBrightness: 0.44 },
  { svgPath: novartisURL,   link: "https://www.novartis.com/",        tags: ["B2B","Pharma"],                                                               scale: 0.31,  tiltX: 0.25, sideBrightness: 0.5  },
  { svgPath: avayaURL,      link: "https://www.avaya.com/",           tags: ["B2B","Tech"],                                                                 scale: 0.3,   tiltX: 0.25, sideBrightness: 0.5  },
  { svgPath: starwoodURL,   link: "https://www.starwoodhotels.com/",  tags: ["B2C","Travel"],                                                               scale: 0.3,   tiltX: 0.25, sideBrightness: 0.25 },
  { svgPath: kpmgURL,       link: "https://www.kpmg.com/",            tags: ["B2B","FinTech"],                                                              scale: 0.285, tiltX: 0.25, sideBrightness: 0.33 },
  { svgPath: bnyURL,        link: "https://www.bny.com/",             tags: ["B2C","FinTech"],                                                              scale: 0.16,  tiltX: 0.25, sideBrightness: 0.33 },
  { svgPath: instinetURL,   link: "https://www.instinet.com/",        tags: ["B2B","FinTech","Data Viz","SaaS"],                                            scale: 0.265, tiltX: 0.25, sideBrightness: .5   },

]

export default logos