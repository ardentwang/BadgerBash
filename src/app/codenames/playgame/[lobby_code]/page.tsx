"use client"

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import SpymasterBoard from "@/components/codenames/SpymasterBoard";
import OperativeBoard from "@/components/codenames/OperativeBoard";
import TeamPanel from "@/components/codenames/TeamPanel";
import GameLog from "@/components/codenames/GameLog";
import { initialWords } from "@/components/codenames/GameData";

type PlayerInfo= {
  id: string;
  user_id: string;
  role: string;
  team: string;
  lobby_code: number;
};

const CodenamesGame = () => {
  const params = useParams();
  const rawLobbyCode = params.lobby_code;
  // Check if rawLobbyCode exists before processing it
  const arrayLobbyCode = rawLobbyCode ? (Array.isArray(rawLobbyCode) ? rawLobbyCode[0] : rawLobbyCode) : "";
  const lobbyCode = arrayLobbyCode ? parseInt(arrayLobbyCode, 10) : 0; 
  const { user } = useAuth();
  const userId = user?.id;

  // State for role and team
  const [playerRole, setPlayerRole] = useState(null);
  const [playerTeam, setPlayerTeam] = useState(null);
  const [gameLog, setGameLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);

  // words and color
  const [wordColorList, setWordColorList] = useState<{ word: string; color: string }[] | null>(null);

  // Fetch user role and team from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !lobbyCode) return;
      
      try {
        const { data, error } = await supabase
          .from('codenames_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('lobby_code', parseInt(lobbyCode));
        
        if (error) {
          console.error("Error fetching user role:", error);
          return;
        }
        
        if (data && data.length > 0) {
          setPlayerRole(data[0].role);
          setPlayerTeam(data[0].team);
        }
        
        // Get all players in this lobby
        const { data: lobbyPlayers, error: playersError } = await supabase
          .from('codenames_roles')
          .select('*')
          .eq('lobby_code', parseInt(lobbyCode));

        if (playersError) {
          console.error("Error fetching players:", playersError);
          return;
        }

        setPlayers(lobbyPlayers || []);
        console.log("Players:", lobbyPlayers)
      } catch (error) {
        console.error("Error in data fetching:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();

    const loadWords = async () => {
      const words = await fetchWordsByLobby();
      setWordColorList(words);
    };
    loadWords();
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`lobby-${lobbyCode}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'codenames_roles',
          filter: `lobby_code=eq.${parseInt(lobbyCode as string)}`
        }, 
        () => {
          fetchUserData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
   
  }, [userId, lobbyCode]);

  // Function to Fetch words for the game
  async function fetchWordsByLobby(){
    // Step 1: Query Supabase by lobby_id
    const { data, error } = await supabase
      .from('codenames_games') 
      .select('words')          
      .single();                
    if (error) {
      console.error('Error fetching words:', error);
      return null;
    }

    const wordColorDict = data.words; // This is the JSON object 

    // Converting dictionary to list-wrapped dictionary
    const wordColorList = Object.entries(wordColorDict).map(([word, color]) => ({
      word,
      color: color as string
    }));
    return wordColorList; 
}



  // Handle giving a clue (for spymaster)
  const handleGiveClue = (String: clue) => {
    setGameLog([`${playerTeam} Spymaster's clue: ${clue}`, ...gameLog]);
    // You can implement the actual Supabase logging here
  };

  // Handle selecting a word (for operative)
  const handleSelectWord = (word, index) => {
    setGameLog([`${playerTeam} Operative selected: ${word.word}`, ...gameLog]);
    // You can implement the actual Supabase logging here
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-400">
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-bold mb-2">Loading game...</h2>
          <p>Please wait while we set up your game.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-red-400 p-6">
      {/* Header with game info */}
      <div className="flex justify-between items-center mb-4">
        <span className="bg-yellow-400 text-black px-3 py-1 rounded-lg">
          Lobby: {lobbyCode}
        </span>
        <h1 className="text-2xl font-bold text-white">Codenames</h1>
        <span className="bg-yellow-400 text-black px-3 py-1 rounded-lg">
          You: {playerTeam} {playerRole}
        </span>
      </div>

      <div className="flex space-x-6">
        {/* Left Panel - Red Team */}
        <TeamPanel 
          color="red" 
          players={players} 
          userId={userId}
        />

        {/* Main Game Board - Changes based on role */}
        <div className="flex-grow flex justify-center">
          {playerRole === 'spymaster' ? (
            <SpymasterBoard 
              words={wordColorList} 
              team={playerTeam} 
              onGiveClue={handleGiveClue}
            />
          ) : (
            <OperativeBoard 
              words={initialWords} 
              team={playerTeam} 
              onSelectWord={handleSelectWord}
            />
          )}
        </div>

        {/* Right Panel - Blue Team */}
        <TeamPanel 
          color="blue" 
          players={players} 
          userId={userId}
        />
      </div>

      {/* Game Log */}
      <GameLog logs={gameLog} />
    </div>
  );
};

export default CodenamesGame;