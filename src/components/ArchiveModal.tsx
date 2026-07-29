import { useState } from "react"
import { getArchive, getYapdleNumber, getDateFromNumber } from "../utils/game"
import type { ArchiveEntry } from "../utils/game"

interface ArchiveModalProps {
  open: boolean
  onClose: () => void
  onPlay: (dateStr: string) => void
}

function emojiForEntry(entry: ArchiveEntry | undefined): string {
  if (!entry) return "⬛"
  return entry.won ? "🟩" : "🟥"
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function ArchiveModal({ open, onClose, onPlay }: ArchiveModalProps) {
  const archive = getArchive()
  const currentNumber = getYapdleNumber()
  const today = todayStr()
  const [viewing, setViewing] = useState<number | null>(null)

  const days: { num: number; date: string; entry: ArchiveEntry | undefined }[] = []
  for (let n = 1; n <= currentNumber; n++) {
    days.push({ num: n, date: getDateFromNumber(n), entry: archive[n] })
  }

  const viewedEntry = viewing ? archive[viewing] : null

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-yapdle-surface rounded-2xl border border-yapdle-border p-6 max-w-md w-full bounce-in shadow-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-yapdle-accent text-center mb-4">
          Archive
        </h2>

        <div className="grid grid-cols-5 gap-2 mb-4">
          {days.map(({ num, date, entry }) => {
            const isToday = date === today
            const isUnplayed = !entry && !isToday

            if (isUnplayed) {
              return (
                <button
                  key={num}
                  onClick={() => onPlay(date)}
                  className="aspect-square rounded-lg flex items-center justify-center border border-yapdle-border/20 bg-yapdle-surface/30 hover:bg-yapdle-surface2 transition-colors cursor-pointer"
                  title={`Play Yapdle #${num}`}
                >
                  <span className="text-yapdle-accent text-xs font-medium">#{num}</span>
                </button>
              )
            }

            return (
              <button
                key={num}
                onClick={() => entry && setViewing(viewing === num ? null : num)}
                className={`aspect-square rounded-lg flex items-center justify-center border transition-colors ${
                  entry
                    ? viewing === num
                      ? "border-yapdle-accent/50 bg-yapdle-accent/10"
                      : entry.won
                      ? "border-yapdle-correct/30 bg-green-500/10 hover:bg-green-500/20 cursor-pointer"
                      : "border-yapdle-wrong/20 bg-red-500/5 hover:bg-red-500/10 cursor-pointer"
                    : "border-yapdle-border/20 bg-yapdle-surface/30 opacity-50 cursor-default"
                }`}
                title={
                  isToday && !entry
                    ? "Today's Yapdle"
                    : `Yapdle #${num}${entry ? (entry.won ? " - Won" : " - Lost") : ""}`
                }
              >
                {entry ? (
                  <span>{emojiForEntry(entry)}</span>
                ) : (
                  <span>{emojiForEntry(undefined)}</span>
                )}
              </button>
            )
          })}
        </div>

        {viewedEntry && (
          <div className="mb-4 p-3 rounded-lg bg-yapdle-bg border border-yapdle-border">
            <p className="text-yapdle-muted text-xs mb-2 text-center">
              Yapdle #{viewing} · {viewedEntry.won ? "Won" : "Lost"}
            </p>
            <div className="space-y-1.5">
              {viewedEntry.guesses.map((g, i) => (
                <div
                  key={i}
                  className={`px-3 py-2 rounded text-xs ${
                    g.correct
                      ? "bg-green-500/10 border border-yapdle-correct/20"
                      : "bg-red-500/5 border border-yapdle-wrong/10"
                  }`}
                >
                  <div className={`font-medium flex items-center gap-2 ${g.correct ? "text-yapdle-correct" : "text-yapdle-wrong line-through"}`}>
                    <span className="text-yapdle-muted font-mono">{i + 1}.</span>
                    {g.title}
                  </div>
                  <div className={`mt-0.5 pl-5 ${g.correct ? "text-yapdle-correct/70" : "text-yapdle-wrong/60"}`}>
                    {g.response}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-yapdle-muted text-xs space-y-1">
          <p>
            <span className="inline-block mr-2">🟩 Won</span>
            <span className="inline-block mr-2">🟥 Lost</span>
            <span className="inline-block">⬛ Not played</span>
          </p>
          <p>Click any day to view results, or play unplayed days</p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 text-yapdle-muted hover:text-yapdle-text transition-colors text-sm"
        >
          Close
        </button>
      </div>
    </div>
  )
}
