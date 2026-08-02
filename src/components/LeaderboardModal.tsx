import { useEffect, useState } from "react"
import { supabase } from "../supabase/client"

interface LeaderboardEntry {
  username: string
  games_played: number
  wins: number
  current_streak: number
  best_streak: number
}

interface LeaderboardModalProps {
  open: boolean
  onClose: () => void
}

export function LeaderboardModal({ open, onClose }: LeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    supabase
      .from("leaderboard")
      .select("*")
      .order("wins", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setEntries(data || [])
        setLoading(false)
      })
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-yapdle-surface rounded-2xl border border-yapdle-border p-6 max-w-lg w-full bounce-in shadow-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-yapdle-accent text-center mb-4">
          Leaderboard
        </h2>

        {loading ? (
          <p className="text-yapdle-muted text-center text-sm">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-yapdle-muted text-center text-sm">No games played yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-yapdle-border text-yapdle-muted text-xs">
                  <th className="py-2 px-2 text-left">#</th>
                  <th className="py-2 px-2 text-left">Player</th>
                  <th className="py-2 px-2 text-right">Played</th>
                  <th className="py-2 px-2 text-right">Wins</th>
                  <th className="py-2 px-2 text-right">Streak</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={entry.username}
                    className="border-b border-yapdle-border/30 hover:bg-yapdle-surface2/50 transition-colors"
                  >
                    <td className="py-2 px-2 text-yapdle-muted font-mono text-xs">
                      {i + 1}
                    </td>
                    <td className="py-2 px-2 font-medium text-yapdle-text">
                      {entry.username}
                    </td>
                    <td className="py-2 px-2 text-right text-yapdle-muted">
                      {entry.games_played}
                    </td>
                    <td className="py-2 px-2 text-right text-yapdle-correct font-medium">
                      {entry.wins}
                    </td>
                    <td className="py-2 px-2 text-right text-yapdle-accent">
                      {entry.current_streak}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
