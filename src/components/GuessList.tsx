interface GuessListProps {
  guesses: string[]
  maxGuesses: number
  correctTitle: string
  won: boolean
}

export function GuessList({ guesses, maxGuesses, correctTitle, won }: GuessListProps) {
  const slots = Array.from({ length: maxGuesses }, (_, i) => guesses[i] || null)

  const isCorrectGuess = (guess: string, i: number) =>
    guess === correctTitle && (i === guesses.length - 1) && won

  return (
    <div className="w-full max-w-lg mx-auto space-y-2">
      {slots.map((guess, i) => {
        const correct = guess !== null && isCorrectGuess(guess, i)
        const isWrong = guess !== null && !correct

        return (
          <div
            key={i}
            className={`px-4 py-3 rounded-lg border text-sm flex items-center gap-3 guess-enter ${
              correct
                ? "border-yapdle-correct/30 bg-green-500/10"
                : isWrong
                ? "border-yapdle-wrong/20 bg-red-500/5"
                : "border-yapdle-border/20 bg-yapdle-surface/30"
            }`}
          >
            <span className="text-yapdle-muted font-mono text-xs w-5">
              {i + 1}
            </span>
            {guess ? (
              <span
                className={`font-medium ${
                  correct
                    ? "text-yapdle-correct"
                    : "text-yapdle-wrong line-through"
                }`}
              >
                {guess}
              </span>
            ) : (
              <span className="text-yapdle-muted/40 italic text-xs">
                {i === 0 ? "Waiting for your first guess..." : "Empty"}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
