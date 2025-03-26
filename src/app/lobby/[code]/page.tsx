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

  const [subscriptions, setSubscriptions] = useState<any>({
    lobby: null,
    players: null
  })

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user && code) {
        try {
          await removePlayerFromLobby(code, user.id)
        } catch (err) {
          console.error('Error removing player during page unload:', err)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [user, code])

  useEffect(() => {
    if (!user || !code) return

    const fetchLobbyData = async () => {
      try {
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

        if (lobbyData.game_started) {
          router.push('/codenames/joingame')
          return
        }

        // Fetch the lobby by code to get its UUID id
        const { data: lobbyInfo, error: lobbyInfoError } = await supabase
        .from('lobbies')
        .select('id')
        .eq('lobby_code', code)
        .single()

        if (lobbyInfoError || !lobbyInfo) {
        console.error('Error fetching lobby ID:', lobbyInfoError)
        setError('Lobby not found or invalid')
        setIsLoading(false)
        return
        }

        const lobbyId = lobbyInfo.id

        // Now fetch players using the UUID lobby_id
        const { data: playersData, error: playersError } = await supabase
        .from('lobby_players')
        .select('*')
        .eq('lobby_id', lobbyId)
        .order('joined_at', { ascending: true })


        if (playersError) {
          console.error('Error fetching players:', playersError)
          setError('Could not load players')
          setIsLoading(false)
          return
        }

        setPlayers(playersData || [])

        const existingPlayer = playersData?.find(p => p.user_id === user.id)
        if (!existingPlayer) {
          try {
            const isFirstPlayer = playersData.length === 0
            await addPlayerToLobby(code, user, isFirstPlayer)
          } catch (err) {
            console.error('Error adding player to lobby:', err)
          }
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Error in lobby initialization:', err)
        setError('Failed to initialize lobby')
        setIsLoading(false)
      }
    }

    const setupSubscriptions = () => {
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
            const updatedLobby = payload.new
            setLobby(updatedLobby)
            setLobbyName(updatedLobby.name || 'New Lobby')

            if (updatedLobby.game_started) {
              console.log('Game started by host, redirecting to game')
              router.push('/codenames/joingame')
            }
          } else if (payload.eventType === 'DELETE') {
            router.push('/')
          }
        })
        .subscribe()

      const playersChannel = supabase
        .channel(`lobby_players:${code}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'lobby_players',
          filter: `lobby_code=eq.${code}`
        }, (payload) => {
          console.log('Players updated:', payload);

          if (payload.eventType === 'INSERT') {
            setPlayers(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setPlayers(prev => prev.filter(p => p.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
          }
        })
        .subscribe();

      setSubscriptions({
        lobby: lobbyChannel,
        players: playersChannel
      })
    }

    fetchLobbyData().then(setupSubscriptions)

    return () => {
      if (subscriptions.lobby) subscriptions.lobby.unsubscribe()
      if (subscriptions.players) subscriptions.players.unsubscribe()
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

  // Handle starting the game (for host only)
  const handleStartGame = async () => {
    try {
      if (isHost && lobby) {
        // Update the lobby status to indicate game has started
        const { error } = await supabase
          .from('lobbies')
          .update({ game_started: true })
          .eq('lobby_code', code)
        
        if (error) {
          console.error('Error starting game:', error)
          return
        }
        
        // Host will be redirected by the subscription listener just like other players
      }
    } catch (error) {
      console.error('Error starting game:', error)
    }
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
                <Button 
                  className="w-full" 
                  onClick={handleStartGame}
                  disabled={!isHost}
                >
                  {isHost ? 'Start Game for Everyone' : 'Waiting for Host to Start'}
                </Button>
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

async function addPlayerToLobby(lobbyCode:any, user:any, isHost = false) {
  try {
    // Convert lobby code to integer if it's a string
    const lobbyCodeInt = typeof lobbyCode === 'string' ? parseInt(lobbyCode) : lobbyCode;
    
    // First, try to upsert the player instead of insert
    // This handles the race condition by using the database's atomicity
    const { data, error } = await supabase
      .from('lobby_players')
      .upsert({
        lobby_code: lobbyCodeInt,
        user_id: user.id,
        name: user.user_metadata?.username || 'Guest',
        avatar_url: user.user_metadata?.avatar_url || '/avatars/student.png',
        is_host: isHost, // Set host status based on parameter
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
        .from('lobby_players')
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

async function removePlayerFromLobby(lobbyCode:any, userId:any) {
  try {
    // Get the player to check if they're the host
    const { data: player, error: playerError } = await supabase
      .from('lobby_players')
      .select('*')
      .eq('lobby_code', lobbyCode)
      .eq('user_id', userId)
      .single();
    
    if (playerError || !player) {
      console.log('Player not found in lobby or error:', playerError);
      return;
    }
    
    // Remove the player
    const { error: removeError } = await supabase
      .from('lobby_players')
      .delete()
      .eq('lobby_code', lobbyCode)
      .eq('user_id', userId);
    
    if (removeError) {
      console.error('Error removing player from lobby:', removeError);
      throw removeError;
    }
    
    console.log('Player successfully removed');
    
    // Get updated player count
    const { data: lobbyData, error: lobbyError } = await supabase
      .from('lobbies')
      .select('player_count')
      .eq('lobby_code', lobbyCode)
      .single();
    
    if (lobbyError) {
      console.error('Error getting lobby data:', lobbyError);
      return;
    }
    
    const newPlayerCount = Math.max((lobbyData?.player_count || 1) - 1, 0);
    console.log('New player count will be:', newPlayerCount);
    
    // Update the player count
    const { error: updateError } = await supabase
      .from('lobbies')
      .update({ player_count: newPlayerCount })
      .eq('lobby_code', lobbyCode);
    
    if (updateError) {
      console.error('Error updating lobby player count:', updateError);
    }
    
    // If the player was the host and there are other players, assign a new host
    if (player.is_host && newPlayerCount > 0) {
      const { data: remainingPlayers, error: remainingError } = await supabase
        .from('lobby_players')
        .select('*')
        .eq('lobby_code', lobbyCode)
        .order('joined_at', { ascending: true })
        .limit(1);
      
      if (remainingError) {
        console.error('Error finding remaining players:', remainingError);
      } else if (remainingPlayers && remainingPlayers.length > 0) {
        const { error: hostError } = await supabase
          .from('lobby_players')
          .update({ is_host: true })
          .eq('id', remainingPlayers[0].id);
        
        if (hostError) {
          console.error('Error assigning new host:', hostError);
        } else {
          console.log('New host assigned:', remainingPlayers[0].name);
        }
      }
    }
    
    // Check if this was the last player and delete the lobby if so
    if (newPlayerCount === 0) {
      console.log('Last player left, deleting lobby:', lobbyCode);
      
      const { error: checkPlayersError, count } = await supabase
        .from('lobby_players')
        .select('*', { count: 'exact', head: true })
        .eq('lobby_code', lobbyCode);
      
      if (checkPlayersError) {
        console.error('Error checking remaining players:', checkPlayersError);
      } else if (count === 0) {
        // Double-check that there are really no players left
        const { error: deleteLobbyError } = await supabase
          .from('lobbies')
          .delete()
          .eq('lobby_code', lobbyCode);
        
        if (deleteLobbyError) {
          console.error('Error removing empty lobby:', deleteLobbyError);
        } else {
          console.log('Lobby successfully deleted');
        }
      } else {
        console.log('Found', count, 'players still in lobby, not deleting');
      }
    }
  } catch (err) {
    console.error('Overall error in removePlayerFromLobby:', err);
  }
}