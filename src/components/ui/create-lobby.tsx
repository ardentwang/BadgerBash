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
    //<div className="w-64">
      <Button
        //className="w-full py-7 text-lg text-white bg-blue-800"
        className="w-32 h-32 flex items-center justify-center text-center text-lg font-bold text-gray-800 bg-gradient-to-b from-[#FADADD] to-[#FADADD] border-[3px] border-black rounded-full shadow-lg hover:shadow-[0_0_35px_rgba(255,105,180,1),0_0_15px_rgba(255,255,255,0.8)] active:translate-y-1 active:shadow-md transition-all duration-200 ease-in-out cursor-pointer"
        size="lg"
        onClick={createLobby} // ✅ Fix: Call `createLobby`, not `CreateLobby`
        disabled={loading}
      >
        {loading ? (
          "Creating"
        ) : (
          <>
          Create <br /> Lobby
        </>
      )}
      </Button>
    //</div>
  );
};

export default CreateLobby;