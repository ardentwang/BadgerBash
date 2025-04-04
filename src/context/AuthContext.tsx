"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

// "constructor" for what an AuthContext should contain
type AuthContextType = {
  session: Session | null
  user: User | null
  isGuest: boolean
  isLoading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Function to fetch current session and user
  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setSession(session)
    setUser(session?.user ?? null)
    setIsGuest(session?.user?.user_metadata?.is_guest ?? false)
  }

  // Function to create a guest user
  const createGuestUser = async () => {
    try {
      // Generate a random username
      const guestUsername = `Badger_${uuidv4().slice(0, 6)}`
      
      // Sign in anonymously
      const { data, error } = await supabase.auth.signInAnonymously()
      
      if (error) {
        console.error('Error signing in anonymously:', error)
        return
      }
      
      // Update user metadata
      if (data.user) {
        await supabase.auth.updateUser({
          data: {
            username: guestUsername,
            avatar_url: '/avatars/student.png',
            is_guest: true
          }
        })
        
        // Store user profile in database
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            username: guestUsername,
            avatar_url: '/avatars/student.png',
            is_guest: true
          }, { onConflict: 'id' })
        
        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      }
      
      // Refresh user data
      await refreshUser()
      
    } catch (error) {
      console.error('Error creating guest user:', error)
    }
  }

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      setIsLoading(true)
      
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession()
        
        // If no session, create a guest user
        if (!session) {
          await createGuestUser()
        } else {
          // If session exists, set the user
          setSession(session)
          setUser(session.user)
          setIsGuest(session.user?.user_metadata?.is_guest ?? false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initAuth()
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsGuest(session?.user?.user_metadata?.is_guest ?? false)
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user, 
        isGuest, 
        isLoading, 
        refreshUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}