// src/components/FeedbackBubble.jsx
import React, { useState, useEffect, useRef } from "react"
import { motion }                           from "framer-motion"
import { Button, Form }                     from "react-bootstrap"
import { FontAwesomeIcon }                  from "@fortawesome/react-fontawesome"
import { faCircleXmark, faPaperPlane }      from "@fortawesome/free-solid-svg-icons"
import { useReactMediaRecorder }            from "react-media-recorder"

import EmojiThinking                        from "../assets/emoji-thinking.svg"
import EmojiMail                            from "../assets/emoji-E-mail.svg"
import EmojiCheer                           from "../assets/emoji-cheer.svg"
import EmojiBigSmile                        from "../assets/emoji-bigsmile.svg"
import EmojiAngryHuff                       from "../assets/emoji-angryhuff.svg"
import EmojiHandshake                       from "../assets/emoji-handshake.svg"
import EmojiMicShure                        from "../assets/emoji-mic-shure.svg"
import EmojiZippedMouth                     from "../assets/emoji-zipped-mouth.svg"

import VoiceRecorder                        from "./VoiceRecorder"

const DEBUG_CONSOLE = false;

// ───────── Constants ─────────────────────────────────────────────────────────
const CHEER_EMOJI_SIZE         = 28
const EMOJI_LIKE_SIZE          = 24
const EMOJI_DISLIKE_SIZE       = 24
const EMOJI_THINK_SIZE         = 24
const EMOJI_MAIL_SIZE          = 24
const EMOJI_INPUT_GAP          = 12
const CHEER_ICON_MARGIN_BOTTOM = 4
const CONFIRM_EMOJI_SIZE       = 58
const CONFIRM_TEXT_SIZE        = 18

const CLOSE_DELAY_MS           = 5000
const VIEWPORT_RIGHT_OFFSET    = 21
const VIEWPORT_BOTTOM_OFFSET   = 21

const SMALL_CONTAINER    = { width: 100, height: 60,  borderRadius: 30 }
const EXPANDED_CONTAINER = { width: 400, height: 458, borderRadius: 20 }
const EXPANDED_PADDING   = 27

const CLOSE_BUTTON_TOP = 12;   // tweak this value
const CLOSE_BUTTON_RIGHT = 12; // tweak this value

const BUTTON_OFFSET_X = 16
const BUTTON_OFFSET_Y = 25

const BUBBLE_OFFSET_X = -8
const BUBBLE_OFFSET_Y = -8

const TAIL_OFFSET_X = -7
const TAIL_OFFSET_Y = -5

const OPEN_TRANSITION   = { type: "spring", bounce: 0.3, duration: 0.6 }
const CLOSE_TRANSITION  = { type: "spring", bounce: 0.25, duration: 0.55 }

const RECTANGLE_GRADIENT = `linear-gradient(
  to bottom,
  #65C466 0%, #45E660 25%,
  #36D952 50%, #26CC41 75%,
  #16C433 100%
)`

const SMALL_LABEL_FONT_SIZE    = 11
const FEEDBACK_TITLE_PADDING   = 15
const FORM_ELEMENT_GAP         = 15
const FORM_SCALE_INITIAL       = 0.75
const FORM_ANIMATION_DURATION  = 0.3
const FORM_FONT_SIZE           = 16
const CLOSE_BUTTON_INDENT      = 0

const BUTTON_BG_COLOR      = "linear-gradient(180deg, #FFB81E 0%, #E6A200 60%, #CF8B00 100%)"
const BUTTON_BORDER_COLOR  = "#A27600"
const BUTTON_TEXT_COLOR    = "#FFFFFF"
const SMILEY_OUTLINE_COLOR = "#664400"
const BUTTON_WIDTH         = "220px"

