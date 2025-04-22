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

// Define the role type enum
type RoleType = "red_spymaster" | "red_operative" | "blue_spymaster" | "blue_operative";

// Define turn order
const TURN_ORDER: RoleType[] = [
  "red_spymaster",
  "red_operative",
  "blue_spymaster",
  "blue_operative"
];

// Placeholder words to use until real words are loaded from Supabase
const placeholderWords = Array(25).fill({}).map((_, i) => ({ 
  word: `Word ${i+1}`, 
  color: "unknown",
  revealed: false
}));

type PlayerInfo = {
  id: string;
  user_id: string;
  role: RoleType;
  lobby_code: number;
};

const CodenamesGame = () => {
  const params = useParams();
  const rawLobbyCode = params.lobby_code;
  // Check if rawLobbyCode exists before processing it
  const arrayLobbyCode = rawLobbyCode ? (Array.isArray(rawLobbyCode) ? rawLobbyCode[0] : rawLobbyCode) : "";
  const lobbyCode = arrayLobbyCode ? parseInt(arrayLobbyCode, 10) : 0; 
  console.log("🔍 Lobby Code parsed:", lobbyCode);
  
  const { user } = useAuth();
  const userId = user?.id;
  console.log("👤 Current User ID:", userId);

  // State for player role
  const [playerRole, setPlayerRole] = useState<RoleType | null>(null);
  
  // Game state
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [currentTurn, setCurrentTurn] = useState<RoleType>("red_spymaster"); // Default first turn
  
  // State for current clue
  const [currentClue, setCurrentClue] = useState<{ clue: string; number: number } | null>(null);

  // Words and revealed state
  const [wordsList, setWordsList] = useState<{ word: string; color: string; revealed: boolean }[] | null>(null);
  
  // Additional state to track game progression
  const [wordSelectionHistory, setWordSelectionHistory] = useState<string[]>([]);
  const [remainingRedWords, setRemainingRedWords] = useState(0);
  const [remainingBlueWords, setRemainingBlueWords] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"red" | "blue" | null>(null);

  // Helper functions for role/team
  const getTeamFromRole = (role: RoleType): "red" | "blue" => {
    return role.startsWith("red_") ? "red" : "blue";
  };

  const getRoleTypeFromRole = (role: RoleType): "spymaster" | "operative" => {
    return role.includes("spymaster") ? "spymaster" : "operative";
  };

  const isYourTurn = (): boolean => {
    return playerRole === currentTurn;
  };

  // Fetch user role and game data from database
  useEffect(() => {
    console.log("🔄 useEffect triggered with userId:", userId, "and lobbyCode:", lobbyCode);
    
    const fetchGameData = async () => {
      if (!userId || !lobbyCode) {
        console.warn("⚠️ Missing userId or lobbyCode, skipping data fetch");
        return;
      }
      
      try {
        console.log("📡 Fetching user role for userId:", userId, "in lobby:", lobbyCode);
        
        // Gets roles of all users in codenames lobby
        const { data, error } = await supabase
          .from('codenames_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('lobby_code', lobbyCode);
        
        if (error) {
          console.error("❌ Error fetching user role:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          return;
        }
        
        console.log("🎭 User role data:", data);
        
        if (data && data.length > 0) {
          setPlayerRole(data[0].role as RoleType);
          console.log(`✅ Player assigned as ${data[0].role}`);
        } else {
          console.warn("⚠️ No role found for this user in this lobby");
        }
        
        // Get all players in this lobby
        console.log("📡 Fetching all players in lobby:", lobbyCode);
        const { data: lobbyPlayers, error: playersError } = await supabase
          .from('codenames_roles')
          .select('*')
          .eq('lobby_code', lobbyCode);

        if (playersError) {
          console.error("❌ Error fetching players:", playersError);
          return;
        }

        console.log("👥 All players in lobby:", lobbyPlayers);
        setPlayers(lobbyPlayers as PlayerInfo[] || []);
        
        // Fetch game state
        console.log("📡 Fetching game state for lobby:", lobbyCode);
        const { data: gameData, error: gameError } = await supabase
          .from('codenames_games')
          .select('clue, clue_number, latest_move, current_role_turn, words')
          .eq('lobby_code', lobbyCode)
          .single();
          
        if (gameError) {
          if (gameError.code === 'PGRST116') {
            console.log("ℹ️ No game found for this lobby yet");
          } else {
            console.error("❌ Error fetching game state:", gameError);
          }
        } else if (gameData) {
          console.log("📝 Game data:", gameData);
          
          // Set current turn
          if (gameData.current_role_turn) {
            setCurrentTurn(gameData.current_role_turn as RoleType);
            console.log(`🎮 Current turn: ${gameData.current_role_turn}`);
          }
          
          // Set current clue
          if (gameData.clue && gameData.clue_number) {
            setCurrentClue({
              clue: gameData.clue,
              number: gameData.clue_number
            });
          }
          
          // Add latest move to game log if available
          if (gameData.latest_move) {
            setGameLog(prev => [gameData.latest_move, ...prev]);
          }
          
          // Process words
          if (gameData.words) {
            processWordsData(gameData.words);
          }
        }
        
      } catch (error) {
        console.error("❌ Error in data fetching:", error);
      } finally {
        setLoading(false);
        console.log("✅ Initial data loading complete");
      }
    };
    
    fetchGameData();
    
    // Set up real-time subscription for game updates
    const gameChannel = supabase
      .channel(`game-updates-${lobbyCode}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'codenames_games',
          filter: `lobby_code=eq.${lobbyCode}`
        }, 
        (payload) => {
          console.log("🎲 Real-time game update received:", payload);
          if (payload.new) {
            // Update current turn if available
            if (payload.new.current_role_turn) {
              setCurrentTurn(payload.new.current_role_turn as RoleType);
              console.log(`🎮 Turn updated to: ${payload.new.current_role_turn}`);
            }
            
            // Update current clue if available
            if (payload.new.clue && payload.new.clue_number) {
              setCurrentClue({
                clue: payload.new.clue,
                number: payload.new.clue_number
              });
            }
            
            // Update game log with latest move
            if (payload.new.latest_move) {
              setGameLog(prev => [payload.new.latest_move, ...prev]);
            }
            
            // If words have been updated, reload them
            if (payload.new.words) {
              processWordsData(payload.new.words);
            }
          }
        }
      )
      .subscribe();
      
    // Set up real-time subscription for player updates
    const playersChannel = supabase
      .channel(`lobby-players-${lobbyCode}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'codenames_roles',
          filter: `lobby_code=eq.${lobbyCode}`
        }, 
        (payload) => {
          console.log("🔔 Real-time player update received:", payload);
          fetchGameData();
        }
      )
      .subscribe();
      
    console.log("✅ Real-time subscriptions established");
      
    return () => {
      console.log("♻️ Cleaning up subscriptions");
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(playersChannel);
    };
   
  }, [userId, lobbyCode]);

  // Process the words data from Supabase
  const processWordsData = (wordsData) => {
    console.log("🎮 Processing words data...");
    
    try {
      // Convert the word-color mapping to our required format
      const processedWords = Object.entries(wordsData).map(([word, data]) => {
        // Handle both formats: [color, revealed] array or string color
        const isArray = Array.isArray(data);
        const color = isArray ? data[0] : data;
        const revealed = isArray ? data[1] : false;
        
        return {
          word,
          color,
          revealed
        };
      });
      
      console.log("📝 Processed words:", processedWords.slice(0, 3), "...");
      setWordsList(processedWords);
      
      // Count remaining words by color
      const redWords = processedWords.filter(w => w.color === "red" && !w.revealed).length;
      const blueWords = processedWords.filter(w => w.color === "blue" && !w.revealed).length;
      
      console.log(`Remaining words - Red: ${redWords}, Blue: ${blueWords}`);
      setRemainingRedWords(redWords);
      setRemainingBlueWords(blueWords);
      
      // Check for game over conditions
      checkGameOverConditions(processedWords);
      
    } catch (error) {
      console.error("❌ Error processing words data:", error);
    }
  };
  
  // Check if the game is over
  const checkGameOverConditions = (words) => {
    // Check if all red words are revealed
    const allRedRevealed = words.filter(w => w.color === "red").every(w => w.revealed);
    if (allRedRevealed) {
      setGameOver(true);
      setWinner("red");
      return;
    }
    
    // Check if all blue words are revealed
    const allBlueRevealed = words.filter(w => w.color === "blue").every(w => w.revealed);
    if (allBlueRevealed) {
      setGameOver(true);
      setWinner("blue");
      return;
    }
    
    // Check if the assassin (black) card is revealed
    const assassinRevealed = words.find(w => w.color === "black" && w.revealed);
    if (assassinRevealed) {
      setGameOver(true);
      // The team who revealed the assassin loses
      const assassinRevealedBy = gameLog.find(log => log.includes(assassinRevealed.word));
      if (assassinRevealedBy?.includes("red")) {
        setWinner("blue");
      } else {
        setWinner("red");
      }
    }
  };

  // Calculate the next turn
  const getNextTurn = (): RoleType => {
    const currentIndex = TURN_ORDER.indexOf(currentTurn);
    const nextIndex = (currentIndex + 1) % TURN_ORDER.length;
    return TURN_ORDER[nextIndex];
  };

  // Handle giving a clue (for spymaster)
  const handleGiveClue = async (clue: string, clueNumber: number) => {
    // Only allow if it's the spymaster's turn
    if (!isYourTurn() || !playerRole?.includes("spymaster")) {
      console.log("❌ Not your turn or you're not a spymaster");
      return;
    }
    
    const team = getTeamFromRole(playerRole);
    console.log(`🗣️ ${team} Spymaster gave clue: "${clue}" with number: ${clueNumber}`);
    
    // Create log message
    const logMessage = `${team} Spymaster's clue: ${clue} (${clueNumber})`;
    
    // Calculate next turn (spymaster -> operative of same team)
    const nextTurn = playerRole === "red_spymaster" ? "red_operative" : "blue_operative";
    
    try {
      // Update database with the new clue and turn
      const { data, error } = await supabase
        .from('codenames_games')
        .upsert({
          lobby_code: lobbyCode,
          clue: clue,
          clue_number: clueNumber,
          latest_move: logMessage,
          current_role_turn: nextTurn
        }, {
          onConflict: 'lobby_code'
        });
      
      if (error) {
        console.error("❌ Error updating clue in database:", error);
        return;
      }
      
      console.log("✅ Clue updated in database, turn changed to operative");
      
      // Update local state (will also be updated by the subscription)
      setCurrentClue({ clue, number: clueNumber });
      setCurrentTurn(nextTurn);
      setGameLog([logMessage, ...gameLog]);
      
    } catch (err) {
      console.error("❌ Exception while updating clue:", err);
    }
  };

  // Handle selecting a word (for operative)
  const handleSelectWord = async (word, index) => {
    // Only allow if it's the operative's turn
    if (!isYourTurn() || !playerRole?.includes("operative")) {
      console.log("❌ Not your turn or you're not an operative");
      return;
    }
    
    const team = getTeamFromRole(playerRole);
    console.log(`👆 ${team} Operative selected word:`, word.word);
    
    // Find the word in our list
    const selectedWord = wordsList?.find(w => w.word === word.word);
    if (!selectedWord) {
      console.error(`❌ Selected word "${word.word}" not found in wordsList`);
      return;
    }
    
    // Create log message
    const logMessage = `${team} Operative selected: ${word.word} (${selectedWord.color})`;
    
    // Determine if the team got the correct color
    const correctPick = selectedWord.color === team;
    
    // Calculate next turn
    let nextTurn: RoleType;
    
    if (selectedWord.color === "black") {
      // Game over if assassin is picked
      console.log("☠️ Assassin card picked - game over!");
      nextTurn = currentTurn; // No next turn, game is over
    } else if (!correctPick) {
      // Incorrect pick, turn goes to other team's spymaster
      nextTurn = team === "red" ? "blue_spymaster" : "red_spymaster";
      console.log(`❌ Incorrect pick - turn passes to ${nextTurn}`);
    } else if (currentClue && parseInt(currentClue.number.toString()) <= 0) {
      // Used all guesses, turn passes to other team
      nextTurn = team === "red" ? "blue_spymaster" : "red_spymaster";
      console.log(`✅ Used all guesses - turn passes to ${nextTurn}`);
    } else {
      // Correct pick, still has guesses left, stay on current team's operative
      nextTurn = currentTurn;
      console.log(`✅ Correct pick - ${nextTurn} gets another guess`);
    }
    
    try {
      // Make a copy of the words to update
      const updatedWords = JSON.parse(JSON.stringify(wordsList));
      const wordIndex = updatedWords.findIndex(w => w.word === word.word);
      updatedWords[wordIndex].revealed = true;
      
      // Update the clue number if correct pick
      let updatedClueNumber = currentClue?.number;
      if (correctPick && currentClue) {
        updatedClueNumber = currentClue.number - 1;
      }
      
      // Update database with the selected word, turn and clue number
      const { data, error } = await supabase
        .from('codenames_games')
        .upsert({
          lobby_code: lobbyCode,
          words: updatedWords.reduce((acc, w) => {
            acc[w.word] = [w.color, w.revealed];
            return acc;
          }, {}),
          latest_move: logMessage,
          current_role_turn: nextTurn,
          clue_number: updatedClueNumber
        }, {
          onConflict: 'lobby_code'
        });
      
      if (error) {
        console.error("❌ Error updating selected word in database:", error);
        return;
      }
      
      console.log("✅ Word selection updated in database");
      
      // Update local state (will also be updated by the subscription)
      setWordsList(updatedWords);
      setCurrentTurn(nextTurn);
      setGameLog([logMessage, ...gameLog]);
      
      if (currentClue && currentClue.number > 0) {
        setCurrentClue({
          ...currentClue,
          number: updatedClueNumber
        });
      }
      
      // Check for game over conditions
      checkGameOverConditions(updatedWords);
      
    } catch (err) {
      console.error("❌ Exception while updating selected word:", err);
    }
  };

  // Determine if the current player can interact with the game
  const canInteract = () => {
    if (gameOver) return false;
    return isYourTurn();
  };

  if (loading) {
    console.log("⏳ Game is still loading...");
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-400">
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-bold mb-2">Loading game...</h2>
          <p>Please wait while we set up your game.</p>
        </Card>
      </div>
    );
  }

  // Get team from role for display
  const team = playerRole ? getTeamFromRole(playerRole) : "spectator";
  const roleType = playerRole ? getRoleTypeFromRole(playerRole) : "spectator";
  
  console.log("🎮 Rendering game with role:", playerRole, "team:", team);

  return (
    <div className="flex flex-col min-h-screen bg-red-400 p-6">
      {/* Header with game info */}
      <div className="flex justify-between items-center mb-4">
        <span className="bg-yellow-400 text-black px-3 py-1 rounded-lg">
          Lobby: {lobbyCode}
        </span>
        <h1 className="text-2xl font-bold text-white">Codenames</h1>
        <span className="bg-yellow-400 text-black px-3 py-1 rounded-lg">
          You: {team} {roleType}
        </span>
      </div>

      {/* Game status */}
      <div className="bg-yellow-100 p-3 rounded-lg shadow mb-4 text-center">
        {gameOver ? (
          <div>
            <h3 className="text-lg font-semibold">Game Over!</h3>
            <p className="text-2xl font-bold">{winner?.toUpperCase()} Team Wins!</p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold">Current Turn</h3>
            <p className="text-2xl font-bold">
              {currentTurn.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              {currentTurn === playerRole && " (Your Turn)"}
            </p>
            {currentClue && (
              <div className="mt-2">
                <p className="text-xl">
                  Current Clue: <span className="font-bold">{currentClue.clue} - {currentClue.number}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex space-x-6">
        {/* Left Panel - Red Team */}
        <TeamPanel 
          color="red" 
          players={players.filter(p => p.role.startsWith('red_'))} 
          userId={userId}
        />

      <div className="flex-grow flex justify-center">
        {roleType === 'spymaster' ? (
          <>
            {console.log("🎮 Rendering SpymasterBoard with wordColorList:", 
              wordsList ? `${wordsList.length} words` : "null")}
            <SpymasterBoard 
              words={wordsList || placeholderWords} 
              team={team}
              onGiveClue={handleGiveClue}
              canInteract={canInteract() && roleType === 'spymaster'}
            />
          </>
        ) : (
          <>
            {console.log("🎮 Rendering OperativeBoard:", 
              wordsList ? `${wordsList.length} words available` : "using placeholders")}
            <OperativeBoard 
              words={wordsList || placeholderWords.map(pw => ({ ...pw, color: "unknown" }))} 
              team={team} 
              onSelectWord={handleSelectWord}
              canInteract={canInteract() && roleType === 'operative'}
            />
          </>
        )}
      </div>

        {/* Right Panel - Blue Team */}
        <TeamPanel 
          color="blue" 
          players={players.filter(p => p.role.startsWith('blue_'))} 
          userId={userId}
        />
      </div>

      {/* Game Log */}
      <GameLog logs={gameLog} />
    </div>
  );
};

export default CodenamesGame;