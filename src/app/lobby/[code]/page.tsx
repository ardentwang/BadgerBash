"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import PlayerSlot from '@/components/lobby/PlayerSlot'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function LobbyPage() {
  const { code } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  
  const [lobby, setLobby] = useState<any>(null)
  const [lobbyName, setLobbyName] = useState('')
  const [players, setPlayers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // This will track our subscriptions so we can clean them up
  const [subscriptions, setSubscriptions] = useState<any>({
    lobby: null,
    players: null
  })

  // Function to handle page unload (closing browser/navigating away)
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user && code) {
        // Try to remove player when they're actually leaving the page
        try {
          await removePlayerFromLobby(code, user.id)
        } catch (err) {
          console.error('Error removing player during page unload:', err)
        }
      }
    }

    // Add unload handlers
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [user, code])

  useEffect(() => {
    // Make sure we have a user and lobby code
    if (!user || !code) return
    
    // Function to fetch initial lobby data
    const fetchLobbyData = async () => {
      try {
        // Get lobby data
        const { data: lobbyData, error: lobbyError } = await supabase
          .from('lobbies')
          .select('*')
          .eq('lobby_code', code)
          .single()
        
        if (lobbyError) {
          console.error('Error fetching lobby:', lobbyError)
          setError('Lobby not found or cannot be accessed')
          setIsLoading(false)
          return
        }
        
        setLobby(lobbyData)
        setLobbyName(lobbyData.name || 'New Lobby')
        
        // Get players in the lobby
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('lobby_code', code)
          .order('joined_at', { ascending: true })
        
        if (playersError) {
          console.error('Error fetching players:', playersError)
          setError('Could not load players')
          setIsLoading(false)
          return
        }
        
        setPlayers(playersData || [])
        setIsLoading(false)
        
        // Add current user to lobby if not already present
        const existingPlayer = playersData?.find(p => p.user_id === user.id)
        if (!existingPlayer) {
          try {
            await addPlayerToLobby(code, user)
          } catch (err) {
            console.error('Error adding player to lobby:', err)
            // Continue - we'll still show the lobby even if joining fails
          }
        }
      } catch (err) {
        console.error('Error in lobby initialization:', err)
        setError('Failed to initialize lobby')
        setIsLoading(false)
      }
    }
    
    // Setup real-time subscriptions
    const setupSubscriptions = () => {
      // 1. Subscribe to lobby updates
      const lobbyChannel = supabase
        .channel(`lobby:${code}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'lobbies',
          filter: `lobby_code=eq.${code}`
        }, (payload) => {
          console.log('Lobby updated:', payload)
          if (payload.eventType === 'UPDATE') {
            setLobby(payload.new)
            setLobbyName(payload.new.name || 'New Lobby')
          } else if (payload.eventType === 'DELETE') {
            // Lobby was deleted, redirect to home
            router.push('/')
          }
        })
        .subscribe()
      
      // 2. Subscribe to player updates
      const playersChannel = supabase
        .channel(`players:${code}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'players',
          filter: `lobby_code=eq.${code}`
        }, (payload) => {
          console.log('Players updated:', payload)
          if (payload.eventType === 'INSERT') {
            setPlayers(prev => [...prev, payload.new])
          } else if (payload.eventType === 'DELETE') {
            setPlayers(prev => prev.filter(p => p.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
          }
        })
        .subscribe()
      
      // Store subscription references for cleanup
      setSubscriptions({
        lobby: lobbyChannel,
        players: playersChannel
      })
    }
    
    // Initialize everything
    fetchLobbyData().then(() => {
      setupSubscriptions()
    })
    
    // Cleanup function for component unmount
    return () => {
      // Unsubscribe from all channels
      if (subscriptions.lobby) subscriptions.lobby.unsubscribe()
      if (subscriptions.players) subscriptions.players.unsubscribe()
      
      // When explicitly navigating away using UI (not tab/window closing)
      if (user) {
        removePlayerFromLobby(code, user.id).catch(console.error)
      }
    }
  }, [code, user, router])
  
  // Handle leaving the lobby
  const handleLeaveLobby = async () => {
    try {
      if (user) {
        await removePlayerFromLobby(code, user.id)
        router.push('/')
      }
    } catch (error) {
      console.error('Error leaving lobby:', error)
    }
  }
  
  // Handle starting the game
  const handleStartGame = () => {
    // Logic to start the game goes here
    alert('Game starting!')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading lobby...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-xl text-red-500">{error}</div>
        <Button onClick={() => router.push('/')}>Return Home</Button>
      </div>
    )
  }
  
  if (!lobby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-xl">Lobby not found</div>
        <Button onClick={() => router.push('/')}>Return Home</Button>
      </div>
    )
  }
  
  // Find the current user in the players list
  const currentPlayer = players.find(p => p.user_id === user?.id);
  const isHost = currentPlayer?.is_host || false
  
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
              <Input
                id="lobbyName"
                value={lobbyName}
                onChange={(e) => setLobbyName(e.target.value)}
                onBlur={async () => {
                  // Only allow host to update lobby name
                  if (isHost) {
                    // update backend when user finishes editing
                    const { error } = await supabase
                      .from('lobbies')
                      .update({ name: lobbyName }) 
                      .eq('lobby_code', code) 
                      .select()
                    if (error) {
                      console.error('Error updating lobby name:', error);
                    }
                  }
                }}
                disabled={!isHost}
                className="text-lg font-semibold"
              />
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
              <h3 className="text-lg font-semibold">Players ({players.length}/4)</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Always show 4 player slots */}
                {Array.from({ length: 4 }).map((_, index) => (
                  <PlayerSlot 
                    key={index}
                    player={players[index] || null}
                    isCurrentUser={players[index]?.user_id === user?.id}
                  />
                ))}
              </div>
              
              <div className="flex gap-4 mt-6 pt-4 border-t">
                {isHost && players.length >= 2 && (
                  <Button 
                    className="w-full" 
                    onClick={handleStartGame}
                  >
                    Start Game
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleLeaveLobby}
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

async function addPlayerToLobby(lobbyCode:any, user:any) {
  try {
    // Convert lobby code to integer if it's a string
    const lobbyCodeInt = typeof lobbyCode === 'string' ? parseInt(lobbyCode) : lobbyCode;
    
    // First, try to upsert the player instead of insert
    // This handles the race condition by using the database's atomicity
    const { data, error } = await supabase
      .from('players')
      .upsert({
        lobby_code: lobbyCodeInt,
        user_id: user.id,
        name: user.user_metadata?.username || 'Guest',
        avatar_url: user.user_metadata?.avatar_url || '/avatars/student.png',
        is_host: false, // We'll handle host assignment separately
        joined_at: new Date().toISOString()
      }, {
        onConflict: 'lobby_code,user_id', // This specifies which columns form the unique constraint
        ignoreDuplicates: false // Update the row if it exists
      })
      .select();
    
    if (error) {
      console.error('Upsert error:', error);
      throw error;
    }
    
    // Check if we need to update the player count in the lobby
    // Only do this if the player was newly inserted (not updated)
    if (data && data.length > 0) {
      // Update player count in lobby table
      const { data: lobbyData, error: lobbyError } = await supabase
        .from('lobbies')
        .select('player_count')
        .eq('lobby_code', lobbyCodeInt)
        .single();
      
      if (!lobbyError && lobbyData) {
        await supabase
          .from('lobbies')
          .update({ player_count: lobbyData.player_count + 1 })
          .eq('lobby_code', lobbyCodeInt);
      }
    }
    
    return data;
  } catch (error) {
    // @ts-expect-error type safe
    if (error && error.code === '23505') {
      // If it's still a duplicate key error, log it but don't throw
      console.warn('Player already in lobby, ignoring duplicate insertion');
      
      // Try to fetch the existing player info
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('lobby_code', typeof lobbyCode === 'string' ? parseInt(lobbyCode) : lobbyCode)
        .eq('user_id', user.id)
        .single();
      
      return data;
    }
    
    // For other errors, log and throw
    console.error('Error in addPlayerToLobby:', error);
    throw error;
  }
}

// Function to remove a player from the lobby
async function removePlayerFromLobby(lobbyCode:any, userId:any) {
  // Get the player to check if they're the host
  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('lobby_code', lobbyCode)
    .eq('user_id', userId)
    .single()
  
  if (!player) {
    console.log('Player not found in lobby')
    return
  }
  
  // Remove the player
  const { error: removeError } = await supabase
    .from('players')
    .delete()
    .eq('lobby_code', lobbyCode)
    .eq('user_id', userId)
  
  if (removeError) {
    console.error('Error removing player from lobby:', removeError)
    throw removeError
  }
  
  // Update the player count
  const { data: lobbyData } = await supabase
    .from('lobbies')
    .select('player_count')
    .eq('lobby_code', lobbyCode)
    .single()
  
  const newPlayerCount = Math.max((lobbyData?.player_count || 1) - 1, 0)
  
  const { error: updateError } = await supabase
    .from('lobbies')
    .update({ player_count: newPlayerCount })
    .eq('lobby_code', lobbyCode)
  
  if (updateError) {
    console.error('Error updating lobby player count:', updateError)
  }
  
  // If the player was the host and there are other players, assign a new host
  if (player.is_host && newPlayerCount > 0) {
    const { data: remainingPlayers } = await supabase
      .from('players')
      .select('*')
      .eq('lobby_code', lobbyCode)
      .order('joined_at', { ascending: true })
      .limit(1)
    
    if (remainingPlayers && remainingPlayers.length > 0) {
      const { error: hostError } = await supabase
        .from('players')
        .update({ is_host: true })
        .eq('id', remainingPlayers[0].id)
      
      if (hostError) {
        console.error('Error assigning new host:', hostError)
      }
    }
  }
  
  // If no players left, delete the lobby
  if (newPlayerCount === 0) {
    const { error: deleteLobbyError } = await supabase
      .from('lobbies')
      .delete()
      .eq('lobby_code', lobbyCode)
    
    if (deleteLobbyError) {
      console.error('Error removing empty lobby:', deleteLobbyError)
    }
  }
}