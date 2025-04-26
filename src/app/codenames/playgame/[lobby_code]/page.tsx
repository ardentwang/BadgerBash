/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import SpymasterBoard from "@/components/codenames/SpymasterBoard";
import OperativeBoard from "@/components/codenames/OperativeBoard";
import TeamPanel from "@/components/codenames/TeamPanel";
import GameLog from "@/components/codenames/GameLog";
import WordsDebugPanel from "@/components/codenames/WordsDebugPanel";

// Define the role type enum
type RoleType = "red_spymaster" | "red_operative" | "blue_spymaster" | "blue_operative";
type TeamColor = "red" | "blue";
type RoleCategory = "spymaster" | "operative";

// Define word interface
interface WordData {
  word: string;
  color: string;
  revealed: boolean;
}

// Define the turn order
const TURN_ORDER: RoleType[] = [
  "red_spymaster",
  "red_operative",
  "blue_spymaster",
  "blue_operative"
];

// Placeholder words to use until real words are loaded from Supabase
const placeholderWords: WordData[] = Array(25).fill(null).map((_, i) => ({ 
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

// Define game data structure from Supabase
interface GameData {
  clue?: string | null;
  clue_number?: number | null;
  latest_move?: string;
  current_role_turn?: RoleType;
  words?: Record<string, [string, boolean]>;
}

/**
 * Validates words data consistency and logs any issues
 * @param wordsData The raw words data from Supabase
 */
const validateWordsData = (wordsData: Record<string, [string, boolean]>) => {
  console.log("🔍 VALIDATING WORDS DATA");
  console.log("📊 Words data structure:", Object.keys(wordsData).length, "words");
  
  // 1. Check for expected number of words (should be exactly 25)
  if (Object.keys(wordsData).length !== 25) {
    console.error(`⚠️ WARNING: Expected 25 words, but got ${Object.keys(wordsData).length}`);
  }
  
  // 2. Check for correct color distribution
  const colorCounts: Record<string, number> = { red: 0, blue: 0, yellow: 0, black: 0, unknown: 0 };
  Object.entries(wordsData).forEach(([word, [color, revealed]]) => {
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  });
  
  console.log("📊 Color distribution:", colorCounts);
  
  const expectedColors = { red: 8, blue: 8, yellow: 8, black: 1 };
  Object.entries(expectedColors).forEach(([color, count]) => {
    if (colorCounts[color] !== count) {
      console.error(`⚠️ WARNING: Expected ${count} ${color} cards, but got ${colorCounts[color] || 0}`);
    }
  });
  
  // 3. Check for revealed cards consistency
  const revealedCards = Object.entries(wordsData)
    .filter(([_, [color, revealed]]) => revealed)
    .map(([word, [color, revealed]]) => ({ word, color }));
  
  console.log("📊 Revealed cards:", revealedCards);
  
  // 4. Check for duplicate words
  const wordsList = Object.keys(wordsData);
  const duplicateWords = wordsList.filter((word, index) => wordsList.indexOf(word) !== index);
  
  if (duplicateWords.length > 0) {
    console.error("⚠️ WARNING: Duplicate words found:", duplicateWords);
  }
  
  // 5. Check for invalid data structures
  const invalidEntries = Object.entries(wordsData).filter(([word, data]) => {
    const [color, revealed] = data;
    return (
      typeof word !== 'string' || 
      !word || 
      typeof color !== 'string' || 
      !['red', 'blue', 'yellow', 'black'].includes(color) ||
      typeof revealed !== 'boolean'
    );
  });
  
  if (invalidEntries.length > 0) {
    console.error("⚠️ WARNING: Invalid data entries found:", invalidEntries);
  }
  
  console.log("✅ Word data validation complete");
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
  const [wordsList, setWordsList] = useState<WordData[] | null>(null);
  
  // Additional state to track game progression
  const [remainingRedWords, setRemainingRedWords] = useState(0);
  const [remainingBlueWords, setRemainingBlueWords] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<TeamColor | null>(null);

  // Helper functions for role/team
  const getTeamFromRole = (role: RoleType): TeamColor => {
    return role.startsWith("red_") ? "red" : "blue";
  };

  const getRoleTypeFromRole = (role: RoleType): RoleCategory => {
    return role.includes("spymaster") ? "spymaster" : "operative";
  };

  const isYourTurn = useCallback((): boolean => {
    return playerRole === currentTurn;
  }, [playerRole, currentTurn]);

  // Process the words data from Supabase
  const processWordsData = useCallback((wordsData: Record<string, string | [string, boolean]>) => {
    console.log("🎮 Processing words data...");
    console.log("📊 Raw words data structure:", Object.keys(wordsData).length, "words");
    
    try {
      // Validate the data structure consistency
      if (Object.keys(wordsData).length !== 25) {
        console.warn(`⚠️ Expected 25 words, but got ${Object.keys(wordsData).length}`);
      }
      
      // Convert the word-color mapping to our required format
      const processedWords: WordData[] = Object.entries(wordsData).map(([word, data]) => {
        // Handle both formats: [color, revealed] array or string color
        const isArray = Array.isArray(data);
        const color = isArray ? data[0] : data as string;
        const revealed = isArray ? data[1] : false;
        
        return {
          word,
          color,
          revealed
        };
      });
      
      // Sort the words alphabetically by word text to ensure consistent order across clients
      // This is important to ensure the same index is used for the same word across all clients
      processedWords.sort((a, b) => a.word.localeCompare(b.word));
      
      console.log("📝 Processed and sorted words:", processedWords.map(w => w.word).join(", "));
      
      // Log some key stats for debugging
      const redWords = processedWords.filter(w => w.color === "red");
      const blueWords = processedWords.filter(w => w.color === "blue");
      const yellowWords = processedWords.filter(w => w.color === "yellow");
      const blackWords = processedWords.filter(w => w.color === "black");
      
      console.log(`🔴 Red words: ${redWords.length} (${redWords.filter(w => w.revealed).length} revealed)`);
      console.log(`🔵 Blue words: ${blueWords.length} (${blueWords.filter(w => w.revealed).length} revealed)`);
      console.log(`🟡 Yellow words: ${yellowWords.length} (${yellowWords.filter(w => w.revealed).length} revealed)`);
      console.log(`⚫ Black words: ${blackWords.length} (${blackWords.filter(w => w.revealed).length} revealed)`);
      
      // Set the processed words to state
      setWordsList(processedWords);
      
      // Count remaining words by color for scoring
      const remainingRedCount = redWords.filter(w => !w.revealed).length;
      const remainingBlueCount = blueWords.filter(w => !w.revealed).length;
      
      console.log(`📊 Remaining words - Red: ${remainingRedCount}, Blue: ${remainingBlueCount}`);
      setRemainingRedWords(remainingRedCount);
      setRemainingBlueWords(remainingBlueCount);
      
      // Check for game over conditions
      checkGameOverConditions(processedWords);
      
    } catch (error) {
      console.error("❌ Error processing words data:", error);
      console.error("📊 Problem data:", Object.keys(wordsData).length, "words");
    }
  }, []);
  
  // Check if the game is over
  const checkGameOverConditions = useCallback((words: WordData[]) => {
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
  }, [gameLog]);

  // Handle game updates from real-time subscription
  const handleGameUpdate = useCallback((payload: any) => {
    console.log("🔔 Real-time game update received:");
    console.log("📊 Payload type:", payload.eventType);
    console.log("📊 Payload table:", payload.table);
    console.log("📊 Payload schema:", payload.schema);
    
    if (payload.new) {
      const newData = payload.new as GameData;
      console.log("📊 New data received:", JSON.stringify(newData, null, 2));
      
      // Update current turn if available
      if (newData.current_role_turn) {
        console.log(`🎮 Turn updated to: ${newData.current_role_turn}`);
        console.log(`🎮 Previous turn was: ${currentTurn}`);
        setCurrentTurn(newData.current_role_turn);
        
        // Optional: Add notification when it's your turn
        if (newData.current_role_turn === playerRole) {
          console.log("🔔 It's your turn now!");
        }
      }
      
      // Update current clue if available
      if (newData.clue && typeof newData.clue_number === 'number') {
        console.log(`🎲 Clue updated to: "${newData.clue}" (${newData.clue_number})`);
        setCurrentClue({
          clue: newData.clue,
          number: newData.clue_number
        });
      } else if (newData.clue === null || newData.clue_number === null) {
        console.log("🎲 Clue reset to null");
        setCurrentClue(null);
      }
      
      // Update game log with latest move
      if (newData.latest_move) {
        console.log(`📜 New log entry: ${newData.latest_move}`);
        setGameLog(prev => [newData.latest_move as string, ...prev]);
      }
      
      // If words have been updated, reload them
      if (newData.words) {
        console.log("🎮 Words data received in update");
        console.log(`📊 Words object contains ${Object.keys(newData.words).length} words`);
        
        // Check a few sample words to ensure data structure
        const wordSample = Object.entries(newData.words).slice(0, 3);
        console.log("📊 Sample words from update:", wordSample);
        
        // Validate the words data
        validateWordsData(newData.words as Record<string, [string, boolean]>);
        
        // Process the words data
        processWordsData(newData.words);
      }
    }
  }, [playerRole, processWordsData, currentTurn]);

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
          if (gameData.clue && gameData.clue_number !== undefined) {
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
            // Validate the words data
            validateWordsData(gameData.words as Record<string, [string, boolean]>);
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
        handleGameUpdate
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
   
  }, [userId, lobbyCode, processWordsData, handleGameUpdate]);

  // Determine if the current player can interact with the game
  const canInteract = useCallback(() => {
    if (gameOver) return false;
    return isYourTurn();
  }, [gameOver, isYourTurn]);

  // Calculate the next turn
  const getNextTurn = useCallback((): RoleType => {
    const currentIndex = TURN_ORDER.indexOf(currentTurn);
    const nextIndex = (currentIndex + 1) % TURN_ORDER.length;
    return TURN_ORDER[nextIndex];
  }, [currentTurn]);

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
      
      // Don't need to manually update local state as it will be updated by the subscription
      // This avoids potential race conditions between manual updates and subscription updates
      
    } catch (err) {
      console.error("❌ Exception while updating clue:", err);
    }
  };

  const handleEndTurn = async () => {
    if (!isYourTurn() || !playerRole?.includes("operative")) {
      console.log("❌ Not your turn or you're not an operative");
      return;
    }
    
    const team = getTeamFromRole(playerRole);
    console.log(`🔄 ${team} Operative ends their turn`);
    
    // Create log message
    const logMessage = `${team} Operative ended their turn`;
    
    // Calculate next turn (operative -> opponent's spymaster)
    const nextTurn = team === "red" ? "blue_spymaster" : "red_spymaster";
    
    try {
      // Update database with the new turn
      const { error } = await supabase
        .from('codenames_games')
        .upsert({
          lobby_code: lobbyCode,
          latest_move: logMessage,
          current_role_turn: nextTurn,
          clue: null,
          clue_number: null
        }, {
          onConflict: 'lobby_code'
        });
      
      if (error) {
        console.error("❌ Error ending turn in database:", error);
        return;
      }
      
      console.log("✅ Turn ended, passing to opponent's spymaster");
      
    } catch (err) {
      console.error("❌ Exception while ending turn:", err);
    }
  };

  // Handle selecting a word (for operative)
  const handleSelectWord = async (word: WordData, index: number) => {
    // Only allow if it's the operative's turn
    if (!isYourTurn() || !playerRole?.includes("operative")) {
      console.log("❌ Not your turn or you're not an operative");
      console.log(`Current turn: ${currentTurn}, Player role: ${playerRole}`);
      return;
    }
    
    const team = getTeamFromRole(playerRole);
    console.log(`👆 ${team} Operative selected word:`, word.word, "at index:", index);
    
    // IMPORTANT: Find the word by exact match in our words list
    if (!wordsList) {
      console.error("❌ wordsList is null, cannot update");
      return;
    }
    
    // Log the current state of all words for debugging
    console.log("📊 Current wordsList words:", wordsList.map(w => w.word).join(", "));
    
    // Find the word in our list using the exact word text as the identifier
    const selectedWord = wordsList.find(w => w.word === word.word);
    
    if (!selectedWord) {
      console.error(`❌ Selected word "${word.word}" not found in wordsList`);
      // Log all words to see why we can't find it
      console.log("Available words:", wordsList.map(w => w.word));
      return;
    }
    
    console.log(`✅ Found selected word in wordsList: ${selectedWord.word}, Color: ${selectedWord.color}, Revealed: ${selectedWord.revealed}`);
    
    // Create log message
    const logMessage = `${team} Operative selected: ${selectedWord.word} (${selectedWord.color})`;
    
    // Determine if the team got the correct color
    const correctPick = selectedWord.color === team;
    console.log(`🎮 Correct pick? ${correctPick ? "✅ Yes" : "❌ No"}`);
    
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
    } else if (currentClue && currentClue.number <= 0) {
      // Used all guesses, turn passes to other team
      nextTurn = team === "red" ? "blue_spymaster" : "red_spymaster";
      console.log(`✅ Used all guesses - turn passes to ${nextTurn}`);
    } else {
      // Correct pick, still has guesses left, stay on current team's operative
      nextTurn = currentTurn;
      console.log(`✅ Correct pick - ${nextTurn} gets another guess`);
    }
    
    try {
      // Create a copy of the wordsList to update the selected word
      const updatedWords = JSON.parse(JSON.stringify(wordsList)) as WordData[];
      
      // THE CRITICAL FIX: Instead of using findIndex, find the exact index in the array
      // This ensures we're updating the same card across all clients
      const wordIndex = updatedWords.findIndex(w => w.word === word.word);
      
      if (wordIndex === -1) {
        console.error(`❌ Word "${word.word}" not found in updatedWords array`);
        return;
      }
      
      console.log(`📊 Found word at index ${wordIndex}: ${updatedWords[wordIndex].word}`);
      
      // Mark as revealed
      updatedWords[wordIndex].revealed = true;
      
      // Update the clue number if correct pick, otherwise reset for next team
      let updatedClueNumber = currentClue?.number;
      let updatedClue = currentClue?.clue;
      
      if (correctPick && currentClue) {
        // Same team continues, just decrement the number
        updatedClueNumber = currentClue.number - 1;
      } else if (!correctPick || (currentClue && currentClue.number <= 0)) {
        // Different team's turn or out of guesses, reset clue and number
        updatedClueNumber = undefined;
        updatedClue = undefined;
        console.log("🔄 Resetting clue and clue number for next team's turn");
      }
      
      // IMPORTANT: Create the words object in a consistent format for Supabase
      const wordsObject: Record<string, [string, boolean]> = {};
      updatedWords.forEach(w => {
        wordsObject[w.word] = [w.color, w.revealed];
      });
      
      console.log(`📤 Sending update to Supabase with ${Object.keys(wordsObject).length} words`);
      console.log(`📤 Word "${word.word}" updated to revealed=${updatedWords[wordIndex].revealed}`);
      
      // Update database with the selected word, turn and clue number
      const { data, error } = await supabase
        .from('codenames_games')
        .upsert({
          lobby_code: lobbyCode,
          words: wordsObject,
          latest_move: logMessage,
          current_role_turn: nextTurn,
          clue: updatedClue,
          clue_number: updatedClueNumber
        }, {
          onConflict: 'lobby_code'
        });
      
      if (error) {
        console.error("❌ Error updating selected word in database:", error);
        return;
      }
      
      console.log("✅ Word selection updated in database");
      
    } catch (err) {
      console.error("❌ Exception while updating selected word:", err);
    }
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
        <span className="text-white px-3 py-1 rounded-lg">
          Lobby: {lobbyCode}
        </span>
        <h1 className="text-2xl font-bold text-white">Codenames</h1>
      </div>

      {/* Game status */}
      <div className="bg-purple-100 p-3 rounded-lg shadow mb-4 text-center">
        {gameOver ? (
          <div>
            <h3 className="text-lg font-semibold">Game Over!</h3>
            <p className="text-2xl font-bold">{winner?.toUpperCase()} Team Wins!</p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-white text-outline">Current Turn</h3>
            <p className={`text-2xl font-bold ${currentTurn.startsWith('red_') ? 'text-red-600' : 'text-blue-600'}`}>
              {currentTurn.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
            {currentTurn === playerRole && (
              <div className="mt-1 px-3 py-1 bg-green-100 text-green-800 rounded-full inline-block">
                Your Turn!
              </div>
            )}
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
          userId={userId || ""} // Provide empty string as fallback
          score={remainingRedWords}
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
                onEndTurn={handleEndTurn}
              />
            </>
          )}
        </div>

        {/* Right Panel - Blue Team */}
        <TeamPanel 
          color="blue" 
          players={players.filter(p => p.role.startsWith('blue_'))} 
          userId={userId || ""} // Provide empty string as fallback
          score={remainingRedWords}
        />
      </div>

      {/* Game Log */}
      <GameLog logs={gameLog} />
      
      {/* Debug Panel - You can comment this out in production */}
      {wordsList && (
        <WordsDebugPanel 
          words={wordsList} 
          playerRole={playerRole || "spectator"} 
        />
      )}
    </div>
  );
};

export default CodenamesGame;