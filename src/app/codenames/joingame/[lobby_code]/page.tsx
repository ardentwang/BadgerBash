"use client";

import { useRouter, useParams } from 'next/navigation'
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext"
import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';

interface CodenamesPlayer {
  id: string;
  user_id: string;
  role: "red_spymaster" | "blue_spymaster" | "red_operative" | "blue_operative";
  lobby_code: number;
  users?: UserInfo | UserInfo[];
}

interface UserInfo {
  username: string;
  avatar_url: string;
}

interface FormattedPlayer {
  user_id: string;
  username: string;
  avatar_url: string;
  role: string;
}

const CodenamesLobby = () => {
  const params = useParams();
  const rawLobbyCode = params.lobby_code;
  // Check if rawLobbyCode exists before processing it
  const arrayLobbyCode = rawLobbyCode ? (Array.isArray(rawLobbyCode) ? rawLobbyCode[0] : rawLobbyCode) : "";
  const lobbyCode = arrayLobbyCode ? parseInt(arrayLobbyCode, 10) : 0; 
  const [players, setPlayers] = useState<FormattedPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [canStartGame, setCanStartGame] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;
  const userName = user?.user_metadata.username;

  // Function to fetch players in the lobby
  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('codenames_roles')
        .select(`
          *,
          users!codenames_roles_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('lobby_code', lobbyCode);
        
      if (error) {
        console.error("Error fetching players:", error);
        return;
      }
      
      console.log(JSON.stringify(data, null, 2));
      
      // Format the data to match the expected structure in the UI
      const formattedPlayers = (data as unknown as CodenamesPlayer[]).map(player => {
        // Handle both array and object cases for user info
        const userInfo = Array.isArray(player.users) 
          ? player.users[0] 
          : player.users;
          
        return {
          user_id: player.user_id,
          username: userInfo?.username || 'Unknown User',
          avatar_url: userInfo?.avatar_url || '/avatars/default.png',
          role: player.role
        };
      });
      
      console.log("Formatted Players:", formattedPlayers);
      
      setPlayers(formattedPlayers as FormattedPlayer[]);
      
      // Check if current user has already selected a role
      const currentUserRole = formattedPlayers.find(player => player.user_id === userId);
      if (currentUserRole) {
        setUserRole(currentUserRole.role);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };
  
  useEffect(() => {
    if (lobbyCode) {
      fetchPlayers();
      
      // Set up real-time subscription for player updates
    (async () => {
      await supabase
      .channel('codenames_roles_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'codenames_roles',
          filter: `lobby_code=eq.${lobbyCode}`
        }, 
        (payload) => {
          console.log('Change received!', payload);
          fetchPlayers();
        }
      )
      .subscribe();})();

    // Function to fetch current roles in the lobby
    const checkRoles = async () => {
      const { data, error } = await supabase
        .from('codenames_roles')
        .select('role')
        .eq('lobby_code', lobbyCode);

      if (error) {
        console.error('Error fetching roles:', error);
        return;
      }

      if (data.length < 4) {
        setCanStartGame(false);
        return;
      }

      // Count each role type
      const roleCounts = {
        red_spymaster: 0,
        blue_spymaster: 0,
        red_operative: 0,
        blue_operative: 0
      };

      data.forEach(({ role }) => {
        if (roleCounts.hasOwnProperty(role)) {
          roleCounts[role as keyof typeof roleCounts]++;
        }
      });

      const validSetup =
        roleCounts.red_spymaster >= 1 &&
        roleCounts.blue_spymaster >= 1 &&
        roleCounts.red_operative >= 1 &&
        roleCounts.blue_operative >= 1;

      setCanStartGame(validSetup);
    };

    // Subscribe to changes in codenames_roles
    (async () => {
      await supabase
      .channel('codenames_roles_subscription')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to inserts, updates, deletes
          schema: 'public',
          table: 'codenames_roles',
          filter: `lobby_code=eq.${lobbyCode}`
        },
        async () => {
          checkRoles(); // Re-check roles on any change
        }
      )
      .subscribe();})();

    // Initial role check
    checkRoles();

    (async () => {
      await supabase
        .channel('game_status')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'codenames_games',
            filter: `lobby_code=eq.${lobbyCode}`
          },
          (payload) => {
            const updatedRow = payload.new as { game_started?: boolean };
            if (updatedRow.game_started) {
              router.push(`/codenames/playgame/${lobbyCode}`);
            }
          }
        )
        .subscribe();
    })();
      return () => {
        supabase.removeAllChannels()
      };
    }
  }, [lobbyCode, userId]);

  // Function to handle role selection
  const handleRoleSelection = async (role: "red_spymaster" | "blue_spymaster" | "red_operative" | "blue_operative") => {
    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    // Log the data we're about to send for debugging
    const roleData = {
      user_id: userId,
      role: role,
      lobby_code: lobbyCode || null
    };
    
    console.log("Sending data to Supabase:", roleData);
    
    setLoading(true);
    try {
      // First, check if this user already has a role in this lobby
      const { data: existingRole, error: fetchError } = await supabase
        .from('codenames_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('lobby_code', lobbyCode);
      
      if (fetchError) {
        console.error("Error checking existing role:", fetchError.message);
        alert(`Failed to join: ${fetchError.message}`);
        setLoading(false);
        return;
      }
      
      let result;
      
      // Update or insert based on whether a record exists
      if (existingRole && existingRole.length > 0) {
        // Update existing role
        result = await supabase
          .from('codenames_roles')
          .update({
            role: role
          })
          .eq('user_id', userId)
          .eq('lobby_code', lobbyCode);
      } else {
        // Insert new role
        result = await supabase
          .from('codenames_roles')
          .insert([roleData]);
      }
      
      if (result.error) {
        console.error("Error assigning role:", result.error.message);
        alert(`Failed to join: ${result.error.message}`);
        setLoading(false);
        return;
      }

      console.log("Supabase response:", result.data);
      console.log(`Successfully joined as ${role}`);
      setLoading(false);
      
      // Refresh players instead of redirecting
      fetchPlayers();
      
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  async function generateAndUploadCards() {
    const filePath = "/word_bank/codenames.csv"; // Path to your CSV file
    try {
      // Fetch the CSV file
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error("Failed to fetch the CSV file");
      }
      const csvText = await response.text();
  
      // Parse the CSV content
      const words = Papa.parse<string[]>(csvText, {
        header: false, // Adjust based on your CSV structure
        skipEmptyLines: true,
      }).data.flat(); // Flatten the array if necessary
  
      if (words.length < 25) {
        throw new Error('Not enough words in the word bank');
      }
  
      // Step 3: Shuffle and select 25 words
      const selectedWords = shuffleArray(words).slice(0, 25);
  
      // Step 4: Assign colors
      const colors = [
        ...Array(8).fill('red'),
        ...Array(8).fill('blue'),
        ...Array(8).fill('yellow'),
        'black'
      ];
      const shuffledColors = shuffleArray(colors);

      // Step 5: Create word-color mapping with revealed state
      // Define the type for the word color mapping
      type WordColorMapping = Record<string, [string, boolean]>;
      const wordColorMapping: WordColorMapping = {};
      
      selectedWords.forEach((word, index) => {
        wordColorMapping[word] = [shuffledColors[index], false]; // [color, revealed]
      });
  
      // Step 6: Insert into Supabase
      const { error } = await supabase
        .from('codenames_games')
        .upsert([{
          lobby_code: lobbyCode,
          words: wordColorMapping,
          current_role_turn: "red_spymaster", // Set initial turn to red_spymaster
          game_started: false
        }]);
  
      if (error) throw error;
  
      console.log('Inserted successfully!', wordColorMapping);
    } catch (err) {
      console.error('Error:', err);
    }
  }
  
  // Utility function: shuffle array
  function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  
  // Function to start the game and redirect all players
  const startGame = async () => {
    await generateAndUploadCards();
    
    const { error } = await supabase
      .from("codenames_games")
      .update({ game_started: true })
      .eq("lobby_code", lobbyCode);
      
    if (error) {
      throw new Error(`Failed to start game: ${error.message}`);
    }

  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  // Helper function to get team color from role
  //const getTeamFromRole = (role: string) => {
  //  return role.startsWith('red_') ? 'red' : 'blue';
  //};

  // Helper function to get role type from role
  //const getRoleTypeFromRole = (role: string) => {
  //  return role.endsWith('_spymaster') ? 'spymaster' : 'operative';
  //};

  return (
    <div className="flex flex-col min-h-screen bg-red-400">
      {/* Header */}
      <div className="flex justify-between p-4 text-white font-bold">
        <div className="flex items-center space-x-2">
          <span className="bg-yellow-400 text-black px-3 py-1 rounded-lg">Players: {players.length}</span>
          <span className="bg-yellow-400 text-black px-3 py-1 rounded-lg">⏳</span>
        </div>
        <h1 className="text-2xl font-bold text-center">Set up a game</h1>
        <div className="flex items-center space-x-2">
          <Button className="bg-yellow-400 text-black px-3 py-1 rounded-lg" onClick={openModal}>Rules</Button>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="p-6 space-y-3 text-sm text-white rounded-2xl">
              <DialogTitle className="text-xl font-semibold text-white text-center">Rules!</DialogTitle>
              <p className="text-base text-white leading-relaxed">
                🔴 Two teams — Red and Blue — compete to guess their secret words first.
              </p>
              <p className="text-base text-white leading-relaxed">
                🕵️ Each team has a <span className="font-bold">Spymaster</span> who gives one-word clues tied to multiple words on the board.
              </p>
              <p className="text-base text-white leading-relaxed">
                🧩 The clue includes a word + number (e.g. <span className="italic">“Ocean, 2”</span>) hinting at two words on the board that relate to the word <span className="italic">"Ocean"</span>.
              </p>
              <p className="text-base text-white leading-relaxed">
                🧠 Operatives click on tiles to guess the correct words. Guess right, and the tile turns your team’s color!
              </p>
              <p className="text-base text-white leading-relaxed">
                🚫 If you hit a <span className="italic">neutral card</span> (a white card), your turn ends. If you hit the other team's word, you help them!
              </p>
              <p className="text-base text-white leading-relaxed">
                ☠️ If you pick the <span className="font-bold">assassin</span> (a black card), your team instantly loses.
              </p>
              <p className="text-base text-white leading-relaxed">
                🏆 First team to correctly identify all their agents <span className="font-bold">wins the game!</span>
              </p>
            </DialogContent>
          </Dialog>
          <span className="flex items-center bg-gray-200 text-black px-3 py-1 rounded-lg">
            {userName || "User"} <User className="ml-4" size={10} />
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-grow justify-center space-x-6 px-6 py-4">
        {/* Left Player Panel (Red Team) */}
        <Card className="w-64 p-4 bg-red-700 text-white rounded-lg">
          <h3 className="text-lg font-bold">Operative(s)</h3>
          <div className="mt-2 mb-2">
            {players
              .filter(player => player.role === 'red_operative')
              .map(player => (
                <div key={player.user_id} className="text-sm">{player.user_id === userId ? 'You' : player.user_id}</div>
              ))}
            {players.filter(player => player.role === 'red_operative').length === 0 && (
              <p className="text-sm">-</p>
            )}
          </div>
          <Button
            className={`w-full ${userRole === 'red_operative' 
              ? 'bg-green-500' : 'bg-yellow-400'} text-black font-bold mt-2`}
            onClick={() => handleRoleSelection("red_operative")}
            disabled={loading}
          >
            {loading ? "Joining..." : userRole === 'red_operative' 
              ? "Selected" : "Join as Operative"}
          </Button>

          <h3 className="text-lg font-bold mt-4">Spymaster(s)</h3>
          <div className="mt-2 mb-2">
            {players
              .filter(player => player.role === 'red_spymaster')
              .map(player => (
                <div key={player.user_id} className="text-sm">{player.user_id === userId ? 'You' : player.user_id}</div>
              ))}
            {players.filter(player => player.role === 'red_spymaster').length === 0 && (
              <p className="text-sm">-</p>
            )}
          </div>
          <Button
            className={`w-full ${userRole === 'red_spymaster' 
              ? 'bg-green-500' : 'bg-yellow-400'} text-black font-bold mt-2`}
            onClick={() => handleRoleSelection("red_spymaster")}
            disabled={loading}
          >
            {loading ? "Joining..." : userRole === 'red_spymaster' 
              ? "Selected" : "Join as Spymaster"}
          </Button>
        </Card>

        {/* Main Game Card */}
        <Card className="w-[500px] p-6 rounded-lg bg-white shadow-lg flex flex-col">
          {/* Game Instructions */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Codenames is a game for 4+ players.</h2>
          </div>
          <p className="mt-2 text-sm text-gray-700">
            Divide evenly into two teams – <span className="text-red-600 font-bold">red</span> and
            <span className="text-blue-600 font-bold"> blue</span>. Choose one player per team to
            join as a <span className="font-bold">Spymaster</span>. Other players join as{" "}
            <span className="font-bold">Operatives</span>.
          </p>
          <p className="mt-2 text-sm text-gray-700">
            The team who first guesses all their words wins.
          </p>
          <p className="mt-2 text-sm text-gray-700">
            Lobby Code: <span className="font-bold">{lobbyCode}</span>
          </p>
          
          <div className="flex-grow"></div>
          
          {/* Start Game Button */}
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 mt-6 text-lg"
            disabled={!canStartGame}
            onClick={startGame}
          >
            Start Game
          </Button>
        </Card>

        {/* Right Player Panel (Blue Team) */}
        <Card className="w-64 p-4 bg-blue-700 text-white rounded-lg">
          <h3 className="text-lg font-bold">Operative(s)</h3>
          <div className="mt-2 mb-2">
            {players
              .filter(player => player.role === 'blue_operative')
              .map(player => (
                <div key={player.user_id} className="text-sm">{player.user_id === userId ? 'You' : player.user_id}</div>
              ))}
            {players.filter(player => player.role === 'blue_operative').length === 0 && (
              <p className="text-sm">-</p>
            )}
          </div>
          <Button
            className={`w-full ${userRole === 'blue_operative' 
              ? 'bg-green-500' : 'bg-yellow-400'} text-black font-bold mt-2`}
            onClick={() => handleRoleSelection("blue_operative")}
            disabled={loading}
          >
            {loading ? "Joining..." : userRole === 'blue_operative' 
              ? "Selected" : "Join as Operative"}
          </Button>

          <h3 className="text-lg font-bold mt-4">Spymaster(s)</h3>
          <div className="mt-2 mb-2">
            {players
              .filter(player => player.role === 'blue_spymaster')
              .map(player => (
                <div key={player.user_id} className="text-sm">{player.user_id === userId ? 'You' : player.user_id}</div>
              ))}
            {players.filter(player => player.role === 'blue_spymaster').length === 0 && (
              <p className="text-sm">-</p>
            )}
          </div>
          <Button
            className={`w-full ${userRole === 'blue_spymaster' 
              ? 'bg-green-500' : 'bg-yellow-400'} text-black font-bold mt-2`}
            onClick={() => handleRoleSelection("blue_spymaster")}
            disabled={loading}
          >
            {loading ? "Joining..." : userRole === 'blue_spymaster' 
              ? "Selected" : "Join as Spymaster"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default CodenamesLobby;