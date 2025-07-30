// src/components/MessageModal.jsx
import React, { useState, useEffect }       from "react"
import ReactDOM                              from "react-dom"
import { motion, AnimatePresence }           from "framer-motion"
import { Form }                              from "react-bootstrap"
import { FontAwesomeIcon }                   from "@fortawesome/react-fontawesome"
import { faCircleXmark, faPaperPlane, faHandshakeSimple } from "@fortawesome/free-solid-svg-icons"
import { useReactMediaRecorder }             from "react-media-recorder"
import { useWaveAnimation }                  from "../contexts/WaveAnimationContext"
import { getDecryptedEmail }                 from "../utilities/emailUtility"

import {
  BsPersonCircle,
  BsEnvelopeAt,
  BsChatLeftTextFill,
  BsMicFill,
  BsPatchQuestion
} from "react-icons/bs"
import VoiceRecorder                         from "./VoiceRecorder"

const DEBUG_CONSOLE = false;

const MODAL_MIN_HEIGHT = 500;       
const MAX_MODAL_WIDTH = 600;
const FIELD_PADDING = "0.5rem .5rem"
const MSG_ICON_TOP_OFFSET = "0.7rem"
const SEND_BUTTON_WIDTH   = "200px"

// slightly darker but still brighter than your main dark overlay
const CONFIRM_OVERLAY_BG   = "rgba(0, 255, 255, 0.15)"  
const CONFIRM_ICON_SIZE    = "3.3rem"
const MODAL_BORDER_RADIUS  = "8px"
const HANDSHAKE_ICON_SIZE = "4rem";

// metal-plate brightness
const BG_BRIGHTNESS     = 0.66
// indent for close button
const CLOSE_BTN_PADDING = 18
// ── SPACING & SIZES ──
const TITLE_INSTR_GAP     = "8px"   // gap between title & instructions
const TITLE_FONT_SIZE     = "2rem"  // size of “Contact Me”
const BASE_FONT_SIZE      = "1rem"  // shared size for instructions & email

// ── FONT FAMILIES ──
const INSTR_FONT_FAMILY   = "var(--font-focal-medium)"
const EMAIL_FONT_FAMILY   = "var(--font-focal-extrabold)"

// ── EMAIL TEXT STYLES ──
// black shadow layer
const EMAIL_SHADOW_STYLE = {
  position:    "absolute",
  top:         "1px",
  left:        "-1px",
  zIndex:      0,
  color:       "#000",
  fontFamily:  EMAIL_FONT_FAMILY,
  fontSize:    BASE_FONT_SIZE,
  whiteSpace:  "nowrap"
}

// gradient-filled front layer
const EMAIL_FRONT_STYLE = {
  position:             "relative",
  zIndex:               1,
  display:              "inline-block",
  background:           "linear-gradient(180deg, #00F5FF 0%, #33EFFF 50%, #66CCCC 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip:       "text",
  WebkitTextFillColor:  "transparent",
  textDecoration:       "none",
  cursor:               "pointer",
  fontFamily:           EMAIL_FONT_FAMILY,
  fontWeight:           "bold",
  fontSize:             BASE_FONT_SIZE
}

// FULLY REGULAR INPUT STYLE
const FORM_CONTROL_STYLE = {
  fontFamily: "var(--font-focal-regular)",
  fontStyle:  "normal",
  fontWeight: "400",   // ensure it isn’t bold or italic
  // any other shared form-control styles you already have:
  width:       "100%",
  padding:     "0.5rem",
  border:      "1px solid #ccc",
  borderRadius:"4px"
}

// styling constants
const SPACER_WIDTH       = "0.5rem"
const MODAL_BORDER_COLOR = "#aaa"
const MODAL_SHADOW       = "0 8px 24px rgba(0,0,0,0.2)"
const BTN_HEIGHT         = "40px"
const BTN_GRADIENT       = "linear-gradient(to bottom, #0d6efd, #0a58ca)"
const MODAL_BG_GRADIENT  = "linear-gradient(135deg, #c0c0c0, #f0f0f0)"

const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 }
}
const modalVariants = {
  hidden:  { scale: 0.8, opacity: 0 },
  visible: { scale: 1,   opacity: 1, transition: { duration: 0.3 } },
  exit:    { scale: 0.8, opacity: 0, transition: { duration: 0.2 } }
}