const FONT_FAMILY      = "var(--font-focal-medium)"
const HEADER_FONT      = "var(--font-focal-bold)"
const BUTTON_FONT      = "var(--font-focal-bold)"
const INSTRUCTION_FONT = "var(--font-focal-regular-italic)"
const INPUT_FONT       = "var(--font-focal-regular)"
const TITLE_COLOR      = "#ffffff"

const SPRING_TRANSITION   = { type: "spring", bounce: 0.3, duration: 0.6 }
const SMALL_HOVER_SCALE   = 1.02
const SMALL_PRESS_SCALE   = 0.98
const CLOSED_FILTER_HOVER = "brightness(0.93)"
const CLOSED_FILTER_PRESS = "brightness(0.85)"

// ───────── Tail SVG ─────────────────────────────────────────────────────────
// ── Tail SVG (with darker modal variant) ────────────────────────────
// define your two color‐pairs; pick any darker shades you like
const TAIL_COLORS = {
  normal: ["#26CC41", "#16C433"],   // unchanged
  modal:  ["#177A27", "#0D761F"]    // baked with 40% black overlay
};



const Tail = ({ isModal }) => {
  const [start, end] = isModal
    ? TAIL_COLORS.modal
    : TAIL_COLORS.normal

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 810 875"
         style={{ width: "23px", height: "25px", display: "block" }}>
      <defs>
        <linearGradient id="tailGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={start} />
          <stop offset="100%" stopColor={end}   />
        </linearGradient>
      </defs>
      <path
        d="M810,874.454S550.465,470.43,482.199,0L-.322,499.857
           c377.905,405.626,810.322,374.597,810.322,374.597Z"
        fill="url(#tailGrad)"
      />
    </svg>
  )
}


