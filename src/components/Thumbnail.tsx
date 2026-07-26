import { useState } from "react"
import { getThumbnailUrl } from "../data/videos"

interface ThumbnailProps {
  thumbnailId: string
  revealed: boolean
}

export function Thumbnail({ thumbnailId, revealed }: ThumbnailProps) {
  const [errored, setErrored] = useState(false)

  return (
    <div className="w-full max-w-lg mx-auto aspect-video rounded-lg overflow-hidden bg-yapdle-surface2 border border-yapdle-border relative">
      <img
        src={getThumbnailUrl(thumbnailId)}
        alt="Video thumbnail"
        className={`w-full h-full object-cover thumbnail-reveal ${
          revealed ? "" : "blur-2xl"
        }`}
        onError={() => setErrored(true)}
        draggable={false}
      />
      {!revealed && !errored && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="text-yapdle-muted text-sm">
            The thumbnail will reveal as you guess...
          </span>
        </div>
      )}
      {errored && (
        <div className="absolute inset-0 flex items-center justify-center bg-yapdle-surface2">
          <span className="text-yapdle-muted">Thumbnail unavailable</span>
        </div>
      )}
    </div>
  )
}
