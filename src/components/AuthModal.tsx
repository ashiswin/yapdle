import { useState } from "react"
import { useAuth } from "../context/AuthContext"

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { signIn, signUp, user, signOut } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    let err: string | null
    if (isSignUp) {
      if (!username.trim()) {
        setError("Username is required")
        setSubmitting(false)
        return
      }
      err = await signUp(email, password, username.trim())
    } else {
      err = await signIn(email, password)
    }

    setSubmitting(false)
    if (err) setError(err)
    else onClose()
  }

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-yapdle-surface rounded-2xl border border-yapdle-border p-6 max-w-sm w-full bounce-in shadow-2xl">
        {user ? (
          <>
            <h2 className="text-xl font-bold text-yapdle-accent text-center mb-2">
              Account
            </h2>
            <p className="text-yapdle-muted text-center text-sm mb-4">
              Signed in as {user.email}
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
              {isSignUp && (
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-yapdle-bg border border-yapdle-border text-yapdle-text placeholder-yapdle-muted focus:outline-none focus:border-yapdle-accent transition-colors text-sm"
                  maxLength={20}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-yapdle-bg border border-yapdle-border text-yapdle-text placeholder-yapdle-muted focus:outline-none focus:border-yapdle-accent transition-colors text-sm"
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
