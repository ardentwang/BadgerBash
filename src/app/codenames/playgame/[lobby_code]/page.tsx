"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

// Sample word data (unchanged from your original)
const initialWords = [
  { word: "COPPER", color: "blue" },
  { word: "RING", color: "blue" },
  { word: "FAIR", color: "red" },
  { word: "SUPERHERO", color: "red" },
  { word: "SLIP", color: "neutral" },
  { word: "IVORY", color: "neutral" },
  { word: "LITTER", color: "neutral" },
  { word: "WASHER", color: "red" },
  { word: "POINT", color: "red" },
  { word: "COMPOUND", color: "neutral" },
  { word: "OLIVE", color: "neutral" },
  { word: "AIR", color: "black" }, // Assassin word
  { word: "CYCLE", color: "neutral" },
  { word: "VET", color: "blue" },
  { word: "OLYMPUS", color: "blue" },
  { word: "PIRATE", color: "neutral" },
  { word: "MINE", color: "neutral" },
  { word: "PASTA", color: "red" },
  { word: "DRUG", color: "blue" },
  { word: "DUCK", color: "neutral" },
  { word: "ENGLAND", color: "neutral" },
  { word: "OIL", color: "neutral" },
  { word: "LEAD", color: "red" },
  { word: "PUMPKIN", color: "blue" },
  { word: "CHINA", color: "neutral" },
];

// Placeholder components for different roles
const SpymasterBoard = ({ words, team, onGiveClue }) => {
  const [clue, setClue] = useState("");
  
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-bold mb-4">Spymaster View - {team} Team</h2>
      
      {/* Spymaster game board - always shows colors */}
      <div className="grid grid-cols-5 gap-2 bg-orange-900 p-4 rounded-lg mb-4">
        {words.map((tile, index) => (
          <div
            key={index}
            className={`w-28 h-16 rounded-md font-bold flex items-center justify-center 
            ${
              tile.color === "blue" 
                ? "bg-blue-500 text-white" 
                : tile.color === "red" 
                  ? "bg-red-500 text-white" 
                  : tile.color === "black" 
                    ? "bg-black text-white" 
                    : "bg-gray-200 text-black"
            }`}
          >
            {tile.word}
          </div>
        ))}
      </div>
      
      {/* Clue input */}
      <div className="w-full flex space-x-2 mt-4">
        <Input
          type="text"
          value={clue}
          onChange={(e) => setClue(e.target.value)}
          placeholder="Enter your clue"
          className="flex-grow"
        />
        <Button 
          onClick={() => {
            if (clue.trim()) {
              onGiveClue(clue);
              setClue("");
            }
          }}
          className="bg-yellow-400 text-black font-bold"
        >
          Give Clue
        </Button>
      </div>
    </div>
  );
};

const OperativeBoard = ({ words, team, onSelectWord }) => {
  const [flippedTiles, setFlippedTiles] = useState(Array(words.length).fill(false));
  
  const handleTileClick = (index) => {
    if (flippedTiles[index]) return; // Don't flip already flipped tiles
    
    setFlippedTiles(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = true;
      return newFlipped;
    });
    
    onSelectWord(words[index], index);
  };
  
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-bold mb-4">Operative View - {team} Team</h2>
      
      {/* Operative game board - only shows colors after selection */}
      <div className="grid grid-cols-5 gap-2 bg-orange-900 p-4 rounded-lg">
        {words.map((tile, index) => (
          <div
            key={index}
            className="relative w-28 h-16 rounded-md font-bold cursor-pointer"
            onClick={() => handleTileClick(index)}
          >
            {flippedTiles[index] ? (
              <div 
                className={`w-full h-full flex items-center justify-center rounded-md
                ${
                  tile.color === "blue" 
                    ? "bg-blue-500 text-white" 
                    : tile.color === "red" 
                      ? "bg-red-500 text-white" 
                      : tile.color === "black" 
                        ? "bg-black text-white" 
                        : "bg-gray-200 text-black"
                }`}
              >
                {tile.word}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-400 text-black">
                {tile.word}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main game component
const CodenamesGame = () => {
  const params = useParams();
  const lobbyCode = params.lobby_code;
  const { user } = useAuth();
  const userId = user?.id;

  // State for role and team
  const [playerRole, setPlayerRole] = useState(null);
  const [playerTeam, setPlayerTeam] = useState(null);
  const [gameLog, setGameLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);

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
      } catch (error) {
        console.error("Error in data fetching:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    
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

  // Handle giving a clue (for spymaster)
  const handleGiveClue = (clue) => {
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
        <Card className="w-56 p-4 bg-red-700 text-white rounded-lg">
          <h3 className="text-xl font-bold">Red Team</h3>
          <div className="mt-2">
            <p className="font-bold mt-2">Operatives:</p>
            {players
              .filter(player => player.team === 'red' && player.role === 'operative')
              .map((player, index) => (
                <div key={index} className="text-sm">
                  {player.user_id === userId ? 'You' : player.user_id.substring(0, 8)}
                </div>
              ))}
            
            <p className="font-bold mt-2">Spymaster:</p>
            {players
              .filter(player => player.team === 'red' && player.role === 'spymaster')
              .map((player, index) => (
                <div key={index} className="text-sm">
                  {player.user_id === userId ? 'You' : player.user_id.substring(0, 8)}
                </div>
              ))}
          </div>
        </Card>

        {/* Main Game Board - Changes based on role */}
        <div className="flex-grow flex justify-center">
          {playerRole === 'spymaster' ? (
            <SpymasterBoard 
              words={initialWords} 
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
        <Card className="w-56 p-4 bg-blue-700 text-white rounded-lg">
          <h3 className="text-xl font-bold">Blue Team</h3>
          <div className="mt-2">
            <p className="font-bold mt-2">Operatives:</p>
            {players
              .filter(player => player.team === 'blue' && player.role === 'operative')
              .map((player, index) => (
                <div key={index} className="text-sm">
                  {player.user_id === userId ? 'You' : player.user_id.substring(0, 8)}
                </div>
              ))}
            
            <p className="font-bold mt-2">Spymaster:</p>
            {players
              .filter(player => player.team === 'blue' && player.role === 'spymaster')
              .map((player, index) => (
                <div key={index} className="text-sm">
                  {player.user_id === userId ? 'You' : player.user_id.substring(0, 8)}
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Game Log */}
      <Card className="w-96 mt-6 p-4 bg-gray-200 text-black rounded-lg mx-auto">
        <h3 className="text-lg font-bold">Game Log</h3>
        <div className="text-sm text-gray-600 max-h-40 overflow-y-auto">
          {gameLog.length > 0 ? 
            gameLog.map((log, index) => <p key={index} className="py-1">{log}</p>) : 
            <p>Game started. Waiting for Spymaster to give a clue...</p>
          }
        </div>
      </Card>
    </div>
  );
};

export default CodenamesGame;