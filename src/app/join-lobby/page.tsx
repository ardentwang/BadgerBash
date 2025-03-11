"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import LobbyCard from '@/components/lobbycard'
import NavBar from '@/components/navbar/navbar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function JoinLobbyPage() {
  const router = useRouter()
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [lobbies, setLobbies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lobbyCode, setLobbyCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Fetch public lobbies
    const fetchLobbies = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const { data, error } = await supabase
          .from('lobbies')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setLobbies(data || [])
      } catch (err) {
        console.error('Error fetching lobbies:', err)
        setError('Failed to load available lobbies')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchLobbies()
    
    // Set up real-time subscription for lobbies
    const lobbiesSubscription = supabase
      .channel('public_lobbies')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'lobbies',
        filter: 'is_public=eq.true'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setLobbies(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'DELETE') {
          setLobbies(prev => prev.filter(lobby => lobby.id !== payload.old.id))
        } else if (payload.eventType === 'UPDATE') {
          setLobbies(prev => 
            prev.map(lobby => 
              lobby.id === payload.new.id ? payload.new : lobby
            )
          )
        }
      })
      .subscribe()
    
    return () => {
      lobbiesSubscription.unsubscribe()
    }
  }, [])
  
  const handleJoinWithCode = async () => {
    if (!lobbyCode || lobbyCode.length < 6) {
      setError('Please enter a valid 6-digit code')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Check if lobby exists
      const { data, error } = await supabase
        .from('lobbies')
        .select('lobby_code, player_count')
        .eq('lobby_code', parseInt(lobbyCode))
        .single()
      
      if (error || !data) {
        setError('Lobby not found')
        return
      }
      
      if (data.player_count >= 4) {
        setError('Lobby is full')
        return
      }
      
      // Navigate to the lobby - joining will be handled in the lobby page
      router.push(`/lobby/${lobbyCode}`)
      
    } catch (err) {
      console.error('Error joining with code:', err)
      setError('Failed to join lobby')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="bg-background min-h-screen">
      <NavBar />
      
      <div className="container mx-auto pt-24 pb-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Join a Game</h1>
        
        <div className="max-w-md mx-auto mb-12">
          <div className="flex gap-4 mb-2">
            <Input
              placeholder="Enter 6-digit lobby code"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={6}
            />
            <Button onClick={handleJoinWithCode} disabled={isLoading}>
              Join
            </Button>
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        
        <h2 className="text-xl font-bold mb-4">Public Lobbies</h2>
        
        {isLoading ? (
          <div className="text-center py-8">Loading lobbies...</div>
        ) : lobbies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No public lobbies available. Create your own game!
          </div>
        ) : (
          <div className="space-y-4">
            {lobbies.map(lobby => (
              <LobbyCard
                key={lobby.id}
                lobby_code={lobby.lobby_code}
                name={lobby.name}
                player_count={lobby.player_count}
                isPublic={lobby.is_public}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}