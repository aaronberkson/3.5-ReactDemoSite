// src/components/PreloadFeedbackBubble.jsx
import React, { useEffect, Suspense } from "react"

// Lazy‑load both pieces
const FeedbackBubble = React.lazy(() => import("./FeedbackBubble"))
const VoiceRecorder  = React.lazy(() => import("./VoiceRecorder"))

export default function PreloadFeedbackBubble() {
  useEffect(() => {
    import(/* webpackPrefetch: true */ "./FeedbackBubble").catch(() => {})
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
        <FeedbackBubble isOpen={false} onClose={() => {}} />

        {/* mount recorder with no‑op handlers for feedback mode */}
        <VoiceRecorder
          status="idle"
          startRecording={() => {}}
          stopRecording={() => {}}
          clearBlob={() => {}}
          mediaBlobUrl={undefined}
          mode="feedback"
        />
      </Suspense>
    </div>
  )
}