export const FeedbackBubble = () => {
  // ───────── State Hooks ────────────────────────────────────────────────
  const [likeText,    setLikeText]    = useState("")
  const [dislikeText, setDislikeText] = useState("")
  const [thinkText,   setThinkText]   = useState("")
  const [email,       setEmail]       = useState("")
  const [btnHovered,  setBtnHovered]  = useState(false)
  const [btnPressed,  setBtnPressed]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [isOpen,      setIsOpen]      = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [recorderKey, setRecorderKey] = useState(0);

  // ───────── Recorder Hook + shadow/remount logic ──────────────────
  const {
    status:       voiceStatus,
    startRecording,
    stopRecording,
    mediaBlobUrl: hookBlobUrl,
    clearBlob:    hookClearBlob
  } = useReactMediaRecorder({ audio: true })


  // shadow the blob URL so we can fully reset the recorder
  const [mediaBlobUrl, setMediaBlobUrl] = useState(hookBlobUrl)

  useEffect(() => {
    setMediaBlobUrl(hookBlobUrl)
  }, [hookBlobUrl])

  function clearRecording() {
    hookClearBlob && hookClearBlob()
    setMediaBlobUrl(undefined)
    setRecorderKey(k => k + 1)
  }

  if (DEBUG_CONSOLE) console.log("[IO] voiceStatus, mediaBlobUrl:", voiceStatus, mediaBlobUrl)

// ───────── Submission Logic ─────────
const hasVoice = voiceStatus === "stopped" && Boolean(mediaBlobUrl)

const canSend = Boolean(
  likeText.trim()    ||
  dislikeText.trim() ||
  thinkText.trim()   ||
  hasVoice
)

const allEmpty =
  !likeText.trim()  &&
  !dislikeText.trim() &&
  !thinkText.trim() &&
  !hasVoice


  // ───────── Close / Open Refs & Helpers ─────────────────────────────
  const expandedRef    = useRef(null)
  const wrapperRef     = useRef(null)
  const closeTimerRef  = useRef(null)
  const mouseInsideRef = useRef(false)

  // ── Clears all state, resets recorder & closes the bubble ───────────
  function reallyClose() {
    clearRecording()        // clears hook + shadow + remount
    setSubmitted(false)
    setLikeText("")
    setDislikeText("")
    setThinkText("")
    setEmail("")
    setConfirmClose(false)  // hide “Are you sure?”
    setIsOpen(false)        // animate back to small
  }

  // ── Handler for clicking the ❌ button ──────────────────────────────
  function handleAttemptClose() {
    if (allEmpty) {
      reallyClose()         // nothing entered → just close
    } else {
      setConfirmClose(true) // draft exists → ask first
    }
  }

  // ── Handler for “Yes” in the confirm popup ─────────────────────────
  function handleConfirmYes() {
    reallyClose()           // clear everything & collapse
  }

  // ── ESC‐key auto‐close ─────────────────────────────────────────────
  useEffect(() => {
    const onEsc = e => { if (e.key === "Escape") handleAttemptClose() }
    if (isOpen) window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [isOpen, allEmpty])

  // ── Idle‐close helpers ─────────────────────────────────────────────
  function clearCloseTimer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }
  function scheduleClose() {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(reallyClose, CLOSE_DELAY_MS)
  }

  useEffect(() => {
    const onMove = e => {
      if (!wrapperRef.current || !isOpen) return
      if (wrapperRef.current.contains(e.target)) {
        clearCloseTimer()
        mouseInsideRef.current = true
      } else if (mouseInsideRef.current && allEmpty) {
        scheduleClose()
        mouseInsideRef.current = false
      }
    }
    if (isOpen) {
      clearCloseTimer()
      mouseInsideRef.current = true
      document.addEventListener("mousemove", onMove)
    }
    return () => {
      clearCloseTimer()
      document.removeEventListener("mousemove", onMove)
    }
  }, [isOpen, allEmpty])

  // ───────── close on Escape ──────────────────────────────────────────
  useEffect(() => {
    const onEsc = e => {
      if (e.key === "Escape") {
        attemptClose()
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", onEsc)
    }
    return () => {
      window.removeEventListener("keydown", onEsc)
    }
  }, [isOpen])

// ───────── idle-close on mouse leave ────────────────────────────────
useEffect(() => {
  const onMove = e => {
    if (!wrapperRef.current || !isOpen) return
    if (wrapperRef.current.contains(e.target)) {
      clearCloseTimer()
      mouseInsideRef.current = true
    } else {
      // only schedule auto‐close if truly nothing (text OR voice) exists
      if (mouseInsideRef.current && allEmpty) {
        scheduleClose()
      }
      mouseInsideRef.current = false
    }
  }
  if (isOpen) {
    clearCloseTimer()
    mouseInsideRef.current = true
    document.addEventListener("mousemove", onMove)
  }
  return () => {
    clearCloseTimer()
    document.removeEventListener("mousemove", onMove)
  }
}, [isOpen, allEmpty])

  // ───────── Responsive Width ──────────────────────────────────────────
  const [targetWidth, setTargetWidth] = useState(SMALL_CONTAINER.width)
  useEffect(() => {
    const recalc = () => {
      const pad = parseInt(
        getComputedStyle(document.documentElement)
               .getPropertyValue("--container-padding-x")
      ) || 20
      const w90 = window.innerWidth * 0.9
      setTargetWidth(isOpen
        ? Math.min(w90 - pad * 2, EXPANDED_CONTAINER.width)
        : SMALL_CONTAINER.width
      )
    }
    recalc()
    window.addEventListener("resize", recalc)
    return () => window.removeEventListener("resize", recalc)
  }, [isOpen])
  
// ───────── Button Styles ────────────────────────────────────────────
  const BASE_BUTTON_STYLE = {
    position:      "absolute",
    top:           `calc(50% + ${BUTTON_OFFSET_Y}px)`,
    left:          `calc(50% + ${BUTTON_OFFSET_X}px)`,
    transform:     "translate(-50%, -50%)",
    fontFamily:    BUTTON_FONT,
    background:    BUTTON_BG_COLOR,
    border:        `1px solid ${BUTTON_BORDER_COLOR}`,
    color:         BUTTON_TEXT_COLOR,
    textShadow:    `0 0 8px ${SMILEY_OUTLINE_COLOR}`,
    padding:       "0.5rem 1rem",
    fontSize:      "16px",
    borderRadius:  "4px",
    width:         BUTTON_WIDTH,
    display:       "flex",
    alignItems:    "center",
    justifyContent:"center",
    cursor:        canSend ? "pointer" : "not-allowed"
  }
  const HOVER_BUTTON_STYLE   = {
    background: "linear-gradient(180deg, #FFBE45 0%, #FBB010 60%, #D98C00 100%)",
    border:     "1px solid #D98C00",
    textShadow: `0 0 10px ${SMILEY_OUTLINE_COLOR}`
  }
  const PRESSED_BUTTON_STYLE = {
    background: "linear-gradient(180deg, #D98C00 0%, #C77F00 60%, #B66F00 100%)",
    boxShadow:  "inset 0 3px 6px rgba(0,0,0,0.3)"
  }
  const DISABLED_BUTTON_STYLE = {
    filter:  "grayscale(80%)",
    opacity: 0.38,
    cursor:  "not-allowed"
  }

  // ───────── Submit Handler with full tracing ───────────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault()
    console.trace("[IO] handleSubmit() start – canSend:", canSend)

    if (!canSend) {
      console.warn("[IO] handleSubmit aborted – nothing to send")
      alert("Please share at least one thought or record a memo.")
      return
    }

    // pick up an env var or fall back to "/api"
    const API_ENDPOINT = import.meta.env.VITE_FEEDBACK_API || "/api"
    if (DEBUG_CONSOLE) console.log("[IO] About to POST to", API_ENDPOINT)

    try {
      // build payload
      const payload = {
        formType: "feedback",
        like:     likeText.trim(),
        dislike:  dislikeText.trim(),
        think:    thinkText.trim(),
        reply_to: email.trim()
      }
      if (DEBUG_CONSOLE) console.log("[IO] Payload:", payload)

// ─── AFTER (use FileReader to avoid call‐stack issues) ───
if (mediaBlobUrl) {
  if (DEBUG_CONSOLE) console.log("[IO] fetching blob from", mediaBlobUrl)
  const blob = await fetch(mediaBlobUrl).then(r => r.blob())
  const ext  = blob.type.split("/")[1] || "webm"

  // ✅ safer conversion via FileReader
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload  = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
  const b64 = dataUrl.split(",")[1]  // strip off "data:*/*;base64,"

  payload.voice         = b64
  payload.voiceFilename = `memo.${ext}`
  payload.voiceMime     = blob.type
  if (DEBUG_CONSOLE) console.log("[IO] voice fields:", payload.voiceFilename, payload.voiceMime)
}


      if (DEBUG_CONSOLE) console.log("[IO] executing fetch…")
      const res = await fetch(API_ENDPOINT, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload)
      })
      if (DEBUG_CONSOLE) console.log("[IO] fetch returned status", res.status)

      let data = null
      try { data = await res.json() } catch (_) {
        console.warn("[IO] no JSON in response")
      }
      if (DEBUG_CONSOLE) console.log("[IO] response body:", data)

      if (!res.ok) {
        throw new Error(data?.error || res.statusText)
      }

      if (DEBUG_CONSOLE) console.log("[IO] submission successful – showing confirmation")
      setSubmitted(true)
      clearRecording()

    } catch (err) {
      console.error("[IO] handleSubmit error:", err)
      alert("Error sending feedback: " + err.message)
    }
  }

