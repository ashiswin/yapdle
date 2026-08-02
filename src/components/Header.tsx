interface HeaderProps {
  onArchive: () => void
  onAuth: () => void
  onLeaderboard: () => void
  username: string | null
}

export function Header({ onArchive, onAuth, onLeaderboard, username }: HeaderProps) {
  return (
    <header className="w-full py-4 border-b border-yapdle-border">
      <div className="flex items-center justify-between px-6">
        <button
          onClick={onLeaderboard}
          className="text-yapdle-muted hover:text-yapdle-text transition-colors"
          title="Statistics"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="12" width="4" height="8" rx="1" />
            <rect x="10" y="7" width="4" height="13" rx="1" />
            <rect x="17" y="3" width="4" height="17" rx="1" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-wide text-yapdle-accent">
            Yapdle
          </h1>
          <p className="text-yapdle-muted text-sm mt-1">
            Guess the penguinz0 video from its thumbnail
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onArchive}
            className="text-yapdle-muted hover:text-yapdle-text transition-colors text-xs font-medium"
          >
            Archive
          </button>
          <button
            onClick={onAuth}
            className="text-yapdle-muted hover:text-yapdle-text transition-colors text-xs font-medium"
          >
            {username ?? "Sign in"}
          </button>
        </div>
      </div>
    </header>
  )
}
