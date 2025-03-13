"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

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
  { word: "AIR", color: "black" },
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

const CodenamesGame = () => {
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId");
  const role = searchParams.get("role");
  const team = searchParams.get("team");

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [clue, setClue] = useState("");
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [flippedTiles, setFlippedTiles] = useState<boolean[]>(Array(initialWords.length).fill(false));
  const [activeClueTeam, setActiveClueTeam] = useState<string | null>(null);

  useEffect(() => {
    console.log("Retrieved Game ID:", gameId);
    console.log("Role:", role);
    console.log("Team:", team);
  }, [searchParams]); 


  useEffect(() => {
    if (!gameId) return; // Ensure gameId exists before proceeding
  
    const fetchPlayerData = async () => {
      console.log("Fetching player data...");
  
      // 🔹 Get the authenticated user from Supabase
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser?.user) {
        console.error("User not authenticated:", authError);
        return;
      }
  
      const userId = authUser.user.id;
  
      // 🔹 Fetch lobby_code from the lobbies table
      const { data: lobbyInfo, error: lobbyError } = await supabase
        .from("lobbies")
        .select("lobby_code")
        .eq("id", gameId)
        .maybeSingle();
  
      if (lobbyError) {
        console.error("Error fetching lobby info:", lobbyError);
        return;
      }
  
      if (!lobbyInfo || !lobbyInfo.lobby_code) {
        console.warn(`No valid lobby_code found for gameId: ${gameId}`);
        return;
      }
  
      let lobbyCode: string | number = lobbyInfo.lobby_code;
      if (!isNaN(Number(lobbyCode))) {
        lobbyCode = Number(lobbyCode); // Convert to number if necessary
      }
  
      console.log("Lobby Code being used:", lobbyCode);
  
      // 🔹 Fetch player ID from `players` table using user_id and lobby_code
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", userId)
        .eq("lobby_code", lobbyCode)
        .maybeSingle();
  
      if (playerError) {
        console.error("Error fetching player:", playerError);
        return;
      }
  
      if (!playerData) {
        console.warn("Player not found in lobby! Adding them...");
        await addPlayerToGame(userId, String(lobbyCode));
        return;
      }
  
      console.log("Player ID:", playerData.id);
      setPlayerId(playerData.id);
    };
  
    fetchPlayerData();
  }, [gameId]);
  
  
  
  

  const addPlayerToGame = async (userId: string, gameId: string) => {
    const { data, error } = await supabase
      .from("players")
      .insert([{ user_id: userId, lobby_code: gameId }])
      .select("id")
      .single();

    if (error) {
      console.error("Error adding player to game:", error);
      return;
    }

    console.log("Player added to game:", data);
    setPlayerId(data.id);
  };

  const logMoveToSupabase = async (word: string, wordIndex: number) => {
    if (!gameId || !playerId) {
      console.error("Missing gameId or playerId");
      return;
    }

    const { error } = await supabase.from("game_events").insert([
      {
        game_id: gameId,
        player_id: playerId,
        word: word,
        word_index: wordIndex,
        event: "word_selected",
        details: {},
      },
    ]);

    if (error) {
      console.error("Error logging move:", error);
    }
  };

  const handleTileClick = async (index: number) => {
    if (!gameId || !playerId) {
      console.warn("Waiting for gameId or playerId...");
      return;
    }

    console.log(`Handling tile click for word index ${index} in game ${gameId}`);

    if (role === "spymaster" || flippedTiles[index] || team !== activeClueTeam) return;

    setFlippedTiles((prev) => {
      const newFlippedTiles = [...prev];
      newFlippedTiles[index] = true;
      return newFlippedTiles;
    });

    const selectedWord = initialWords[index].word;
    const selectedColor = initialWords[index].color;

    setGameLog((prevLog) => [`${selectedWord} selected!`, ...prevLog]);

    await logMoveToSupabase(selectedWord, index);

    if (selectedColor === "black") {
      console.log("Assassin word selected! Redirecting to lose page...");
      window.location.href = "/lose-game";
    }
  };

  const submitClue = () => {
    if (clue.trim() !== "") {
      setGameLog((prevLog) => [`Clue: ${clue}`, ...prevLog]);
      setActiveClueTeam(team);
      setClue("");
    }
  };

  const getTileClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-500 text-white";
      case "red":
        return "bg-red-500 text-white";
      case "black":
        return "bg-black text-white";
      default:
        return "bg-gray-200 text-black";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-red-400 p-6">
      <h2 className="text-center text-white text-2xl font-bold mb-4">
        {role === "spymaster" ? "Give your operatives a clue." : "Guess the words!"}
      </h2>

      <div className="flex justify-center space-x-6">
        <Card className="w-56 p-4 bg-red-700 text-white rounded-lg">
          <h3 className="text-xl font-bold">Red Team</h3>
          <p>Operative(s) & Spymaster(s)</p>
        </Card>

        <div className="grid grid-cols-5 gap-2 bg-orange-900 p-4 rounded-lg">
          {initialWords.map((tile, index) => (
            <div key={index} className={`relative w-28 h-16 rounded-md font-bold cursor-pointer ${team !== activeClueTeam ? "opacity-50 cursor-not-allowed" : ""}`} onClick={() => handleTileClick(index)}>
              <div className="absolute w-full h-full flex items-center justify-center bg-gray-400 text-black">{tile.word}</div>
              {flippedTiles[index] && <div className={`absolute w-full h-full flex items-center justify-center rounded-md text-white ${getTileClass(tile.color)}`}>{tile.word}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CodenamesGame;
