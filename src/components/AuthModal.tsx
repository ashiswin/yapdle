import { useState } from "react"
import { useAuth } from "../context/AuthContext"

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle, username, signOut } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const err = isSignUp
      ? await signUp(name.trim(), password)
      : await signIn(name.trim(), password)

    setSubmitting(false)
    if (err) setError(err)
    else onClose()
  }

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-yapdle-surface rounded-2xl border border-yapdle-border p-6 max-w-sm w-full bounce-in shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {username ? (
          <>
            <h2 className="text-xl font-bold text-yapdle-accent text-center mb-2">
              Account
            </h2>
            <p className="text-yapdle-muted text-center text-sm mb-4">
              Signed in as {username}
            </p>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-yapdle-accent text-center mb-4">
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-yapdle-bg border border-yapdle-border text-yapdle-text placeholder-yapdle-muted focus:outline-none focus:border-yapdle-accent transition-colors text-sm"
                maxLength={20}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-yapdle-bg border border-yapdle-border text-yapdle-text placeholder-yapdle-muted focus:outline-none focus:border-yapdle-accent transition-colors text-sm"
                required
                minLength={6}
              />

              {error && (
                <p className="text-yapdle-wrong text-xs text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2.5 rounded-lg bg-yapdle-share hover:bg-green-600 text-white font-medium transition-colors text-sm disabled:opacity-50"
              >
                {submitting ? "..." : isSignUp ? "Create Account" : "Sign In"}
              </button>
            </form>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-yapdle-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-yapdle-surface px-2 text-yapdle-muted">or</span>
              </div>
            </div>

            <button
              onClick={signInWithGoogle}
              className="w-full px-4 py-2.5 rounded-lg bg-white hover:bg-gray-100 text-gray-800 font-medium transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-yapdle-muted text-xs text-center mt-4">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
                className="text-yapdle-accent hover:underline"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full mt-3 px-4 py-2 text-yapdle-muted hover:text-yapdle-text transition-colors text-sm"
        >
          Close
        </button>
      </div>
    </div>
  )
}
