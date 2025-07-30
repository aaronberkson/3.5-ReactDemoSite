// src/components/PreloadMessageModal.jsx
import React, { useEffect, Suspense } from "react"

// Lazy‑load both pieces
const MessageModal  = React.lazy(() => import("./MessageModal"))
const VoiceRecorder = React.lazy(() => import("./VoiceRecorder"))

export default function PreloadMessageModal() {
  useEffect(() => {
    import(/* webpackPrefetch: true */ "./MessageModal").catch(() => {})
    import(/* webpackPrefetch: true */ "./VoiceRecorder").catch(() => {})
  }, [])

  return (
    <div style={{
      position:      "fixed",
      top:           0,
      left:          0,
      width:         "100vw",
      height:        "100vh",
      visibility:    "hidden",
      pointerEvents: "none",
      zIndex:        -1
    }}>
      <Suspense fallback={null}>
        {/* mount hidden so layout & hooks run once */}
        <MessageModal isOpen={false} onClose={() => {}} />

        {/* mount recorder with no‑op handlers for message mode */}
        <VoiceRecorder
          status="idle"
          startRecording={() => {}}
          stopRecording={() => {}}
          clearBlob={() => {}}
          mediaBlobUrl={undefined}
          mode="message"
        />
      </Suspense>
    </div>
  )
}