export default function MessageModal({ isOpen, onClose }) {
  const { setIsPaused }            = useWaveAnimation()
  const [localOpen, setLocalOpen]  = useState(isOpen)
  useEffect(() => {
    setLocalOpen(isOpen)
    setIsPaused(isOpen)
  }, [isOpen, setIsPaused])

  const handleExitComplete = () => {
    if (!localOpen) onClose()
    setIsPaused(false)
  }

  // form state
  const [name, setName]           = useState("")
  const [email, setEmail]         = useState("")
  const [message, setMessage]     = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)

  // voice recorder
  const {
    status:       voiceStatus,
    startRecording,
    stopRecording,
    mediaBlobUrl: hookBlobUrl,
    clearBlob:    hookClear
  } = useReactMediaRecorder({ audio: true })
  const [mediaBlobUrl, setMediaBlobUrl] = useState(hookBlobUrl)
  const [recorderKey, setRecorderKey]   = useState(0)
  useEffect(() => setMediaBlobUrl(hookBlobUrl), [hookBlobUrl])
  function clearRecording() {
    hookClear?.()
    setMediaBlobUrl(undefined)
    setRecorderKey(k => k + 1)
  }

  // derived flags
  const hasVoice = voiceStatus === "stopped" && Boolean(mediaBlobUrl)

  const canSend =
    name.trim() &&
    email.trim() &&
    (message.trim() || Boolean(mediaBlobUrl));

  const isDraft  = name || email || message || hasVoice

  // close helpers
  function reallyClose() {
    clearRecording()
    setName(""); setEmail(""); setMessage("")
    setSubmitted(false)
    setConfirmClose(false)
    setLocalOpen(false)
  }
  function handleAttemptClose() {
    isDraft ? setConfirmClose(true) : reallyClose()
  }
  function handleConfirmYes() {
    reallyClose()
  }
  useEffect(() => {
    const onEsc = e => e.key === "Escape" && handleAttemptClose()
    if (localOpen) window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [localOpen, isDraft])

  // submit handler
async function handleSubmit(e) {
  e.preventDefault();
  if (DEBUG_CONSOLE) console.log("[IO][message] 🔥 handleSubmit start", {
    name,
    email,
    message,
    mediaBlobUrl,
    canSend
  });

  if (!canSend) {
    if (DEBUG_CONSOLE) console.log("[IO][message] ⛔ canSend false—aborting");
    return;
  }

  // HARD-CODED endpoint to match FeedbackBubble
  const API = import.meta.env.VITE_FEEDBACK_API;
  if (DEBUG_CONSOLE) console.log("[IO][message] → will POST to", API);

  try {
    // 1) Build base payload
    const payload = {
      formType: "message",
      name:     name.trim(),
      email:    email.trim(),
      msg:      message.trim()
    };

    // 2) Attach voice if present, using the same pattern as FeedbackBubble
// ─── AFTER ───
// replace the above with this FileReader-based version
if (mediaBlobUrl) {
  if (DEBUG_CONSOLE) console.log("[IO][message] fetching blob from", mediaBlobUrl);
  const blob = await fetch(mediaBlobUrl).then(r => r.blob());
  const ext  = blob.type.split("/")[1] || "webm";

  // ✅ convert via FileReader to avoid call-stack issues
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload  = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
  const b64 = dataUrl.split(",")[1];  // drop "data:*/*;base64,"

  payload.voice         = b64;
  payload.voiceFilename = `message.${ext}`;
  payload.voiceMime     = blob.type;
  if (DEBUG_CONSOLE) console.log("[IO][message] voice fields:", payload.voiceFilename, payload.voiceMime);
}

    // 3) POST to your Lambda
    if (DEBUG_CONSOLE)console.log("[IO][message] executing fetch…");
    const res = await fetch(API, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload)
    });
    if (DEBUG_CONSOLE) console.log(
      "[IO][message] ← fetch returned status",
      res.status,
      res.statusText
    );

    // 4) Read response text, since your Lambda doesn’t always JSON
    const text = await res.text();
    if (DEBUG_CONSOLE) console.log("[IO][message] ← response text:", text);

    if (res.ok) {
      if (DEBUG_CONSOLE) console.log("[IO][message] ✅ success—calling setSubmitted");
      setSubmitted(true);
    } else {
      if (DEBUG_CONSOLE) console.warn("[IO][message] ⚠ non-OK response");
      alert("Send failed: " + text);
    }
  } catch (err) {
    if (DEBUG_CONSOLE) console.error("[IO][message] ❌ handleSubmit error:", err);
    alert("Error sending message: " + (err.message || err));
  } finally {
    if (DEBUG_CONSOLE) console.log("[IO][message] 🧹 finally—clearing recorder");
    clearRecording();
  }
}



  // clickable, gradient email
  const alias     = getDecryptedEmail()
  // const emailLink = (
  //   <a href={`mailto:${alias}`} style={GLOW_TEXT_STYLE}>
  //     {alias}
  //   </a>
  // )

  // styles
  const containerStyle = {
    width:         "90vw",
    maxWidth:      MAX_MODAL_WIDTH,
    maxHeight:     "90vh",
    overflowY:     "auto",
    borderRadius:  "16px",
    border:        `2px solid ${MODAL_BORDER_COLOR}`,
    boxShadow:     MODAL_SHADOW,
    position:      "relative",
    padding:       "2rem",
    overflow:      "hidden",
    background:    MODAL_BG_GRADIENT
  }
  const formGridStyle = {
    display:             "grid",
    gridTemplateColumns: `auto ${SPACER_WIDTH} 1fr`,
    rowGap:              "1rem",
    alignItems:          "center",
    marginBottom:        "1.5rem"
  }
  const iconStyle = {
    width:      "24px",
    height:     "24px",
    flexShrink: 0
  }
  const inputStyle = {
    fontFamily: "var(--font-focal-regular-italic)",
    fontSize:   "1rem",
    color:      "#000"
  }

