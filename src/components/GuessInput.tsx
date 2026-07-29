import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { getAllTitles } from "../data/videos"

interface GuessInputProps {
  onGuess: (title: string) => void
  disabled: boolean
  previousGuesses: string[]
  shake: boolean
}

function highlightMatch(title: string, query: string) {
  const lowerTitle = title.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const idx = lowerTitle.indexOf(lowerQuery)

  if (idx === -1) return title

  const before = title.slice(0, idx)
  const match = title.slice(idx, idx + query.length)
  const after = title.slice(idx + query.length)

  return (
    <>
      {before}
      <span className="text-yapdle-accent font-semibold">{match}</span>
      {after}
    </>
  )
}

export function GuessInput({ onGuess, disabled, previousGuesses, shake }: GuessInputProps) {
  const [input, setInput] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const allTitles = getAllTitles()

  const filteredTitles = useMemo(() => {
    if (!input.trim()) return []

    const lowerInput = input.toLowerCase()

    return allTitles
      .filter(
        (t) =>
          t.toLowerCase().includes(lowerInput) &&
          !previousGuesses.includes(t)
      )
      .sort((a, b) => {
        const aIdx = a.toLowerCase().indexOf(lowerInput)
        const bIdx = b.toLowerCase().indexOf(lowerInput)
        if (aIdx !== bIdx) return aIdx - bIdx
        return a.length - b.length
      })
  }, [input, previousGuesses, allTitles])

  const reset = useCallback(() => {
    setInput("")
    setShowDropdown(false)
    setSelectedIndex(-1)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (disabled && inputRef.current) {
      inputRef.current.blur()
    }
  }, [disabled])

  const handleSubmit = (title: string) => {
    if (disabled || !title) return
    onGuess(title)
    reset()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (!showDropdown && filteredTitles.length > 0) {
        setShowDropdown(true)
        setSelectedIndex(0)
      } else {
        setSelectedIndex((prev) =>
          prev < filteredTitles.length - 1 ? prev + 1 : 0
        )
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredTitles.length - 1
      )
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < filteredTitles.length) {
        handleSubmit(filteredTitles[selectedIndex])
      } else if (filteredTitles.length === 1) {
        handleSubmit(filteredTitles[0])
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false)
      setSelectedIndex(-1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    setShowDropdown(true)
    setSelectedIndex(-1)
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => input.trim() && filteredTitles.length > 0 && setShowDropdown(true)}
        placeholder={disabled ? "Game over!" : "Start typing a video title..."}
        disabled={disabled}
        autoComplete="off"
        autoFocus
        className={`w-full px-4 py-3 rounded-lg bg-yapdle-surface border border-yapdle-border text-yapdle-text placeholder-yapdle-muted focus:outline-none focus:border-yapdle-accent transition-colors text-base ${
          shake ? "shake" : ""
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />

      {showDropdown && filteredTitles.length > 0 && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full mb-1 w-full max-h-60 overflow-y-auto bg-yapdle-surface border border-yapdle-border rounded-lg shadow-xl z-50"
        >
          {filteredTitles.map((title, i) => (
            <button
              key={title}
              onClick={() => handleSubmit(title)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-yapdle-surface2 transition-colors ${
                i === selectedIndex
                  ? "bg-yapdle-surface2 text-yapdle-accent"
                  : "text-yapdle-text"
              }`}
            >
              {highlightMatch(title, input.trim())}
            </button>
          ))}
        </div>
      )}

      {input.trim() && filteredTitles.length === 0 && !disabled && showDropdown && (
        <div className="absolute bottom-full mb-1 w-full bg-yapdle-surface border border-yapdle-border rounded-lg shadow-xl z-50 p-4 text-center text-yapdle-muted text-sm">
          No matching titles found
        </div>
      )}
    </div>
  )
}
