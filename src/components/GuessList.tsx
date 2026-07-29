interface GuessEntry {
  title: string
  response: string
  correct: boolean
}

interface GuessListProps {
  guesses: GuessEntry[]
  maxGuesses: number
}

export function GuessList({ guesses, maxGuesses }: GuessListProps) {
  const slots: (GuessEntry | null)[] = Array.from({ length: maxGuesses }, (_, i) => guesses[i] || null)

  return (
    <div className="w-full max-w-lg mx-auto space-y-2">
      {slots.map((entry, i) => {
        if (!entry) {
          return (
            <div
              key={i}
              className="px-4 py-3 rounded-lg border border-yapdle-border/20 bg-yapdle-surface/30 text-sm flex items-center gap-3"
            >
              <span className="text-yapdle-muted font-mono text-xs w-5">{i + 1}</span>
              <span className="text-yapdle-muted/40 italic text-xs">
                {i === 0 ? "Waiting for your first guess..." : ""}
              </span>
            </div>
          )
        }

        const { title, response, correct } = entry

        return (
          <div
            key={i}
            className={`px-4 py-3 rounded-lg border text-sm ${
              correct
                ? "border-yapdle-correct/30 bg-green-500/10"
                : "border-yapdle-wrong/20 bg-red-500/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-yapdle-muted font-mono text-xs w-5">{i + 1}</span>
              <span className={`font-medium ${
                correct ? "text-yapdle-correct" : "text-yapdle-wrong line-through"
              }`}>
                {title}
              </span>
            </div>
            <div className={`mt-1.5 text-xs pl-8 ${
              correct ? "text-yapdle-correct/80" : "text-yapdle-wrong/70"
            }`}>
              {response}
            </div>
          </div>
        )
      })}
    </div>
  )
}
