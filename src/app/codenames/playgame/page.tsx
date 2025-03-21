"use client";

import React, { useState } from "react";
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

const CodenamesGame = () => {
  const searchParams = useSearchParams();
  const role = searchParams ? searchParams.get("role") : null; 
  const [clue, setClue] = useState("");
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [flippedTiles, setFlippedTiles] = useState<boolean[]>(
    initialWords.map(() => (role === "spymaster" ? true : false))
  );

  // replace with actual dynamic game & player IDs from your state/context
  const gameId = "d488f102-3403-41f2-9c20-7bc94e97be7d"; 
  const playerId = "d6c2e79f-4c14-4ca0-91f9-968fabd031e3";

  // log moves to Supabase
  const logMoveToSupabase = async (word: string, wordIndex: number) => {
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
    } else {
      console.log("Move logged successfully!");
    }
  };

  //handle word selection & move logging
  const handleTileClick = async (index: number) => {
    if (role === "spymaster") return;

    setFlippedTiles((prev) =>
      prev.map((flipped, i) => (i === index ? !flipped : flipped))
    );

    const selectedWord = initialWords[index].word;
    const selectedColor = initialWords[index].color;

    setGameLog((prevLog) => [`${selectedWord} selected!`, ...prevLog]);

    await logMoveToSupabase(selectedWord, index);

    if (selectedColor === "black") {
      window.location.href = "/codenames/lose-game";
    }
  };

  // submit a clue
  const submitClue = () => {
    if (clue.trim() !== "") {
      setGameLog((prevLog) => [`Clue: ${clue}`, ...prevLog]);
      setClue("");
    }
  };

  // get the correct tile color
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
      {/* game header */}
      <h2 className="text-center text-white text-2xl font-bold mb-4">
        {role === "spymaster" ? "Give your operatives a clue." : "Guess the words!"}
      </h2>

      <div className="flex justify-center space-x-6">
        {/* left player panel */}
        <Card className="w-56 p-4 bg-red-700 text-white rounded-lg">
          <h3 className="text-xl font-bold">6</h3>
          <p>You</p>
          <Button className="w-full bg-yellow-400 text-black font-bold mt-2">
            Join
          </Button>
        </Card>

        {/* game board */}
        <div className="grid grid-cols-5 gap-2 bg-orange-900 p-4 rounded-lg">
          {initialWords.map((tile, index) => (
            <div
              key={index}
              className={`relative w-28 h-16 rounded-md font-bold cursor-pointer transform transition-transform duration-500 ${
                flippedTiles[index] ? "rotate-y-180" : ""
              }`}
              onClick={() => handleTileClick(index)}
            >
              <div className="absolute w-full h-full flex items-center justify-center bg-gray-400 text-black backface-hidden">
                {tile.word}
              </div>
              {flippedTiles[index] && (
                <div
                  className={`absolute w-full h-full flex items-center justify-center rounded-md text-white backface-hidden rotate-y-180 ${getTileClass(tile.color)}`}
                >
                  {tile.word}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* right player panel */}
        <Card className="w-56 p-4 bg-blue-700 text-white rounded-lg">
          <h3 className="text-xl font-bold">6</h3>
          <p>Me</p>
          <Button className="w-full bg-yellow-400 text-black font-bold mt-2">
            Join
          </Button>
        </Card>
      </div>

      {/* clue submission */}
      <div className="mt-4 flex justify-center items-center">
        <Input
          type="text"
          value={clue}
          onChange={(e) => setClue(e.target.value)}
          placeholder="Type your clue"
          className="w-64"
        />
        <Button className="ml-2 bg-yellow-400 text-black font-bold" onClick={submitClue}>
          Give Clue
        </Button>
      </div>

      {/* game log*/}
      <Card className="w-64 mt-6 p-4 bg-gray-200 text-black rounded-lg mx-auto">
        <h3 className="text-lg font-bold">Game Log</h3>
        <div className="text-sm text-gray-600">
          {gameLog.length > 0 ? gameLog.map((log, index) => <p key={index}>{log}</p>) : <p>-</p>}
        </div>
      </Card>
    </div>
  );
};

export default CodenamesGame;