"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

const DebugSupabase = () => {
  useEffect(() => {
    const insertTestMove = async () => {
        const validGameId = "b3f0e8f4-2f29-4db9-9f8b-7bba3c10aeb5"; // Replace with a real UUID from the games table
        const validPlayerId = "9c5b08c4-7a3e-4b15-aacf-4f9f5a3f3b7a"; // Replace with a real UUID from the players table
      
        const { error } = await supabase.from("game_events").insert([
          {
            game_id: validGameId, // Make sure this is a valid UUID string from your DB
            player_id: validPlayerId, // Ensure it's also a valid UUID
            word: "PIRATE",
            word_index: 3,
            event: "word_selected",
            details: {},
          },
        ]);
      
        if (error) {
          console.error("❌ Error inserting test move:", error);
        } else {
          console.log("✅ Test move inserted successfully!");
        }
      };
      
    const createTestGame = async () => {
  const { data, error } = await supabase.from("games").insert([
    { lobby_code: "123456", current_turn: "red", status: "waiting" }
  ]).select();

  if (error) {
    console.error("❌ Error creating game:", error);
  } else {
    console.log("✅ Game created:", data);
  }
};
    createTestGame();

    insertTestMove();
  }, []);

  return <div>Check console for Supabase insert test.</div>;
};

export default DebugSupabase;
