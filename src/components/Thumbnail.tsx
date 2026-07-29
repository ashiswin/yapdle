import { useState } from "react"

interface ThumbnailProps {
  thumbnailId: string
  blurPx: number
}

export function Thumbnail({ thumbnailId, blurPx }: ThumbnailProps) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <div className="w-full max-w-lg mx-auto aspect-video rounded-lg overflow-hidden bg-yapdle-surface2 border border-yapdle-border flex items-center justify-center">
        <span className="text-yapdle-muted">Thumbnail unavailable</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto aspect-video rounded-lg overflow-hidden bg-yapdle-surface2 border border-yapdle-border relative">
      <img
        src={`https://i.ytimg.com/vi/${thumbnailId}/hqdefault.jpg`}
        alt="Video thumbnail"
        className="w-full h-full object-cover thumbnail-reveal"
        style={{ filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined }}
        onError={() => setErrored(true)}
        draggable={false}
      />
    </div>
  )
}
