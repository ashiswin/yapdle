interface ResponseMessageProps {
  message: string | null
  type: "wrong" | "correct" | "lost" | null
  visible: boolean
}

export function ResponseMessage({ message, type, visible }: ResponseMessageProps) {
  if (!message || !visible || !type) return null

  const colors: Record<string, string> = {
    wrong: "text-yapdle-wrong border-yapdle-wrong/20 bg-red-500/5",
    correct: "text-yapdle-correct border-yapdle-correct/20 bg-green-500/5",
    lost: "text-yapdle-wrong border-yapdle-wrong/20 bg-red-500/5",
  }

  return (
    <div
      className={`w-full max-w-lg mx-auto px-4 py-3 rounded-lg border text-sm bounce-in ${colors[type]}`}
    >
      {message}
    </div>
  )
}
