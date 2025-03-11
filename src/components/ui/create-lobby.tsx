"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const CreateLobby = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const createLobby = async () => {
    setLoading(true); // Prevent multiple clicks

    try {
      // Fetch existing lobby codes
      const { data: lobbiesData } = await supabase
        .from("lobbies")
        .select("lobby_code");

      const existingCodes = lobbiesData?.map((lobby) => lobby.lobby_code) || [];

      // Generate a unique 6-digit lobby code
      let code;
      do {
        const firstPart = Math.floor(100 + Math.random() * 900).toString();
        const secondPart = Math.floor(100 + Math.random() * 900).toString();
        code = firstPart + secondPart;
      } while (existingCodes.includes(parseInt(code)));

      // Insert new lobby into Supabase
      const { error } = await supabase
        .from("lobbies")
        .insert([
          {
            name: "New Lobby",
            player_count: 1,
            is_public: false,
            lobby_code: parseInt(code),
          },
        ])
        .select();

      if (error) {
        console.error("Error creating lobby:", error);
        setLoading(false);
        return;
      }

      // Redirect to the dynamically created lobby page
      router.push(`/lobby/${code}`);
    } catch (err) {
      console.error("Error in lobby creation process:", err);
      setLoading(false);
    }
  };

  return (
    <div className="w-48">
      <Button
        className="w-full text-md"
        size="lg"
        onClick={createLobby} // ✅ Fix: Call `createLobby`, not `CreateLobby`
        disabled={loading}
      >
        {loading ? "Creating Lobby..." : "Create Game Lobby"}
      </Button>
    </div>
  );
};

export default CreateLobby;