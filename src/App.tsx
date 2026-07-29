import { useState, useEffect, useCallback } from "react"
import { Header } from "./components/Header"
import { Thumbnail } from "./components/Thumbnail"
import { GuessInput } from "./components/GuessInput"
import { GuessList } from "./components/GuessList"
import { ShareDialog } from "./components/ShareDialog"
import { ArchiveModal } from "./components/ArchiveModal"
import { getDailyVideo, getYapdleNumber, saveToArchive, updateStreak, getStreak } from "./utils/game"
import type { GuessEntry } from "./utils/game"
import { getWrongResponse, getCorrectResponse, getLostResponse } from "./utils/responses"

const MAX_GUESSES = 5

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function App() {
  const dailyVideo = getDailyVideo()
  const [guesses, setGuesses] = useState<GuessEntry[]>([])
  const [won, setWon] = useState(false)
  const [lost, setLost] = useState(false)
  const [shake, setShake] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [streak, setStreak] = useState(getStreak())

  const yapdleNumber = getYapdleNumber()

  useEffect(() => {
    const saved = localStorage.getItem("yapdle_state")
    if (saved) {
      try {
        const state = JSON.parse(saved)
        if (state.date === new Date().toDateString() && state.videoId === dailyVideo.id) {
          setGuesses(state.guesses || [])
          setWon(state.won || false)
          setLost(state.lost || false)
        }
      } catch {
        localStorage.removeItem("yapdle_state")
      }
    }
  }, [dailyVideo.id, dailyVideo.title])

  const saveState = useCallback(
    (newGuesses: GuessEntry[], newWon: boolean, newLost: boolean) => {
      localStorage.setItem(
        "yapdle_state",
        JSON.stringify({
          date: new Date().toDateString(),
          videoId: dailyVideo.id,
          guesses: newGuesses,
          won: newWon,
          lost: newLost,
        })
      )
    },
    [dailyVideo.id]
  )

  const finishGame = useCallback(
    (newGuesses: GuessEntry[], didWin: boolean) => {
      const date = todayStr()
      saveToArchive(date, newGuesses, didWin)
      updateStreak()
      setStreak(getStreak())
    },
    []
  )

  const handleGuess = useCallback(
    (title: string) => {
      const isCorrect = title === dailyVideo.title
      const isLast = guesses.length + 1 >= MAX_GUESSES

      const entry: GuessEntry = isCorrect
        ? { title, response: getCorrectResponse(), correct: true }
        : { title, response: getWrongResponse(), correct: false }

      const newGuesses = [...guesses, entry]
      setGuesses(newGuesses)

      if (isCorrect) {
        setWon(true)
        saveState(newGuesses, true, false)
        finishGame(newGuesses, true)
      } else if (isLast) {
        setLost(true)
        saveState(newGuesses, false, true)
        finishGame(newGuesses, false)
      } else {
        saveState(newGuesses, false, false)
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }
    },
    [guesses, dailyVideo.title, saveState, finishGame]
  )

  const disabled = won || lost

  const wrongGuesses = guesses.filter((g) => !g.correct).length
  const blurPx = won || lost ? 0 : Math.max(0, 8 - wrongGuesses * 2)

  const previousTitles = guesses.map((g) => g.title)
  const lostMessage = lost ? getLostResponse(dailyVideo.title) : null

  return (
    <div className="min-h-screen flex flex-col items-center">
      <Header onArchive={() => setShowArchive(true)} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 flex flex-col items-center gap-5">
        <div className="text-center">
          <span className="text-yapdle-muted text-xs font-mono">
            Yapdle #{yapdleNumber}
          </span>
        </div>

        <Thumbnail
          thumbnailId={dailyVideo.thumbnailId}
          blurPx={blurPx}
        />

        <GuessList
          guesses={guesses}
          maxGuesses={MAX_GUESSES}
        />

        {!disabled && (
          <GuessInput
            onGuess={handleGuess}
            disabled={disabled}
            previousGuesses={previousTitles}
            shake={shake}
          />
        )}

        {won && (
          <div className="w-full max-w-lg mx-auto p-4 rounded-lg border border-yapdle-correct/20 bg-green-500/5 text-center bounce-in">
            <p className="text-yapdle-correct font-medium mb-3">
              {guesses[guesses.length - 1]?.response}
            </p>
            <button
              onClick={() => setShowShare(true)}
              className="px-5 py-2 rounded-lg bg-yapdle-share hover:bg-green-600 text-white font-medium transition-colors text-sm"
            >
              Share
            </button>
          </div>
        )}

        {lost && (
          <div className="w-full max-w-lg mx-auto p-4 rounded-lg border border-yapdle-wrong/20 bg-red-500/5 text-center bounce-in">
            <p className="text-yapdle-wrong font-medium mb-1">{lostMessage}</p>
            <p className="text-yapdle-muted text-xs mb-3">
              Come back tomorrow for a new Yapdle!
            </p>
            <button
              onClick={() => setShowShare(true)}
              className="px-5 py-2 rounded-lg bg-yapdle-share hover:bg-green-600 text-white font-medium transition-colors text-sm"
            >
              Share
            </button>
          </div>
        )}
      </main>

      <footer className="w-full py-3 border-t border-yapdle-border text-center">
        <p className="text-yapdle-muted text-xs">
          Not affiliated with penguinz0 / m0istCr1tikal. Thumbnails from YouTube.
        </p>
      </footer>

      <ShareDialog
        open={showShare}
        onClose={() => setShowShare(false)}
        guesses={previousTitles}
        won={won}
        videoTitle={dailyVideo.title}
        streak={streak}
      />

      <ArchiveModal
        open={showArchive}
        onClose={() => setShowArchive(false)}
      />
    </div>
  )
}
