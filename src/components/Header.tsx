interface HeaderProps {
  onArchive: () => void
}

export function Header({ onArchive }: HeaderProps) {
  return (
    <header className="w-full py-4 border-b border-yapdle-border">
      <div className="relative flex items-center justify-between max-w-2xl mx-auto px-4">
        <div />
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-wide text-yapdle-accent">
            Yapdle
          </h1>
          <p className="text-yapdle-muted text-sm mt-1">
            Guess the penguinz0 video from its thumbnail
          </p>
        </div>
        <button
          onClick={onArchive}
          className="text-yapdle-muted hover:text-yapdle-text transition-colors text-xs font-medium"
        >
          Archive
        </button>
      </div>
    </header>
  )
}
