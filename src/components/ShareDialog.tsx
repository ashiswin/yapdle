import { useState } from "react"
import { shareResult } from "../utils/game"

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  guesses: string[]
  won: boolean
  videoTitle: string
  streak: number
}

export function ShareDialog({ open, onClose, guesses, won, videoTitle, streak }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const shareText = shareResult(guesses, won, videoTitle)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: shareText })
    } else {
      handleCopy()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-yapdle-surface rounded-2xl border border-yapdle-border p-6 max-w-sm w-full bounce-in shadow-2xl">
        <h2 className="text-xl font-bold text-yapdle-correct text-center mb-1">
          {won ? "Hell yeah!" : "Game Over"}
        </h2>
        <p className="text-yapdle-muted text-center text-sm mb-4">
          {won
            ? "You actually know my content. Respect."
            : "Better luck next time, champ."}
        </p>

        <div className="bg-yapdle-bg rounded-lg p-4 mb-4 font-mono text-sm whitespace-pre-wrap border border-yapdle-border">
          {shareText}
        </div>

        {streak > 0 && (
          <div className="text-center mb-4">
            <span className="text-yapdle-accent text-sm font-semibold">
              {streak} day streak
            </span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 px-4 py-2.5 rounded-lg bg-yapdle-surface2 hover:bg-yapdle-border text-yapdle-text font-medium transition-colors text-sm"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 px-4 py-2.5 rounded-lg bg-yapdle-share hover:bg-green-600 text-white font-medium transition-colors text-sm"
          >
            Share
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 px-4 py-2 text-yapdle-muted hover:text-yapdle-text transition-colors text-sm"
        >
          Close
        </button>
      </div>
    </div>
  )
}
