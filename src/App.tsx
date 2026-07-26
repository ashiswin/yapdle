import { useState, useEffect, useCallback } from "react"
import { Header } from "./components/Header"
import { Thumbnail } from "./components/Thumbnail"
import { GuessInput } from "./components/GuessInput"
import { GuessList } from "./components/GuessList"
import { ResponseMessage } from "./components/ResponseMessage"
import { ShareDialog } from "./components/ShareDialog"
import { getDailyVideo, getYapdleNumber } from "./utils/game"
import { getWrongResponse, getCorrectResponse, getLostResponse } from "./utils/responses"

const MAX_GUESSES = 5

export default function App() {
  const dailyVideo = getDailyVideo()
  const [guesses, setGuesses] = useState<string[]>([])
  const [won, setWon] = useState(false)
  const [lost, setLost] = useState(false)
  const [shake, setShake] = useState(false)
  const [responseMessage, setResponseMessage] = useState<string | null>(null)
  const [responseType, setResponseType] = useState<"wrong" | "correct" | "lost" | null>(null)
  const [showResponse, setShowResponse] = useState(false)
  const [showShare, setShowShare] = useState(false)

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
          if (state.won) {
            setResponseMessage(getCorrectResponse())
            setResponseType("correct")
            setShowResponse(true)
          } else if (state.lost) {
            setResponseMessage(getLostResponse(dailyVideo.title))
            setResponseType("lost")
            setShowResponse(true)
          }
        }
      } catch {
        localStorage.removeItem("yapdle_state")
      }
    }
  }, [dailyVideo.id, dailyVideo.title])

  const saveState = useCallback(
    (newGuesses: string[], newWon: boolean, newLost: boolean) => {
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

  const handleGuess = useCallback(
    (title: string) => {
      const isCorrect = title === dailyVideo.title
      const newGuesses = [...guesses, title]
      setGuesses(newGuesses)

      if (isCorrect) {
        setWon(true)
        saveState(newGuesses, true, false)
        setResponseMessage(getCorrectResponse())
        setResponseType("correct")
        setShowResponse(true)
        setTimeout(() => setShowShare(true), 2500)
      } else if (newGuesses.length >= MAX_GUESSES) {
        setLost(true)
        saveState(newGuesses, false, true)
        setResponseMessage(getLostResponse(dailyVideo.title))
        setResponseType("lost")
        setShowResponse(true)
        setTimeout(() => setShowShare(true), 2000)
      } else {
        saveState(newGuesses, false, false)
        setResponseMessage(getWrongResponse())
        setResponseType("wrong")
        setShowResponse(false)
        setShake(true)
        requestAnimationFrame(() => {
          setShowResponse(true)
          setTimeout(() => setShake(false), 500)
        })
      }
    },
    [guesses, dailyVideo.title, saveState]
  )

  const disabled = won || lost

  return (
    <div className="min-h-screen flex flex-col items-center">
      <Header />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 flex flex-col items-center gap-5">
        <div className="text-center">
          <span className="text-yapdle-muted text-xs font-mono">
            Yapdle #{yapdleNumber}
          </span>
        </div>

        <Thumbnail
          thumbnailId={dailyVideo.thumbnailId}
          revealed={won || lost}
        />

        <GuessList
          guesses={guesses}
          maxGuesses={MAX_GUESSES}
          correctTitle={dailyVideo.title}
          won={won}
        />

        {showResponse && responseMessage && (
          <ResponseMessage
            message={responseMessage}
            type={responseType}
            visible={true}
          />
        )}

        {!disabled && (
          <GuessInput
            onGuess={handleGuess}
            disabled={disabled}
            previousGuesses={guesses}
            shake={shake}
          />
        )}

        {disabled && (
          <p className="text-yapdle-muted text-xs mt-2">
            Come back tomorrow for a new Yapdle!
          </p>
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
        guesses={guesses}
        won={won}
        videoTitle={dailyVideo.title}
      />
    </div>
  )
}
