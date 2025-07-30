import React, { useEffect, useRef, useState } from "react"
import WaveSurfer                              from "wavesurfer.js"

import { FontAwesomeIcon }                     from "@fortawesome/react-fontawesome"
import {
  faCircle, faStop, faPlay, faPause, faTrash
} from "@fortawesome/free-solid-svg-icons"

import "./VoiceRecorder.css"

const DEBUG_CONSOLE = false;

const BUTTON_WIDTH = 104;

const ROWS            = 4;
const GRID_COLOR      = "#c5aa55";
const GRID_LINE_WIDTH = 1;
const ZERO_LINE_COLOR = GRID_COLOR;
const ZERO_LINE_THICK = GRID_LINE_WIDTH;
const SENSITIVITY     = 1.5;

const REC_BLINK_SPEED    = 1000;         // ms per fade cycle



export default function VoiceRecorder({
  status,
  startRecording,
  stopRecording,
  mediaBlobUrl,
  clearBlob = () => {},
  mode = "feedback" 
}) {
  // 2) UI state & refs
  const [ciStatus, setCiStatus]        = useState("idle")   // "idle"|"recording"|"stopped"
  const [playing, setPlaying]          = useState(false)
  const [waveformKey, setWaveformKey]  = useState(0)
  const [duration, setDuration]        = useState(0)

  const isMsg = mode === "message";
const bgColor        = isMsg ? "#333333" : "#004a1b";
const gridLineColor  = isMsg ? "#777777" : GRID_COLOR;
const waveformColor  = isMsg ? "#ff3f4a" : "#fcfdf6";

// ── New timing state & helpers ─────────────────────────
const [currentTime, setCurrentTime] = useState(0);
const MAX_DURATION = 9 * 60 + 99;      // cap at 9:99

const fmtTime = t => {
  const m = Math.min(9, Math.floor(t / 60));
  const s = Math.min(99, Math.floor(t % 60));
  return `${m}:${String(s).padStart(2, "0")}`;
};

// auto‐stop recording at MAX_DURATION
useEffect(() => {
  if (ciStatus === "recording") {
    const timer = setTimeout(stopRecording, MAX_DURATION * 1000);
    return () => clearTimeout(timer);
  }
}, [ciStatus]);

  const canvasRef     = useRef(null)
  const wavesurferRef = useRef(null)
  const wavesInstRef  = useRef(null)

  // 3) Sync hook status → ciStatus
  useEffect(() => {
    if (status === "recording") {
      if (DEBUG_CONSOLE) console.log("[IO][VR][StateChange] Recording")
      setCiStatus("recording")
    }
    if (status === "stopped" && mediaBlobUrl) {
      if (DEBUG_CONSOLE) console.log("[IO][VR][StateChange] Ready to Play")
      setCiStatus("stopped")
      setWaveformKey(k => k + 1)
      setPlaying(false)
      setDuration(0)
    }
  }, [status, mediaBlobUrl])

  // 4) Log ciStatus changes
  useEffect(() => {
    let msg = ""
    switch(ciStatus){
      case "idle":      msg="Ready to Record"; break
      case "recording": msg="Recording";       break
      case "stopped":   msg= playing ? "Playing" : "Ready to Play"; break
    }
    if (DEBUG_CONSOLE) console.log(`[IO][VR][StateChange] ${msg}`)
  }, [ciStatus, playing])

// 5) Live-canvas draw
useEffect(() => {
  if (ciStatus !== "recording") return;
  let audioCtx, analyser, data, source, raf;

  const canvas = canvasRef.current;
  const dpr    = window.devicePixelRatio || 1;
  // 1) read CSS size
  const { width: rawW, height: H } = canvas.getBoundingClientRect();

  // 2) perfect 4×N squares
  const SPACING = H / ROWS;
  const cols    = Math.floor(rawW / SPACING);
  const W       = cols * SPACING;

  // 3) hi-DPI buffer
  canvas.style.width  = `${W}px`;
  canvas.style.height = `${H}px`;
  canvas.width  = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = false;

  // 4) audio setup
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      audioCtx         = new AudioContext();
      analyser         = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source           = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      data             = new Uint8Array(analyser.frequencyBinCount);

      // 5) render loop
const draw = () => {
  // a) clear + background
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  // b) interior grid
  ctx.save();
  ctx.strokeStyle = gridLineColor;
  ctx.lineWidth   = GRID_LINE_WIDTH;
  for (let i = 1; i < cols; i++) {
    const x = i * SPACING + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let j = 1; j < ROWS; j++) {
    const y = j * SPACING + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.restore();

  // c) full outer border
  ctx.save();
  ctx.strokeStyle = gridLineColor;
  ctx.lineWidth   = GRID_LINE_WIDTH;
  ctx.beginPath();
  ctx.moveTo(0.5, 0.5);         ctx.lineTo(W - 0.5, 0.5);
  ctx.moveTo(0.5, 0.5);         ctx.lineTo(0.5, H - 0.5);
  ctx.moveTo(0.5, H - 0.5);     ctx.lineTo(W - 0.5, H - 0.5);
  ctx.moveTo(W - 0.5, 0.5);     ctx.lineTo(W - 0.5, H - 0.5);
  ctx.stroke();
  ctx.restore();

  // d) zero-cross + ticks
  const midX       = W / 2 + 0.5;
  const midY       = H / 2 + 0.5;
  const TICKS      = 3;
  const SUB_SPACING= SPACING / (TICKS + 1);
  const TICK_LEN   = SPACING * 0.15;
  const tickLW     = GRID_LINE_WIDTH / 2;

  ctx.save();
  ctx.strokeStyle = gridLineColor;
  ctx.lineWidth   = tickLW;

  // horizontal line + ticks
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(W, midY);
  ctx.stroke();
  for (let i = 0; i < cols; i++) {
    const baseX = i * SPACING;
    for (let t = 1; t <= TICKS; t++) {
      const x = baseX + SUB_SPACING * t + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, midY - TICK_LEN/2);
      ctx.lineTo(x, midY + TICK_LEN/2);
      ctx.stroke();
    }
  }

  // vertical line + ticks
  ctx.beginPath();
  ctx.moveTo(midX, 0);
  ctx.lineTo(midX, H);
  ctx.stroke();
  for (let j = 0; j < ROWS; j++) {
    const baseY = j * SPACING;
    for (let t = 1; t <= TICKS; t++) {
      const y = baseY + SUB_SPACING * t + 0.5;
      ctx.beginPath();
      ctx.moveTo(midX - TICK_LEN/2, y);
      ctx.lineTo(midX + TICK_LEN/2, y);
      ctx.stroke();
    }
  }
  ctx.restore();

  // e) glowing waveform
  analyser.getByteTimeDomainData(data);
  ctx.save();
  ctx.strokeStyle = waveformColor;
  ctx.lineWidth   = 2;
  ctx.shadowColor = waveformColor;
  ctx.shadowBlur  = 12;
  ctx.beginPath();
  let px    = 0;
  const slice = W / data.length;
  data.forEach(v => {
    const norm = (v - 128) / 128;
    const y    = midY + norm * (H/2) * SENSITIVITY;
    ctx.lineTo(px, y);
    px += slice;
  });
  ctx.stroke();
  ctx.restore();

  raf = requestAnimationFrame(draw);
};


      draw();
    })
    .catch(console.warn);

  return () => {
    raf       && cancelAnimationFrame(raf);
    audioCtx  && audioCtx.close();
    source    && source.mediaStream.getTracks().forEach(t => t.stop());
  };
}, [ciStatus]);

