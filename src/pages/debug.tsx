"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

const DebugSupabase = () => {
  useEffect(() => {
    const insertTestMove = async () => {
      // ✅ Use the correct values from your Supabase tables:
      const validGameId = "d488f102-3403-41f2-9c20-7bc94e97be7d"; // From games table
      const validPlayerId = "d6c2e79f-4c14-4ca0-91f9-968fabd031e3"; // From players table

      const { error } = await supabase.from("game_events").insert([
        {
          game_id: validGameId,
          player_id: validPlayerId,
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

    insertTestMove();
  }, []);

  return <div>Check your console for Supabase logs!</div>;
};

export default DebugSupabase;
