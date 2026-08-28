"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { Box, CircularProgress, Typography } from "@mui/material"
import { Profile, UserRole } from "@/app/types/database"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (data: SignUpData) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

interface SignUpData {
  email: string
  password: string
  full_name: string
  phone: string
  role: UserRole
  address?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // ✅ Refresh user profile from Supabase
  const refreshProfile = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error("Error refreshing profile:", err)
    }
  }

  // ✅ Sign In
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes("Invalid login credentials"))
          return { error: "Invalid email or password." }
        if (error.message.includes("Email not confirmed"))
          return { error: "Please verify your email before logging in." }
        return { error: error.message }
      }

      if (data.user) {
        setUser(data.user)
        await refreshProfile()
      }

      return {}
    } catch (err) {
      console.error("SignIn Error:", err)
      return { error: "Unexpected error occurred during sign-in." }
    }
  }

  // ✅ Sign Up
  const signUp = async (data: SignUpData) => {
    try {
      const cleanedPhone = data.phone.replace(/\D/g, "")
      const formattedPhone =
        cleanedPhone.length === 10 ? `+91${cleanedPhone}` : data.phone

      const { error } = await supabase.auth.signUp({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.full_name.trim(),
            phone: formattedPhone,
            role: data.role,
            address: data.address?.trim() || "",
          },
        },
      })

      if (error) {
        if (error.message.includes("User already registered"))
          return { error: "This email is already registered." }
        if (error.message.includes("Password"))
          return { error: "Password must be at least 6 characters long." }
        return { error: error.message }
      }

      return {}
    } catch (err) {
      console.error("SignUp Error:", err)
      return { error: "Unexpected error occurred during sign-up." }
    }
  }

  // ✅ Sign Out
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (err) {
      console.error("Error signing out:", err)
    }
  }

  // ✅ Initialize session & listen for auth state changes
  useEffect(() => {
    
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth change:", event, session?.user?.email)
        setUser(session?.user ?? null)
        if (session?.user) {
          setTimeout(async () => {
            await refreshProfile()
          }, 1000)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])
   useEffect(() => {
    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error

        setUser(data.session?.user ?? null)

        if (data.session?.user) {
          await refreshProfile()
        }
      } catch (err) {
        console.error("Error fetching session:", err)
      } finally {
        setLoading(false)
      }
    }

    initSession()


  }, [])

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
        gap={2}
      >
        <CircularProgress color="primary" />
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    )
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
