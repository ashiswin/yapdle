import { useEffect, useState } from "react"
import { supabase } from "../supabase/client"
import { getArchive, getStreak, getYapdleNumber } from "../utils/game"

interface LeaderboardEntry {
  username: string
  games_played: number
  wins: number
  current_streak: number
  best_streak: number
}

interface PlayerStats {
  played: number
  wins: number
  streak: number
  maxStreak: number
  distribution: number[]
}

interface LeaderboardModalProps {
  open: boolean
  onClose: () => void
  username: string | null
}

function computeLocalStats(): PlayerStats {
  const archive = getArchive()
  const nums = Object.keys(archive).map(Number).sort((a, b) => a - b)
  const played = nums.length
  const wins = nums.filter((n) => archive[n].won).length
const dist = [0, 0, 0, 0, 0, 0]
    for (const n of nums) {
      if (archive[n].won) {
        const g = archive[n].guesses.length
        if (g >= 1 && g <= 6) dist[g - 1]++
    }
  }

  let maxStreak = 0
  let curr = 0
  for (let n = 1; n <= getYapdleNumber(); n++) {
    if (archive[n]) {
      curr++
      if (curr > maxStreak) maxStreak = curr
    } else {
      curr = 0
    }
  }

  return {
    played,
    wins,
    streak: getStreak(),
    maxStreak,
    distribution: dist,
  }
}

export function LeaderboardModal({ open, onClose, username }: LeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<PlayerStats | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)

    Promise.all([
      supabase.from("leaderboard").select("*").order("wins", { ascending: false }).limit(50),
      username
        ? supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return null
            return supabase.from("results").select("guesses_count,won").eq("user_id", user.id)
          })
        : Promise.resolve(null),
    ]).then(async ([lbResult, statsResult]) => {
      setEntries(lbResult.data || [])

      if (username && statsResult) {
        const results = (statsResult.data || []) as { guesses_count: number; won: boolean }[]
        const wins = results.filter((r) => r.won)
        const dist = [0, 0, 0, 0, 0, 0]
        for (const r of wins) {
          const g = r.guesses_count
          if (g >= 1 && g <= 6) dist[g - 1]++
        }
        const { data: myRow } = await supabase.from("leaderboard").select("*").eq("username", username).single()
        setStats({
          played: results.length,
          wins: wins.length,
          streak: myRow?.current_streak ?? 0,
          maxStreak: myRow?.best_streak ?? 0,
          distribution: dist,
        })
      } else {
        setStats(computeLocalStats())
      }
      setLoading(false)
    })
  }, [open, username])

  const maxDist = stats ? Math.max(...stats.distribution, 1) : 1

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-yapdle-surface rounded-2xl border border-yapdle-border p-6 max-w-lg w-full bounce-in shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-yapdle-accent text-center mb-4">
          Statistics
        </h2>

        {stats && (
          <>
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yapdle-text">{stats.played}</div>
                <div className="text-[10px] text-yapdle-muted">Played</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yapdle-text">
                  {stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0}
                </div>
                <div className="text-[10px] text-yapdle-muted">Win %</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yapdle-text">{stats.streak}</div>
                <div className="text-[10px] text-yapdle-muted">Curr Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yapdle-text">{stats.maxStreak}</div>
                <div className="text-[10px] text-yapdle-muted">Max Streak</div>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-yapdle-muted text-center mb-3">
              Guess Distribution
            </h3>
            <div className="space-y-1.5 mb-6">
              {stats.distribution.map((count, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-yapdle-muted w-3">{i + 1}</span>
                  <div className="flex-1 h-5 bg-yapdle-bg rounded-sm overflow-hidden">
                    <div
                      className={`h-full rounded-sm transition-all duration-300 ${
                        count > 0 ? "bg-yapdle-correct" : "bg-yapdle-surface2"
                      }`}
                      style={{ width: `${(count / maxDist) * 100}%`, minWidth: count > 0 ? "12px" : 0 }}
                    />
                  </div>
                  <span className="text-yapdle-muted w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {loading && !stats && (
          <p className="text-yapdle-muted text-center text-sm mb-4">Loading...</p>
        )}

        <div className="border-t border-yapdle-border pt-4">
          <h3 className="text-sm font-semibold text-yapdle-muted text-center mb-3">
            Leaderboard
          </h3>

          {loading && !entries.length ? (
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