return ReactDOM.createPortal(
  <AnimatePresence onExitComplete={handleExitComplete}>
    {localOpen && (
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          position:            "fixed",
          top:                 0,
          left:                0,
          width:               "100vw",
          height:              "100vh",
          background:          "rgba(0,0,0,0.5)",
          display:             "flex",
          alignItems:          "center",
          justifyContent:      "center",
          backdropFilter:      "blur(8px)",
          WebkitBackdropFilter:"blur(8px)",
          zIndex:              10000
        }}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            ...containerStyle,
            position:     "relative",
            overflow:     "hidden",
            padding:      0,
            borderRadius: MODAL_BORDER_RADIUS,
            minHeight:    MODAL_MIN_HEIGHT
          }}
        >
          {/* ── METAL-PLATE SVG BACKGROUND ── */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 841.89 595.167"
            preserveAspectRatio="xMidYMid slice"
            style={{
              position:      "absolute",
              top:           0,
              left:          0,
              width:         "100%",
              height:        "100%",
              pointerEvents: "none",
              filter:        `brightness(${BG_BRIGHTNESS})`,
              zIndex:        0
            }}
          >
            <defs>
              <linearGradient id="metalGrad" x1="655.063" y1="-107.921" x2="186.827" y2="703.088" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#6d6e71"/>
                <stop offset=".113" stopColor="#75777a"/>
                <stop offset=".292" stopColor="#808285"/>
                <stop offset=".42" stopColor="#757679"/>
                <stop offset=".571" stopColor="#6d6e71"/>
                <stop offset=".772" stopColor="#6d6e71"/>
                <stop offset=".838" stopColor="#737476"/>
                <stop offset=".927" stopColor="#848587"/>
                <stop offset="1" stopColor="#98999b"/>
              </linearGradient>
              <linearGradient
                id="metalGrad1"
                x1="420.945"
                y1="595.28"
                x2="420.945"
                y2="0"
                gradientTransform="translate(0 595.28) scale(1 -1)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#414042"/>
                <stop offset=".116" stopColor="#6d6e71"/>
                <stop offset=".216" stopColor="#86878a"/>
                <stop offset=".25" stopColor="#8c8d90"/>
                <stop offset=".31" stopColor="#939598"/>
                <stop offset=".415" stopColor="#a0a1a4"/>
                <stop offset=".466" stopColor="#a9aaad"/>
                <stop offset=".601" stopColor="#d5d6d7"/>
                <stop offset=".715" stopColor="#fff"/>
                <stop offset=".752" stopColor="#fff"/>
                <stop offset=".797" stopColor="#eaeaea"/>
                <stop offset=".89" stopColor="#b5b5b5"/>
                <stop offset="1" stopColor="#6e6e6e"/>
              </linearGradient>
            </defs>
            <g isolation="isolate">
              <g id="Stainless_plate">
                <rect y="-0.057" width="841.89" height="595.28" fill="url(#metalGrad)" opacity="0.5"/>
                <rect
                  y="0"
                  width="841.89"
                  height="595.28"
                  transform="translate(841.89 595.28) rotate(180)"
                  fill="url(#metalGrad1)"
                  style={{ mixBlendMode: "overlay" }}
                />
              </g>
            </g>
          </svg>

          {/* ── CONTENT WRAPPER ── */}
          <div
            style={{
              position:       "absolute",
              top:            0,
              left:           0,
              width:          "100%",
              height:         "100%",
              zIndex:         1,
              display:        "flex",
              flexDirection:  "column",
              justifyContent: "center",
              alignItems:     "center",
              padding:        "2rem",
              color:          "#fff"
            }}
          >
            {/* ── TOP-RIGHT CLOSE “X” ── */}
            <motion.button
              onClick={() => (submitted ? reallyClose() : handleAttemptClose())}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                position:   "absolute",
                top:        `${CLOSE_BTN_PADDING}px`,
                right:      `${CLOSE_BTN_PADDING}px`,
                background: "none",
                border:     "none",
                cursor:     "pointer",
                color:      "#fff",
                fontSize:   "1.5rem",
                zIndex:     2
              }}
            >
              <FontAwesomeIcon icon={faCircleXmark}/>
            </motion.button>

            {/* ── PRE-SUBMIT: HEADER + INSTRUCTIONS + FORM ── */}
            {!submitted && (
              <>
                <h2 style={{
                  textAlign:  "center",
                  margin:     `0 0 ${TITLE_INSTR_GAP}`,
                  fontFamily: "var(--font-focal-bold)",
                  fontSize:   TITLE_FONT_SIZE
                }}>
                  Contact Me
                </h2>
                <p style={{
                  margin:      "0 0 1.5rem",
                  textAlign:   "center",
                  fontFamily:  INSTR_FONT_FAMILY,
                  fontSize:    BASE_FONT_SIZE
                }}>
                  Email{" "}
                  <span style={{ position: "relative", display: "inline-block" }}>
                    <span style={EMAIL_SHADOW_STYLE}>{alias}</span>
                    <a href={`mailto:${alias}`} style={EMAIL_FRONT_STYLE}>
                      {alias}
                    </a>
                  </span>{" "}
                  or fill out the form below.
                </p>

                <Form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 510 }}>
                  <div style={formGridStyle}>
                    {/* Name */}
                    <BsPersonCircle style={iconStyle}/>
                    <div/>
                    <Form.Control
                      type="text"
                      placeholder="Your name…"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      style={{ ...inputStyle, padding: FIELD_PADDING }}
                    />

                    {/* Email */}
                    <BsEnvelopeAt style={iconStyle}/>
                    <div/>
                    <Form.Control
                      type="email"
                      placeholder="Your email…"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      style={{ ...inputStyle, padding: FIELD_PADDING }}
                    />

                    {/* Message: top-aligned chat icon */}
                    <BsChatLeftTextFill
                      style={{
                        ...iconStyle,
                        alignSelf: "flex-start",
                        marginTop: MSG_ICON_TOP_OFFSET
                      }}
                    />
                    <div/>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Your message…"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required={!mediaBlobUrl}
                      style={{
                        ...inputStyle,
                        padding: FIELD_PADDING,
                        resize:  "vertical"
                      }}
                    />
                    {/* Voice Memo */}
                    <BsMicFill style={iconStyle}/>
                    <div/>
                    <VoiceRecorder
                      status={voiceStatus}
                      startRecording={startRecording}
                      stopRecording={stopRecording}
                      clearBlob={clearRecording}
                      mediaBlobUrl={mediaBlobUrl}
                      mode="message"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={!canSend}
                    whileHover={canSend ? { filter: "brightness(0.9)" } : {}}
                    whileTap={canSend ? { filter: "brightness(0.8)" } : {}}
                    style={{
                      width:        SEND_BUTTON_WIDTH,
                      margin:       "1rem auto 0",
                      height:       BTN_HEIGHT,
                      padding:      "0 1.5rem",
                      background:   BTN_GRADIENT,
                      border:       "none",
                      borderRadius: "8px",
                      color:        "#fff",
                      fontFamily:   "var(--font-focal-medium)",
                      fontSize:     "1rem",
                      cursor:       canSend ? "pointer" : "not-allowed",
                      opacity:      canSend ? 1 : 0.6,
                      display:      "block"
                    }}
                  >
                    <FontAwesomeIcon icon={faPaperPlane}/> Send Message
                  </motion.button>
                </Form>
              </>
            )}

            {/* ── POST-SUBMIT: THANK YOU SCREEN ── */}
            {submitted && (
              <div
                style={{
                  display:       "flex",
                  flexDirection: "column",
                  alignItems:    "center",
                  justifyContent:"center",
                  textAlign:     "center",
                  width:         "100%",
                  height:        "100%"
                }}
              >
                <FontAwesomeIcon
                  icon={faHandshakeSimple}
                  style={{
                    fontSize:     HANDSHAKE_ICON_SIZE,
                    color:        "#fff",
                    marginBottom: "1.5rem"
                  }}
                />

                <div style={{
                  fontFamily: "var(--font-focal-medium)",
                  fontSize:   "1.75rem",
                  marginBottom:"0.5rem"
                }}>
                  Thanks for your message!
                </div>
                <div style={{
                  fontFamily: "var(--font-focal-regular)",
                  fontSize:   "1.125rem",
                  marginBottom:"1.5rem"
                }}>
                  I’ll be in touch soon.
                </div>

                <motion.button
                  onClick={reallyClose}
                  whileHover={{ filter: "brightness(0.9)" }}
                  whileTap={{ filter: "brightness(0.8)" }}
                  style={{
                    width:        "100%",
                    maxWidth:     220,
                    height:       BTN_HEIGHT,
                    background:   BTN_GRADIENT,
                    border:       "none",
                    borderRadius: "8px",
                    color:        "#fff",
                    fontFamily:   "var(--font-focal-bold)",
                    fontSize:     "1rem",
                    cursor:       "pointer"
                  }}
                >
                  Close
                </motion.button>
              </div>
            )}

