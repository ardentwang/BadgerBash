"use client"

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import PlayerSlot from '@/components/lobby/PlayerSlot'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from "sonner"

// Define types for better type safety
type Player = {
  id: string
  user_id: string
  username: string
  avatar_url: string
  joined_at: string
}

type Lobby = {
  id: string
  name: string
  lobby_code: string
  player_count: number
  game_started: boolean
}

export default function LobbyPage() {
  const { code } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  
  const [lobby, setLobby] = useState<Lobby | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [lobbyName, setLobbyName] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasJoined, setHasJoined] = useState(false)
  
  // Ref to track real component unmounting vs tab switching
  const isUnmountingRef = useRef(false)
  
  // Handle component unmount
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true
    }
  }, [])

  // Fetch lobby details
  useEffect(() => {
    if (!code || !user) return
    
    const fetchLobby = async () => {
      try {
        // Get the lobby by code
        const { data: lobbyData, error: lobbyError } = await supabase
          .from('lobbies')
          .select('*')
          .eq('lobby_code', code)
          .single()
        
        if (lobbyError || !lobbyData) {
          console.error('Error fetching lobby:', lobbyError)
          toast.error('Lobby not found', {
            description: 'The lobby you are looking for does not exist'
          })
          router.push('/')
          return
        }
        
        setLobby(lobbyData)
        setLobbyName(lobbyData.name)
        
        // Fetch players in this lobby
        const { data: playersData } = await supabase
          .from('lobby_players')
          .select('*')
          .eq('lobby_id', lobbyData.id)
          .order('joined_at', { ascending: true })
        
        setPlayers(playersData || [])
        
        // Check if user is already in this lobby
        const existingPlayer = playersData?.find(p => p.user_id === user.id)
        if (existingPlayer) {
          setHasJoined(true)
        } else {
          // Join the lobby if not already in
          await joinLobby(lobbyData.id)
        }
        
        // Check if user is the host (first player)
        if (playersData && playersData.length > 0) {
          setIsHost(playersData[0].user_id === user.id)
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error in lobby setup:', error)
        setIsLoading(false)
        toast.error('Error loading lobby')
      }
    }
    
    fetchLobby()
  }, [code, user, router])
  
  // Subscribe to lobby player changes
  useEffect(() => {
    if (!lobby || !lobby.id) return
    
    // Set up real-time subscription for player changes
    const subscription = supabase
      .channel('lobby_players_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_players',
          filter: `lobby_id=eq.${lobby.id}`
        },
        async () => {
          // Refetch all players when anything changes
          const { data } = await supabase
            .from('lobby_players')
            .select('*')
            .eq('lobby_id', lobby.id)
            .order('joined_at', { ascending: true })
          
          setPlayers(data || [])
          
          // Update host status based on first player
          if (data && data.length > 0 && user) {
            setIsHost(data[0].user_id === user.id)
          }
        }
      )
      .subscribe()
      
    // Subscribe to lobby changes (for game_started status)
    const lobbySubscription = supabase
      .channel('lobby_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lobbies',
          filter: `id=eq.${lobby.id}`
        },
        (payload) => {
          setLobby(payload.new as Lobby)
          
          // If game started, redirect to game page
          if (payload.new.game_started && !payload.old.game_started) {
            router.push(`/game/${code}`)
          }
        }
      )
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
      lobbySubscription.unsubscribe()
    }
  }, [lobby, user, router, code])
  
  // Handle beforeunload to clean up when browser is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasJoined && user && lobby) {
        // Synchronous version of leave lobby for page unload
        // const leaveUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/lobby_players?lobby_id=eq.${lobby.id}&user_id=eq.${user.id}`
        
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/lobby_players?lobby_id=eq.${lobby.id}&user_id=eq.${user.id}`,
          JSON.stringify({
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
            }
          })
        )
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      // Handle actual component unmount (not just tab switching)
      if (isUnmountingRef.current && hasJoined) {
        handleLeaveLobby(true)
      }
    }
  }, [hasJoined, user, lobby])
  
  // Join the lobby
  const joinLobby = async (lobbyId: string) => {
    if (!user) return
    
    try {
      // Instead of checking first then inserting,
      // use upsert with onConflict option to handle duplicates gracefully
      const { error: joinError } = await supabase
        .from('lobby_players')
        .upsert({
          lobby_id: lobbyId,
          user_id: user.id,
          username: user.user_metadata?.username || 'Anonymous',
          avatar_url: user.user_metadata?.avatar_url || '/avatars/student.png',
          joined_at: new Date().toISOString()
        }, { 
          onConflict: 'lobby_id,user_id',
          ignoreDuplicates: true 
        })
      
      if (joinError) {
        console.error('Join error:', joinError)
        throw joinError
      }
      
      // Only increment player count if this was a new insertion
      // You might need a separate way to check if the player was just added
      // or was already in the lobby
      
      setHasJoined(true)
      toast.success('Joined lobby successfully')
    } catch (error) {
      console.error('Error joining lobby:', error)
      toast.error(`Failed to join lobby: ${error || 'Unknown error'}`)
    }
  }
  
  // Update lobby name
  const updateLobbyName = async () => {
    if (!lobby || !isHost) return
    
    try {
      const { error } = await supabase
        .from('lobbies')
        .update({ name: lobbyName })
        .eq('id', lobby.id)
      
      if (error) throw error
      
      toast.success('Lobby name updated')
    } catch (error) {
      console.error('Error updating lobby name:', error)
      toast.error('Failed to update lobby name')
    }
  }
  
  // Handle leaving the lobby
  const handleLeaveLobby = async (isUnmount = false) => {
    if (!user || !lobby || !hasJoined) return
    
    try {
      // Remove from lobby_players
      const { error: leaveError } = await supabase
        .from('lobby_players')
        .delete()
        .eq('lobby_id', lobby.id)
        .eq('user_id', user.id)
      
      if (leaveError) throw leaveError
      
      // Decrement player count
      await supabase.rpc('decrement_player_count', { lobby_id: lobby.id })
      
      setHasJoined(false)
      
      if (!isUnmount) {
        toast.success('Left lobby')
        router.push('/')
      }
    } catch (error) {
      console.error('Error leaving lobby:', error)
      if (!isUnmount) {
        toast.error('Failed to leave lobby')
      }
    }
  }
  
  // Start the game
  const handleStartGame = async () => {
    if (!lobby || !isHost) return
    
    if (players.length < 2) {
      toast.error('Not enough players', {
        description: 'You need at least 2 players to start a game'
      })
      return
    }
    
    try {
      const { error } = await supabase
        .from('lobbies')
        .update({ game_started: true })
        .eq('id', lobby.id)
      
      if (error) throw error
      
      router.push(`/game/${lobby.lobby_code}`)
    } catch (error) {
      console.error('Error starting game:', error)
      toast.error('Failed to start game')
    }
  }
  
  if (isLoading || !lobby) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p>Loading lobby...</p>
      </div>
    )
  }
  
  return (
    <div>
      <Button className="absolute mt-5 ml-5" variant="outline" size="icon" asChild>
        <Link href="/">
          <ChevronLeft />
        </Link>
      </Button>
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="lobbyName" className="text-sm font-medium">
                Lobby Name
              </label>
              <div className="flex gap-2">
                <Input
                  id="lobbyName"
                  value={lobbyName}
                  onChange={(e) => setLobbyName(e.target.value)}
                  disabled={!isHost}
                />
                {isHost && (
                  <Button
                    variant="outline"
                    onClick={updateLobbyName}
                    disabled={lobbyName === lobby.name}
                  >
                    Update
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lobby Code</label>
              <div className="bg-secondary p-3 rounded-lg">
                <p className="text-center font-mono text-2xl tracking-wider">
                  {lobby.lobby_code}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Players ({players.length}/4)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Always show 4 player slots */}
                {Array.from({ length: 4 }).map((_, index) => (
                  <PlayerSlot 
                  key={index}
                  player={players[index] || null}
                  isCurrentUser={players[index]?.user_id === user?.id}
                  isHost={index === 0}  // First player is the host
                />
                ))}
              </div>
              
              <div className="flex gap-4 mt-6 pt-4 border-t">
                <Button 
                  className="w-full" 
                  onClick={handleStartGame}
                  disabled={!isHost || players.length < 2}
                >
                  Start Game
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleLeaveLobby()}
                >
                  Leave Lobby
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}