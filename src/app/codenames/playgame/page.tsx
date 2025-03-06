"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // <-- 1) Import this hook
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

// Words and their respective colors (blue, red, neutral, or black)
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

const logEvent = async (event: string, details = {}) => {
  console.log("Logging event:", event, details); // Debugging

  const res = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      gameId: "your-game-id",
      playerId: "your-player-id",
      details,
    }),
  });

  const data = await res.json();
  console.log("Event response:", data);
};

const EventListener = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const subscription = supabase
      .channel("game_events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "game_events" },
        (payload) => {
          console.log("New event:", payload.new);
          setEvents((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg">
      <h3 className="text-lg font-bold">Game Events</h3>
      <ul className="mt-2 space-y-1">
        {events.map((event, index) => (
          <li key={index} className="text-sm">
            {event.event} - {JSON.stringify(event.details)}
          </li>
        ))}
      </ul>
    </div>
  );
};

const CodenamesGame = () => {
  const searchParams = useSearchParams();
  const role = searchParams.get("role"); // either "spymaster" or "operative"

  const [clue, setClue] = useState("");
  const [gameLog, setGameLog] = useState<string[]>([]);

  // Submit clue function
  const submitClue = () => {
    if (clue.trim() !== "") {
      setGameLog((prevLog) => [`Clue: ${clue}`, ...prevLog]);
      setClue("");
    }
  };

  // Function to log events
  const logEvent = async (event: string, details = {}) => {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        gameId: "your-game-id",
        playerId: "your-player-id",
        details,
      }),
    });
  };

  // Call when a player selects a word
  const handleWordSelection = (word: string) => {
    logEvent("word-selected", { word, success: true });
  };

  // Decide how to color each tile based on role
  const getTileClass = (color: string) => {
    // If user is operative (NOT spymaster), always show gray
    if (role !== "spymaster") {
      return "bg-gray-200 text-black";
    }
    // If user is spymaster, show the true color
    switch (color) {
      case "blue":
        return "bg-blue-500 text-white";
      case "red":
        return "bg-red-500 text-white";
      case "black":
        return "bg-black text-white";
      default: // neutral
        return "bg-gray-200 text-black";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-red-400 p-6">
      {/* Header */}
      <h2 className="text-center text-white text-2xl font-bold mb-4">
        {role === "spymaster" ? "Give your operatives a clue." : "Guess the words!"}
      </h2>

      {/* Real-time Event Listener */}
      <EventListener />

      <div className="flex justify-center space-x-6">
        {/* Left Player Panel */}
        <Card className="w-56 p-4 bg-red-700 text-white rounded-lg">
          <h3 className="text-xl font-bold">6</h3>
          <p>You</p>
          <Button className="w-full bg-yellow-400 text-black font-bold mt-2">Join</Button>
        </Card>

        {/* Game Board */}
        <div className="grid grid-cols-5 gap-2 bg-orange-900 p-4 rounded-lg">
          {initialWords.map((tile, index) => (
            <div
              key={index}
              className={`flex items-center justify-center w-28 h-16 rounded-md font-bold 
                ${getTileClass(tile.color)}
              `}
              onClick={() => handleWordSelection(tile.word)}
            >
              {tile.word}
            </div>
          ))}
        </div>

        {/* Right Player Panel */}
        <Card className="w-56 p-4 bg-blue-700 text-white rounded-lg">
          <h3 className="text-xl font-bold">6</h3>
          <p>Me</p>
          <Button className="w-full bg-yellow-400 text-black font-bold mt-2">Join</Button>
        </Card>
      </div>

      {/* Spymaster submits clue */}
      {/* Operatives can also see this, but you can conditionally hide if you want */}
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

      {/* Game log */}
      <Card className="w-64 mt-6 p-4 bg-gray-200 text-black rounded-lg mx-auto">
        <h3 className="text-lg font-bold">Game Log</h3>
        <div className="text-sm text-gray-600">
          {gameLog.length > 0 ? (
            gameLog.map((log, index) => <p key={index}>{log}</p>)
          ) : (
            <p>-</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CodenamesGame;
