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

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const ORIGIN_MS = Date.UTC(2026, 6, 28)

export function getDailySeed(dateStr?: string): number {
  const str = dateStr || todayStr()
  return hashCode(str)
}

export function getDailyVideo(dateStr?: string): Video {
  const videos = getAllVideos()
  const seed = getDailySeed(dateStr)
  return videos[seed % videos.length]
}

export function getYapdleNumber(dateStr?: string): number {
  const str = dateStr || todayStr()
  const [y, m, d] = str.split("-").map(Number)
  const dateMs = Date.UTC(y, m - 1, d)
  const diff = Math.floor((dateMs - ORIGIN_MS) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff + 1)
}

export function getDateFromNumber(num: number): string {
  const ms = ORIGIN_MS + (num - 1) * 1000 * 60 * 60 * 24
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
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

export interface GuessEntry {
  title: string
  response: string
  correct: boolean
}

const STREAK_KEY = "yapdle_streak"

export function getStreak(): number {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) return 0
    const data = JSON.parse(raw)
    const { count, lastPlayedDate } = data
    if (lastPlayedDate === todayStr()) return count
    if (lastPlayedDate === yesterdayStr()) return count
    return 0
  } catch {
    return 0
  }
}

export function updateStreak(): void {
  const today = todayStr()
  const prev = getStreak()
  let newCount: number

  if (prev === 0) {
    newCount = 1
  } else {
    const raw = localStorage.getItem(STREAK_KEY)
    const data = raw ? JSON.parse(raw) : {}
    if (data.lastPlayedDate === today) {
      newCount = prev
    } else {
      newCount = prev + 1
    }
  }

  localStorage.setItem(STREAK_KEY, JSON.stringify({ count: newCount, lastPlayedDate: today }))
}

const ARCHIVE_KEY = "yapdle_archive"

export interface ArchiveEntry {
  guesses: GuessEntry[]
  won: boolean
  yapdleNumber: number
}

export function getArchive(): Record<number, ArchiveEntry> {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveToArchive(dateStr: string, guesses: GuessEntry[], won: boolean): void {
  const archive = getArchive()
  const num = getYapdleNumber(dateStr)
  archive[num] = { guesses, won, yapdleNumber: num }
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive))
}
