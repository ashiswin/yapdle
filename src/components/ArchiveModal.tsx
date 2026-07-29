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

  const days: { num: number; date: string; entry: ArchiveEntry | undefined }[] = []
  for (let n = 1; n <= currentNumber; n++) {
    days.push({ num: n, date: getDateFromNumber(n), entry: archive[n] })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-yapdle-surface rounded-2xl border border-yapdle-border p-6 max-w-md w-full bounce-in shadow-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-yapdle-accent text-center mb-4">
          Archive
        </h2>

        <div className="grid grid-cols-5 gap-2 mb-4">
          {days.map(({ num, date, entry }) => {
            const canPlay = !entry && date !== today
            return canPlay ? (
              <button
                key={num}
                onClick={() => onPlay(date)}
                className="aspect-square rounded-lg flex items-center justify-center text-lg font-mono border border-yapdle-border/20 bg-yapdle-surface/30 hover:bg-yapdle-surface2 transition-colors cursor-pointer"
                title={`Play Yapdle #${num}`}
              >
                <span className="text-yapdle-accent text-xs">#{num}</span>
              </button>
            ) : (
              <div
                key={num}
                className={`aspect-square rounded-lg flex items-center justify-center text-lg font-mono border ${
                  entry
                    ? entry.won
                      ? "border-yapdle-correct/30 bg-green-500/10"
                      : "border-yapdle-wrong/20 bg-red-500/5"
                    : "border-yapdle-border/20 bg-yapdle-surface/30 opacity-50"
                }`}
                title={
                  date === today
                    ? "Today's Yapdle"
                    : `Yapdle #${num}${entry ? (entry.won ? " - Won" : " - Lost") : ""}`
                }
              >
                {emojiForEntry(entry)}
              </div>
            )
          })}
        </div>

        <div className="text-center text-yapdle-muted text-xs space-y-1">
          <p>
            <span className="inline-block mr-2">🟩 Won</span>
            <span className="inline-block mr-2">🟥 Lost</span>
            <span className="inline-block">⬛ Not played</span>
          </p>
          <p>Click an unplayed day to catch up</p>
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