// ── Handler: user clicks the ❌ ─────────────────────────────────
function handleAttemptClose() {
  if (allEmpty && !mediaBlobUrl) {
    reallyClose()       // no separate clearRecording needed—already in reallyClose
  } else {
    setConfirmClose(true)
  }
}



// ── Handler: user clicks “Yes” in the popup ────────────────────
function handleConfirmYes() {
  reallyClose()       // clears, resets, and closes the bubble
}



  // ───────── Render ─────────────────────────────────────────────────────
return (
  <div
    style={{
      position:   "fixed",
      bottom:     VIEWPORT_BOTTOM_OFFSET,
      right:      VIEWPORT_RIGHT_OFFSET,
      zIndex:     2000,
      fontFamily: FONT_FAMILY,
      cursor:     !isOpen ? "pointer" : "default"
    }}
    onClick={() => {
      if (!isOpen) setIsOpen(true)
    }}
  >
    <div style={{ position: "relative", display: "inline-block" }}>
      <motion.div
        ref={wrapperRef}
        initial={{ ...SMALL_CONTAINER, x: BUBBLE_OFFSET_X, y: BUBBLE_OFFSET_Y }}
        animate={
          isOpen
            ? {
                width:        targetWidth,
                height:       EXPANDED_CONTAINER.height,
                borderRadius: EXPANDED_CONTAINER.borderRadius,
                x:            BUBBLE_OFFSET_X,
                y:            BUBBLE_OFFSET_Y
              }
            : { ...SMALL_CONTAINER, x: BUBBLE_OFFSET_X, y: BUBBLE_OFFSET_Y }
        }
        transition={isOpen ? OPEN_TRANSITION : CLOSE_TRANSITION}
        whileHover={!isOpen && { scale: SMALL_HOVER_SCALE, filter: CLOSED_FILTER_HOVER }}
        whileTap={!isOpen && { scale: SMALL_PRESS_SCALE, filter: CLOSED_FILTER_PRESS }}
        style={{
          background:      RECTANGLE_GRADIENT,
          overflow:        "visible",
          display:         "flex",
          justifyContent:  "center",
          alignItems:      "center",
          boxSizing:       "border-box",
          transformOrigin: "center center",
          // filter:          confirmClose
          //                    ? "brightness(40%) blur(4px)"
          //                    : "none",
          // WebkitFilter:    confirmClose
          //                    ? "brightness(40%) blur(4px)"
          //                    : "none"
          // ← no zIndex here
        }}
      >
        {/* ── Inner Wrapper ──────────────────────────────────────── */}
        <div
          style={{
            position:     "relative",
            width:        "100%",
            height:       "100%",
            boxSizing:    "border-box",
            padding:      isOpen ? EXPANDED_PADDING : 8,
            overflow:     "hidden",
            borderRadius: "inherit"
          }}
          onClick={e => {
            if (isOpen) e.stopPropagation()
          }}
        >
          {/* ── Dim & Blur Rectangle ─────────────────────────────── */}
          {confirmClose && (
            <div
              style={{
                position:             "absolute",
                top:                  0,
                left:                 0,
                right:                0,
                bottom:               0,
                background:           "rgba(0,0,0,0.4)",
                backdropFilter:       "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                borderRadius:         "inherit",
                zIndex:               3       // ← covers the time pill
              }}
            />
          )}

          {/* ── Close-X button ──────────────────────────────────── */}
          {isOpen && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02, filter: "brightness(0.93)" }}
              whileTap={{ scale: 0.98, filter: "brightness(0.85)" }}
              onClick={e => {
                e.stopPropagation()
                confirmClose ? handleConfirmYes() : handleAttemptClose()
              }}
              style={{
                position:      "absolute",
                top:           CLOSE_BUTTON_TOP,
                right:         CLOSE_BUTTON_RIGHT,
                zIndex:        confirmClose ? 0 : 2,
                pointerEvents: confirmClose ? "none" : "auto",
                background:    "transparent",
                border:        "none",
                cursor:        confirmClose ? "default" : "pointer",
                padding:       0,
                fontSize:      20,
                color:         "#fff"
              }}
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faCircleXmark} />
            </motion.button>
          )}

          {/* ── Title (when open & not submitted) ──────────────── */}
          {isOpen && !submitted && (
            <div
              style={{
                position:      "relative",
                textAlign:     "center",
                paddingTop:    FEEDBACK_TITLE_PADDING,
                paddingBottom: FEEDBACK_TITLE_PADDING,
                zIndex:        confirmClose ? 0 : 2,
                pointerEvents: confirmClose ? "none" : "auto"
              }}
            >
              <span
                style={{
                  fontFamily: HEADER_FONT,
                  fontSize:   18,
                  color:      TITLE_COLOR
                }}
              >
                Feedback
              </span>
            </div>
          )}

          {/* ── Main Content ─────────────────────────────────────── */}
          {!isOpen ? (
            // Small Bubble
            <div
              style={{
                display:       "flex",
                flexDirection: "column",
                alignItems:    "center",
                justifyContent:"center",
                color:         "#fff",
                width:         "100%",
                height:        "100%"
              }}
            >
              <img
                src={EmojiCheer}
                alt="feedback"
                width={CHEER_EMOJI_SIZE}
                height={CHEER_EMOJI_SIZE}   // ← restored
                style={{ marginBottom: CHEER_ICON_MARGIN_BOTTOM }}
              />
              <div style={{ fontSize: SMALL_LABEL_FONT_SIZE, color: "#fff" }}>
                Feedback
              </div>
            </div>
          ) : submitted ? (
            // Thank-You Screen
            <motion.div
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING_TRANSITION}
              style={{
                position:       "absolute",
                top:            0,
                bottom:         0,
                left:           0,
                right:          0,
                display:        "flex",
                flexDirection:  "column",
                justifyContent: "center",
                alignItems:     "center"
              }}
            >
              <img
                src={EmojiHandshake}
                alt="Thank you"
                width={CONFIRM_EMOJI_SIZE}
                height={CONFIRM_EMOJI_SIZE}
              />
              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize:  `${CONFIRM_TEXT_SIZE}px`,
                  textAlign: "center",
                  color:     "#fff"
                }}
              >
                Thanks for your feedback!
              </div>
              <Button
                as={motion.button}
                style={{
                  marginTop:    "1rem",
                  minHeight:    "40px",
                  background:   "linear-gradient(180deg, #0d6efd 0%, #0a58ca 100%)",
                  border:       "none",
                  color:        "#fff",
                  fontFamily:   BUTTON_FONT,
                  fontSize:     "0.9rem",
                  padding:      "0 1rem",
                  borderRadius: "8px",
                  cursor:       "pointer",
                  boxShadow:    "0px 2px 4px rgba(0,0,0,0.1)",
                  transition:   "filter 0.2s ease, box-shadow 0.2s ease"
                }}
                whileHover={{
                  filter:    "brightness(0.90)",
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.15)"
                }}
                whileTap={{
                  filter:    "brightness(0.80)",
                  boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
                  scale:     0.98
                }}
                onClick={reallyClose}
              >
                Close
              </Button>
            </motion.div>
          ) : (
            // Feedback Form
            <Form
              onSubmit={handleSubmit}
              style={{
                display:       "flex",
                flexDirection: "column",
                gap:           FORM_ELEMENT_GAP
              }}
            >
              {/* 1) Like */}
              <div style={{ display: "flex", alignItems: "center", gap: EMOJI_INPUT_GAP }}>
                <img
                  src={EmojiBigSmile}
                  alt=""
                  width={EMOJI_LIKE_SIZE}
                  height={EMOJI_LIKE_SIZE}
                />
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="I really like…"
                  value={likeText}
                  onChange={e => setLikeText(e.target.value)}
                  style={{
                    flex:       1,
                    resize:     "none",
                    fontSize:   FORM_FONT_SIZE,
                    padding:    4,
                    fontFamily: likeText ? INPUT_FONT : INSTRUCTION_FONT,
                    fontStyle:  likeText ? "normal" : "italic"
                  }}
                />
              </div>

              {/* 2) Dislike */}
              <div style={{ display: "flex", alignItems: "center", gap: EMOJI_INPUT_GAP }}>
                <img
                  src={EmojiAngryHuff}
                  alt=""
                  width={EMOJI_DISLIKE_SIZE}
                  height={EMOJI_DISLIKE_SIZE}
                />
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="I'm not a fan of…"
                  value={dislikeText}
                  onChange={e => setDislikeText(e.target.value)}
                  style={{
                    flex:       1,
                    resize:     "none",
                    fontSize:   FORM_FONT_SIZE,
                    padding:    4,
                    fontFamily: dislikeText ? INPUT_FONT : INSTRUCTION_FONT,
                    fontStyle:  dislikeText ? "normal" : "italic"
                  }}
                />
              </div>

              {/* 3) Thoughts */}
              <div style={{ display: "flex", alignItems: "center", gap: EMOJI_INPUT_GAP }}>
                <img
                  src={EmojiThinking}
                  alt=""
                  width={EMOJI_THINK_SIZE}
                  height={EMOJI_THINK_SIZE}
                />
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="I have some thoughts…"
                  value={thinkText}
                  onChange={e => setThinkText(e.target.value)}
                  style={{
                    flex:       1,
                    resize:     "none",
                    fontSize:   FORM_FONT_SIZE,
                    padding:    4,
                    fontFamily: thinkText ? INPUT_FONT : INSTRUCTION_FONT,
                    fontStyle:  thinkText ? "normal" : "italic"
                  }}
                />
              </div>

              {/* 4) Voice Memo */}
              <div style={{ display: "flex", alignItems: "center", gap: EMOJI_INPUT_GAP }}>
                <img
                  src={EmojiMicShure}
                  alt="record"
                  width={EMOJI_MAIL_SIZE}
                  height={EMOJI_MAIL_SIZE}
                />
                <div style={{ flex: 1 }}>
                  <VoiceRecorder
                    key={recorderKey}
                    status={voiceStatus}
                    startRecording={startRecording}
                    stopRecording={stopRecording}
                    clearBlob={clearRecording}
                    mediaBlobUrl={mediaBlobUrl}
                  />
                </div>
              </div>

              {/* 5) Email */}
              <div style={{ display: "flex", alignItems: "center", gap: EMOJI_INPUT_GAP }}>
                <img
                  src={EmojiMail}
                  alt=""
                  width={EMOJI_MAIL_SIZE}
                  height={EMOJI_MAIL_SIZE}
                />
                <Form.Control
                  type="email"
                  placeholder="Email… (optional)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    flex:       1,
                    height:     32,
                    fontSize:   FORM_FONT_SIZE,
                    padding:    4,
                    fontFamily: email ? INPUT_FONT : INSTRUCTION_FONT,
                    fontStyle:  email ? "normal" : "italic"
                  }}
                />
              </div>

              {/* 6) Send */}
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <Button
                  type="submit"
                  disabled={!canSend}
                  onMouseEnter={() => setBtnHovered(true)}
                  onMouseLeave={() => {
                    setBtnHovered(false)
                    setBtnPressed(false)
                  }}
                  onMouseDown={() => setBtnPressed(true)}
                  onMouseUp={() => setBtnPressed(false)}
                  style={{
                    ...BASE_BUTTON_STYLE,
                    ...(btnHovered && canSend ? HOVER_BUTTON_STYLE : {}),
                    ...(btnPressed && canSend ? PRESSED_BUTTON_STYLE : {}),
                    ...(!canSend ? DISABLED_BUTTON_STYLE : {})
                  }}
                >
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    style={{
                      marginRight: "0.5rem",
                      color:       !canSend
                                     ? DISABLED_BUTTON_STYLE.color
                                     : BUTTON_TEXT_COLOR,
                      filter:      !canSend
                                     ? "none"
                                     : `drop-shadow(0 0 6px ${SMILEY_OUTLINE_COLOR})`
                    }}
                  />
                  Send
                </Button>
              </div>
            </Form>
          )}

          {/* ── Confirm-Close Popup ────────────────────────────────── */}
          {confirmClose && (
            <div
              style={{
                position:      "absolute",
                top:           "50%",
                left:          "50%",
                transform:     "translate(-50%, -50%)",
                width:         "260px",
                background:    "linear-gradient(135deg, #ececec, #c0c0c0)",
                borderRadius:  "12px",
                boxShadow:     "0 8px 24px rgba(0,0,0,0.3)",
                padding:       "1rem",
                display:       "flex",
                flexDirection: "column",
                fontFamily:    "var(--font-focal-regular)",
                color:         "#333",
                zIndex:        3    // ← popup above blur & tail
              }}
            >
              {/* Top: emoji + text */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
                <img
                  src={EmojiZippedMouth}
                  alt="🤐"
                  style={{
                    width:       "48px",
                    height:      "48px",
                    objectFit:   "contain",
                    marginRight: "0.75rem"
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "var(--font-focal-medium)",
                    fontSize:   "1.25rem",
                    marginBottom:"0.25rem"
                  }}>
                    Are you sure?
                  </div>
                  <div style={{
                    fontFamily: "var(--font-focal-regular)",
                    fontSize:   "1rem",
                    lineHeight: 1.4
                  }}>
                    Your unsent feedback<br/>will be deleted.
                  </div>
                </div>
              </div>

              {/* Bottom: buttons side-by-side */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Button
                  as={motion.button}
                  variant="light"
                  style={{
                    flex:         1,
                    height:       "40px",
                    borderRadius: "8px",
                    background:   "linear-gradient(to bottom, #f8f9fa, #e9ecef)",
                    border:       "1px solid #dee2e6",
                    fontFamily:   "var(--font-focal-bold)",
                    fontSize:     "0.9rem",
                    color:        "#333",
                    cursor:       "pointer",
                    boxShadow:    "0px 2px 4px rgba(0,0,0,0.1)",
                    transition:   "filter 0.2s ease, box-shadow 0.2s ease"
                  }}
                  whileHover={{
                    filter:    "brightness(0.95)",
                    boxShadow: "0px 4px 8px rgba(0,0,0,0.15)"
                  }}
                  whileTap={{
                    filter:    "brightness(0.85)",
                    boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
                    scale:     0.98
                  }}
                  onClick={() => setConfirmClose(false)}
                >
                  Cancel
                </Button>
                <Button
                  as={motion.button}
                  style={{
                    flex:         1,
                    height:       "40px",
                    borderRadius: "8px",
                    background:   "linear-gradient(180deg, #dc3545 0%, #c82333 60%, #bd2130 100%)",
                    border:       "none",
                    color:        "#fff",
                    fontFamily:   "var(--font-focal-bold)",
                    fontSize:     "0.9rem",
                    cursor:       "pointer",
                    boxShadow:    "0px 2px 4px rgba(0,0,0,0.1)",
                    transition:   "filter 0.2s ease, box-shadow 0.2s ease"
                  }}
                  whileHover={{
                    filter:    "brightness(0.90)",
                    boxShadow: "0px 4px 8px rgba(0,0,0,0.15)"
                  }}
                  whileTap={{
                    filter:    "brightness(0.80)",
                    boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
                    scale:     0.98
                  }}
                  onClick={handleConfirmYes}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Bubble Tail ───────────────────────────────────────── */}
   <div
     style={{
       position: "absolute",
       right:    TAIL_OFFSET_X,
       bottom:   TAIL_OFFSET_Y,
       filter:   "none",    // kill any brightness hack
       zIndex:   confirmClose ? 3 : 0
     }}
   >
     <Tail isModal={confirmClose} />
   </div>

      </motion.div>
    </div>
  </div>
)



}

export default FeedbackBubble
