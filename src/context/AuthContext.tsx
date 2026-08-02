import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "../supabase/client"

interface AuthState {
  username: string | null
  loading: boolean
  signUp: (username: string, password: string) => Promise<string | null>
  signIn: (username: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from("profiles").select("username").eq("id", session.user.id).single()
          .then(
            ({ data }) => setUsername(data?.username ?? null),
            () => {}
          )
        setLoading(false)
      } else {
        setLoading(false)
      }
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("username").eq("id", session.user.id).single()
        setUsername(data?.username ?? null)
      } else {
        setUsername(null)
      }
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const signUp = async (name: string, password: string) => {
    const email = `${name.toLowerCase().replace(/\s+/g, "_")}@yapdle.user`
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: name } },
    })
    if (error) return error.message
    if (data.user) {
      const { error: profileErr } = await supabase.from("profiles").upsert({ id: data.user.id, username: name })
      if (profileErr) return profileErr.message
    }
    return null
  }

  const signIn = async (name: string, password: string) => {
    const { data: profile } = await supabase.from("profiles").select("id").eq("username", name).single()
    if (!profile) return "Username not found"

    const email = `${name.toLowerCase().replace(/\s+/g, "_")}@yapdle.user`
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ username, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
