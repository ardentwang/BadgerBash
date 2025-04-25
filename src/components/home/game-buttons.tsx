'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function GameButtons() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreateLobby = async () => {
    setIsCreating(true);
    
    try {
      // Get existing lobby codes to avoid duplicates
      const { data: lobbiesData, error: fetchError } = await supabase
        .from('lobbies')
        .select('lobby_code');
      
      if (fetchError) {
        console.error('Error fetching existing lobbies:', fetchError);
        throw fetchError;
      }
      
      const existingCodes = lobbiesData?.map(lobby => lobby.lobby_code) || [];
      
      // Generate a unique 6-digit code
      let code;
      do {
        const firstPart = Math.floor(100 + Math.random() * 900).toString();
        const secondPart = Math.floor(100 + Math.random() * 900).toString();
        code = firstPart + secondPart;
      } while (existingCodes.includes(parseInt(code)));
      
      // Create the lobby in the database
      const { error: insertError } = await supabase
        .from('lobbies')
        .insert([
          { 
            name: 'New Lobby', 
            player_count: 0, 
            is_public: false, 
            lobby_code: parseInt(code)
          }
        ]);
      
      if (insertError) {
        console.error('Error creating lobby:', insertError);
        return;
      }
      
      // Immediately redirect to the lobby page
      router.push(`/lobby/${code}`);
      
    } catch (err) {
      console.error('Error in lobby creation process:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-6 mb-10">
      {/* Join Button */}
      <Button 
        className="w-64 h-14 text-lg bg-foreground text-background hover:foreground/90"
        asChild
      >
        <Link href="/join-lobby">
          Join Game
        </Link>
      </Button>

      {/* Create Button */}
      <Button 
        className="w-64 h-14 text-lg bg-foreground text-background hover:foreground/90"
        onClick={handleCreateLobby}
        disabled={isCreating}
      >
        {isCreating ? "Creating..." : "Create Game Lobby"}
      </Button>
    </div>
  )
}