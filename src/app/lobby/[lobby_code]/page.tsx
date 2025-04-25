"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import PlayerSlot from '@/components/lobby/PlayerSlot'
import { useRouter, useParams } from 'next/navigation' 
import { supabase } from '@/lib/supabase'
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from 'react'

interface Lobby {
  id: string,
  lobby_code: number,
  name: string,
  player_count: number,
  created_at: string,
  updated_at?: string,
  is_public: boolean,
  game_started: boolean
}

interface UserInfo {
  username: string;
  avatar_url: string;
}

interface LobbyPlayer {
  user_id: string;
  joined_at: string;
  status: string;
  // Make users flexible to handle both array and single object cases
  users: UserInfo | UserInfo[];
}

interface FormattedPlayer {
  user_id: string;
  username: string;
  avatar_url: string;
  joined_at: string;
  is_host: boolean;
}

const LobbyPage = () => {
  // get the lobby code to push to next game as well as match supabase code
  const params = useParams();
  const rawLobbyCode = params.lobby_code;
  // Check if rawLobbyCode exists before processing it
  const arrayLobbyCode = rawLobbyCode ? (Array.isArray(rawLobbyCode) ? rawLobbyCode[0] : rawLobbyCode) : "";
  const lobbyCode = arrayLobbyCode ? parseInt(arrayLobbyCode, 10) : 0; 
  console.log(lobbyCode)
  const [players, setPlayers] = useState<FormattedPlayer[]>([]);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);
  // Add state for editable lobby name
  const [editableName, setEditableName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const { user } = useAuth();
  const userID = user?.id;
  const router = useRouter();
  
  // Fetch all players in the lobby with their user info
  const fetchPlayers = async () => {
    try {
      // Use the specific relationship name as suggested in the error message
      const { data, error } = await supabase
        .from('lobbies_players')
        .select(`
          user_id,
          joined_at,
          status,
          users!lobbies_players_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('lobby_code', lobbyCode)
        .eq('status', 'active');
      
      if (error) throw error;

      console.log(JSON.stringify(data, null, 2));
      
      // Format the data to match the expected structure in the UI
      const formattedPlayers = (data as unknown as LobbyPlayer[]).map(player => {
        // Handle both array and object cases
        const userInfo = Array.isArray(player.users) 
          ? player.users[0] 
          : player.users;
          
        return {
          user_id: player.user_id,
          username: userInfo?.username || 'Unknown User',
          avatar_url: userInfo?.avatar_url || '/avatars/default.png',
          joined_at: player.joined_at,
          is_host: false
        };
      });
      
      console.log("Formatted Players:", formattedPlayers)

      // Sort players by join time to determine host
      formattedPlayers.sort((a, b) => 
        new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
      );
      
      // Set the first player as host
      if (formattedPlayers.length > 0) {
        formattedPlayers[0].is_host = true;
      }
      
      setPlayers(formattedPlayers as FormattedPlayer[]);
      
      // Update player count in the lobby
      if (lobby) {
        await supabase
          .from('lobbies')
          .update({ player_count: formattedPlayers.length })
          .eq('lobby_code', lobbyCode);
      }
    } catch (err) {
      console.error('Error fetching players:', err);
    }
  };
  
  // Function to add the current player to the lobby
  const addPlayerToLobby = async () => {
    if (!userID || !lobbyCode) return;
    
    try {
      // Check if player is already in this lobby
      const { data: existingPlayer } = await supabase
        .from('lobbies_players')
        .select('*')
        .eq('lobby_code', lobbyCode)
        .eq('user_id', userID)
        .maybeSingle();
      
      if (!existingPlayer) {
        // Add player to lobbies_players table
        const { error } = await supabase
          .from('lobbies_players')
          .insert({
            lobby_code: lobbyCode,
            user_id: userID,
            joined_at: new Date().toISOString(),
            status: 'active',
            last_active: new Date().toISOString()
          });
          
        if (error) {
          console.log("fetch error:", error)
          throw error;
        }
        
        console.log("Player added to lobby");
      } else if (existingPlayer.status !== 'active') {
        // Reactivate player if they were previously inactive
        const { error } = await supabase
          .from('lobbies_players')
          .update({ 
            status: 'active',
            last_active: new Date().toISOString() 
          })
          .eq('lobby_code', lobbyCode)
          .eq('user_id', userID);
          
        if (error) throw error;
        
        console.log("Player reactivated in lobby");
      } else {
        console.log("Player already active in lobby");
      }
    } catch (err) {
      console.error('Error adding player to lobby:', err);
    }
  };
  
  // Function to update the lobby name
  const updateLobbyName = async () => {
    if (!lobbyCode || !editableName.trim() || editableName === lobby?.name) return;
    
    try {
      setIsUpdatingName(true);
      
      const { error } = await supabase
        .from('lobbies')
        .update({ 
          name: editableName,
          updated_at: new Date().toISOString()
        })
        .eq('lobby_code', lobbyCode);
        
      if (error) throw error;
      
      console.log("Lobby name updated successfully");
      // Update local state to reflect the change
      setLobby(prev => prev ? {...prev, name: editableName} : null);
    } catch (err) {
      console.error('Error updating lobby name:', err);
    } finally {
      setIsUpdatingName(false);
    }
  };
  
  // Handle starting the game
  const handleStartGame = async () => {
    try {
      console.log("Starting game...");
      
      const { error } = await supabase
        .from('lobbies')
        .update({ game_started: true })
        .eq('lobby_code', lobbyCode);
        
      if (error) {
        console.error("Error starting game:", error);
        throw error;
      }
      
      console.log("Game start signal sent successfully");
      // No need to redirect here as the subscription will handle it
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  };
  
  // Handle leaving the lobby
  const handleLeaveLobby = async () => {
    try {
      if (!userID || !lobbyCode) return;
      
      // Mark player as inactive
      await supabase
        .from('lobbies_players')
        .update({ 
          status: 'inactive',
          last_active: new Date().toISOString() 
        })
        .eq('lobby_code', lobbyCode)
        .eq('user_id', userID);
      
      // Navigate back to lobby selection
      router.push('/');
    } catch (err) {
      console.error('Error leaving lobby:', err);
    }
  };
  
  useEffect(() => {
    if (!lobbyCode || !userID) return;
    
    // Initial fetch of lobby data and set up subscription
    const setupLobbyAndSubscription = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch initial lobby data
        const { data: lobbyData, error: lobbyError } = await supabase
          .from('lobbies')
          .select('*')
          .eq('lobby_code', lobbyCode)
          .single<Lobby>();
          
        if (lobbyError) throw lobbyError;
        
        //
        setLobby(lobbyData as Lobby);
        // Initialize editable name state with current lobby name
        setEditableName(lobbyData.name);
        
        // 2. Add current player to the lobby
        await addPlayerToLobby();
        
        // 3. Fetch players
        await fetchPlayers();
        
        // 4. Set up subscription to lobby changes (for game_started)
        const lobbySubscription = supabase
          .channel(`lobby-updates-${lobbyCode}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'lobbies',
            filter: `lobby_code=eq.${lobbyCode}`
          }, (payload) => {
            console.log('Lobby update received:', payload);
            
            // Update local state with new data
            setLobby(payload.new as Lobby);
            // Update editable name with the new lobby name
            setEditableName((payload.new as Lobby).name);
            
            // Check if game has started and redirect if it has
            // @ts-expect-error game_started will always exist as a property from lobby table payload
            if (payload.new.game_started === true) {
              console.log("Game started, redirecting to game page");
              router.push(`/codenames/joingame/${lobbyCode}`);
            }
          })
          .subscribe();
        
        // 5. Set up subscription to player changes
        const playersSubscription = supabase
          .channel(`players-updates-${lobbyCode}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'lobbies_players',
            filter: `lobby_code=eq.${lobbyCode}`
          }, () => {
            // Refresh the player list when there are changes
            fetchPlayers();
          })
          .subscribe();
        
        // 6. Start heartbeat interval
        const heartbeatInterval = setInterval(async () => {
          if (userID && lobbyCode) {
            await supabase
              .from('lobbies_players')
              .update({ last_active: new Date().toISOString() })
              .eq('lobby_code', lobbyCode)
              .eq('user_id', userID);
          }
        }, 30000); // Every 30 seconds
        
        return () => {
          clearInterval(heartbeatInterval);
          supabase.removeChannel(lobbySubscription);
          supabase.removeChannel(playersSubscription);
          
          // Mark player as inactive when leaving the page
          if (userID && lobbyCode) {
            supabase
              .from('lobbies_players')
              .update({ status: 'inactive' })
              .eq('lobby_code', lobbyCode)
              .eq('user_id', userID);
          }
        };
      } catch (err) {
        console.error('Error setting up lobby:', err);
      } finally {
        setLoading(false);
      }
    };
    
    setupLobbyAndSubscription();
  }, [lobbyCode, userID]);
  
  // Function to check if current user is host
  const isCurrentUserHost = () => {
    const currentPlayer = players.find(p => p.user_id === userID);
    return currentPlayer?.is_host || false;
  };
  
  if (loading) {
    return <div>Loading lobby...</div>;
  }

  return (
    <div>
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2 flex-grow">
                <label htmlFor="lobbyName" className="text-sm font-medium">
                  Lobby Name
                </label>
                <div className="flex gap-2">
                  <Input
                    id="lobbyName"
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    disabled={!isCurrentUserHost()}
                  />
                  <Button
                    variant="outline"
                    disabled={!isCurrentUserHost() || isUpdatingName || editableName === lobby?.name || !editableName.trim()}
                    onClick={updateLobbyName}
                  >
                    {isUpdatingName ? "Updating..." : "Update"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lobby Code</label>
              <div className="bg-secondary p-3 rounded-lg">
                <p className="text-center font-mono text-2xl tracking-wider">
                  {lobby?.lobby_code}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Players ({players.length}/8)
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {/* Map through 8 player slots */}
                {Array.from({ length: 8 }).map((_, index) => (
                  <PlayerSlot 
                    key={index}
                    player={players[index] || null}
                    isCurrentUser={players[index]?.user_id === userID}
                    isHost={players[index]?.is_host || false} // Pass host status to slot
                  />
                ))}
              </div>
              
              <div className="flex gap-4 mt-6 pt-4 border-t">
                {isCurrentUserHost() ? (
                  // Host sees Start Game button
                  <Button 
                    className="w-full hover:bg"
                    onClick={handleStartGame}
                    disabled={players.length < 4} // Require at least 4 players
                  >
                    Start Game
                  </Button>
                ) : (
                  // Non-hosts see Wait For Host button
                  <Button 
                    className="w-full bg-400 cursor-not-allowed"
                    disabled={true}
                  >
                    Wait For Host...
                  </Button>
                )}
                <Button 
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
  );
}

export default LobbyPage;