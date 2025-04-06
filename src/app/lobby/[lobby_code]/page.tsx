"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import PlayerSlot from '@/components/lobby/PlayerSlot'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState} from 'react'


const LobbyPage = () => {
  // get the lobby code to push to next game as well as match supabase code
  const params = useParams();
  const lobbyCode = params.lobby_code;
  console.log("Lobby Code:", lobbyCode);
  
  const [players, setPlayers] = useState([]);
  const [lobby, setLobby] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = useAuth();
  // userInfo contains: avatar_url, is_guest, username
  const userInfo = user.user?.user_metadata;
  console.log("User Info:", userInfo);
  
  useEffect(() => {
    if (!lobbyCode || !userInfo) return;
    
    // Initial fetch of lobby data and set up subscription
    const setupLobbyAndSubscription = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch initial lobby data
        const { data: lobbyData, error: lobbyError } = await supabase
          .from('lobbies')
          .select('*, players')
          .eq('lobby_code', lobbyCode)
          .single();
          
        if (lobbyError) throw lobbyError;
        
        setLobby(lobbyData);
        setPlayers(lobbyData.players || []);
        console.log("Initial lobby data:", lobbyData);
        
        // 2. Set up subscription to lobby changes
        const subscription = supabase
          .channel(`lobby-${lobbyCode}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'lobbies',
            filter: `lobby_code=eq.${lobbyCode}`
          }, (payload) => {
            console.log('Subscription payload received:', payload);
            
            // Update local state with new data
            setLobby(payload.new);
            
            // If players array exists in the payload, update players state
            if (payload.new.players) {
              setPlayers(payload.new.players);
              console.log("Updated players array:", payload.new.players);
            }
            
            // Check if game has started and redirect if it has
            if (payload.new.game_started === true) {
              console.log("Game started, redirecting to game page");
              router.push(`/codenames/joingame/${lobbyCode}`);
            }
          })
          .subscribe();
        
        // 3. Add current player to the lobby's players array
        await addPlayerToLobby(userInfo);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error setting up lobby:', err);
      } finally {
        setLoading(false);
      }
    };
    
    setupLobbyAndSubscription();
  }, [lobbyCode, userInfo]);
  
  const router = useRouter();
  
  // Function to add the current player to the lobby
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
  
  const addPlayerToLobby = async (userInfo) => {
    try {
      // Check if user is already in the lobby to prevent duplicates
      const { data: existingLobby } = await supabase
        .from('lobbies')
        .select('players')
        .eq('lobby_code', lobbyCode)
        .single();
      
      const currentPlayers = existingLobby.players || [];
      
      // Check if this player is already in the lobby
      const userExists = currentPlayers.some(player => player.user_id === userInfo.sub);
      
      if (!userExists) {
        // Create new player object
        const newPlayer = {
          user_id: userInfo.sub,
          username: userInfo.username,
          avatar_url: userInfo.avatar_url,
          is_host: currentPlayers.length === 0 // First player is the host
        };
        
        // Add player to the array
        const updatedPlayers = [...currentPlayers, newPlayer];
        
        // Update the lobby with the new players array
        const { error } = await supabase
          .from('lobbies')
          .update({ 
            players: updatedPlayers,
            player_count: updatedPlayers.length
          })
          .eq('lobby_code', lobbyCode);
          
        if (error) throw error;
        
        console.log("Player added to lobby:", newPlayer);
      } else {
        console.log("Player already in lobby");
      }
    } catch (err) {
      console.error('Error adding player to lobby:', err);
    }
  };
  
  if (loading) {
    return <div>Loading lobby...</div>;
  }

  return (
    <div>
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
                  value={lobby?.name || ""}
                  disabled={true}
                />
                <Button
                  variant="outline"
                  disabled={true}
                >
                  Update
                </Button>
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
                Players ({players.length}/4)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Map through 4 player slots */}
                {Array.from({ length: 4 }).map((_, index) => (
                  <PlayerSlot 
                    key={index}
                    player={players[index] || null}
                    isCurrentUser={players[index]?.user_id === userInfo?.sub}
                  />
                ))}
              </div>
              
              <div className="flex gap-4 mt-6 pt-4 border-t">
                <Button 
                  className="w-full"
                  onClick={handleStartGame}
                  disabled={!players.some(p => p.user_id === userInfo?.sub && p.is_host)}
                >
                  Start Game
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
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
};

export default LobbyPage;