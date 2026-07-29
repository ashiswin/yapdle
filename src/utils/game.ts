import { getAllVideos } from "../data/videos"
import type { Video } from "../data/videos"

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

export function getDailySeed(): number {
  const today = new Date()
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  return hashCode(dateStr)
}

export function getDailyVideo(): Video {
  const videos = getAllVideos()
  const seed = getDailySeed()
  return videos[seed % videos.length]
}

export function getYapdleNumber(): number {
  const origin = new Date("2026-07-28")
  const today = new Date()
  const diff = Math.floor((today.getTime() - origin.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff + 1)
}

export function shareResult(guesses: string[], won: boolean, _videoTitle: string): string {
  const yapdleNumber = getYapdleNumber()
  const emojis = guesses.map((_, i) => {
    if (i === guesses.length - 1 && won) return "🟩"
    return "🟥"
  })
  const total = won ? guesses.length : "X"
  const lines = [
    `Yapdle #${yapdleNumber} ${total}/5`,
    "",
    emojis.join(""),
    "",
    `https://yapdle.com`,
  ]
  return lines.join("\n")
}