const rootStyles    = getComputedStyle(document.documentElement);
const defaultAccent = rootStyles.getPropertyValue("--vr-accent").trim();
const messageAccent = rootStyles.getPropertyValue("--vr-accent-message").trim();
const accentColor   = mode === "message" ? messageAccent : defaultAccent;

// 6) Wavesurfer playback (with scrubber updates)
useEffect(() => {
  if (ciStatus === "stopped") {
    wavesInstRef.current?.destroy();
    const ws = WaveSurfer.create({
      container:     wavesurferRef.current,
      waveColor:     "#eee",            // unplayed waveform
      progressColor: accentColor,  // real hex/rgba from computed style
      cursorColor:   accentColor,  // same here
      barWidth:      2,
      height:        48,
      responsive:    true
    });
    wavesInstRef.current = ws;
    ws.load(mediaBlobUrl);

    ws.on("ready", () => {
      const dur = ws.getDuration();
      const capped = Math.min(dur, MAX_DURATION);
      setDuration(capped);
      setCurrentTime(0);
    });

    ws.on("audioprocess", t => {
      setCurrentTime(Math.min(t, MAX_DURATION));
    });

    ws.on("finish", () => {
      setCurrentTime(duration);
      setPlaying(false);
    });
  }
  return () => wavesInstRef.current?.destroy();
}, [ciStatus, mediaBlobUrl, waveformKey, mode]);


  // 7) Main pill handler
  const handleMain=()=>{
  if (ciStatus === "idle") {
    startRecording({
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 64000
    })
  } else if (ciStatus==="recording") {
      if (DEBUG_CONSOLE) console.log("[IO][VR][StateChange] Stop recording")
      stopRecording()
    } else {
      // PLAY / PAUSE
      const ws=wavesInstRef.current
      if (!ws) return
      if (playing) {
        if (DEBUG_CONSOLE) console.log("[IO][VR][StateChange] Pause")
        ws.pause()
      } else {
        if (DEBUG_CONSOLE) console.log("[IO][VR][StateChange] Play")
        ws.play()
      }
      setPlaying(p=>!p)
    }
  }

  // 8) Pick icon + label + css‐class
  let Icon,label,cls
  if(ciStatus==="idle")        {Icon=faCircle;label="Record";  cls="idle"}
  if(ciStatus==="recording")   {Icon=faStop;  label="Stop";    cls="recording"}
  if(ciStatus==="stopped"&&!playing){Icon=faPlay;label="Play"; cls="stopped"}
  if(ciStatus==="stopped"&&playing){Icon=faPause;label="Pause";cls="playing"}

  // 9) Duration mm:ss
  const mm=String(Math.floor(duration/60)).padStart(2,"0")
  const ss=String(Math.floor(duration%60)).padStart(2,"0")

  // 10) Trash handler
  const handleTrash = () => {
    if (DEBUG_CONSOLE) console.log("[IO][VR][Trash] Revoking old blob URL")
    if (mediaBlobUrl) {
      URL.revokeObjectURL(mediaBlobUrl)
    }
    if (DEBUG_CONSOLE) console.log("[IO][VR][Trash] Resetting button to Record")
    wavesInstRef.current?.destroy()
    if (DEBUG_CONSOLE) console.log("[IO][VR][Trash] Deleting Blob via clearBlob()")
    clearBlob()
    setDuration(0)
    setCiStatus("idle")
    if (DEBUG_CONSOLE) console.log("[IO][VR][Trash] Done")
  }

  return (
    <div className="vr-container">
      <button
        type="button"
        onClick={handleMain}
        className={`vr-pill ${cls}`}
        style={{
          width:    BUTTON_WIDTH,
          minWidth: BUTTON_WIDTH,
          maxWidth: BUTTON_WIDTH
        }}
      >
        <FontAwesomeIcon
          icon={Icon}
          color={
            cls==="idle"       ? "#ff3f4a" :
            cls==="recording"  ? "#555" :
            cls === "playing"   ? "#555" :
            cls==="stopped"    ? "#27ae60" :
                                "#2ecc71"
          }
        />
        {label}
      </button>

      {ciStatus==="idle" && (
        <span className="vr-instr">Send a voice note...</span>
      )}

<div
  className={`vr-wave-wrap ${ciStatus === "recording" ? "recording" : ""} ${playing ? "playing" : ""} ${currentTime > 0 ? "has-progress" : ""}`}
>
  {ciStatus === "recording" && (
    <>
      <canvas
        ref={canvasRef}
        width={320}       /* 320 is 8px×40 squares; adjust if you like */
        height={48}
        className="vr-canvas"
      />
      <div className="vr-rec-overlay">
        <span className="vr-rec-blink">
          <FontAwesomeIcon icon={faCircle} className="vr-rec-dot" />
          REC
        </span>
      </div>
    </>
  )}
  {ciStatus === "stopped" && mediaBlobUrl && (
    <>
      <div
        key={waveformKey}
        ref={wavesurferRef}
        className="vr-wavesurfer"
      />
{duration > 0 && (
  <>
    <div
      className={
        `vr-time-left ` +
        (mode === "message" ? "vr-time-left-message" : "")
      }
      style={{ color: accentColor }}
    >
      {fmtTime(currentTime)}
    </div>
    <div className="vr-time-right">
      {fmtTime(duration)}
    </div>
  </>
)}



    </>
  )}
</div>


      {ciStatus==="stopped" && mediaBlobUrl && (
        <button
          type="button"
          onClick={handleTrash}
          className="vr-trash"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      )}
    </div>
  )
}