{/* ── MINI-MODAL CONFIRM (pre-submit only) ── */}
{!submitted && confirmClose && (
  <>
    {/* backdrop */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position:             "absolute",
        inset:                0,
        background:           CONFIRM_OVERLAY_BG,
        backdropFilter:       "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex:               2
      }}
    />

    {/* confirm card */}
    <div
      style={{
        position:     "absolute",
        top:          "50%",
        left:         "50%",
        transform:    "translate(-50%, -50%)",
        width:        "90%",
        maxWidth:     "360px",
        background:   "#fff",
        borderRadius: MODAL_BORDER_RADIUS,
        padding:      "1.5rem",
        boxShadow:    "0 8px 24px rgba(0,0,0,0.12)",
        zIndex:       3
      }}
    >
      <div
        style={{
          display:      "flex",
          alignItems:   "center",
          marginBottom: "1rem"
        }}
      >
        <BsPatchQuestion
          style={{
            fontSize:    "2.5rem",
            color:       "#444",
            marginRight: "1rem"
          }}
        />
        <div style={{ color: "#333", textAlign: "left" }}>
          <div
            style={{
              fontFamily:  "var(--font-focal-bold)",
              fontSize:    "1.05rem",
              marginBottom:"0.25rem"
            }}
          >
            Are you sure you want to close?
          </div>
          <div
            style={{
              fontFamily: "var(--font-focal-regular)",
              fontSize:   "0.95rem"
            }}
          >
            Your unsent message will be lost.
          </div>
        </div>
      </div>

      {/* buttons side-by-side */}
      <div
        style={{
          display:        "flex",
          justifyContent: "space-between",
          gap:            "1rem"
        }}
      >
        <motion.button
          onClick={() => setConfirmClose(false)}
          whileHover={{ filter: "brightness(0.95)" }}
          whileTap={{    scale: 0.98, filter: "brightness(0.90)" }}
          style={{
            flex:         1,
            padding:      "0.75rem",
            background:   "#eee",
            color:        "#333",
            border:       "none",
            borderRadius: "4px",
            cursor:       "pointer",
            fontFamily:   "var(--font-focal-bold)",
            fontSize:     "1rem"
          }}
        >
          Cancel
        </motion.button>

        <motion.button
          onClick={reallyClose}
          whileHover={{ filter: "brightness(0.95)" }}
          whileTap={{    scale: 0.98, filter: "brightness(0.90)" }}
          style={{
            flex:         1,
            padding:      "0.75rem",
            background:   "#d9534f",
            color:        "#fff",
            border:       "none",
            borderRadius: "4px",
            cursor:       "pointer",
            fontFamily:   "var(--font-focal-bold)",
            fontSize:     "1rem"
          }}
        >
          Close
        </motion.button>
      </div>
    </div>
  </>
)}


          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>,
  document.body
);


}
