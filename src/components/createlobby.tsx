"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from '@/context/AuthContext'

export default function CreateLobby() {
  const router = useRouter();
  const { user } = useAuth();
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
            player_count: 1, 
            is_public: false, 
            lobby_code: parseInt(code)
          }
        ]);
      
      if (insertError) {
        console.error('Error creating lobby:', insertError);
        return;
      }
      
      // Add the current user as the first player and host
      let userId;
      let username;
      
      if (user) {
        // Use the authenticated user's ID if available
        userId = user.id;
        username = user.user_metadata?.username || 'Guest';
      } else {
        // Generate temporary ID for guests
        userId = "user-" + Math.random().toString(36).substring(2, 9);
        username = "Guest";
        
        // Save the user ID to localStorage for persistence
        localStorage.setItem(`lobby_${code}_user_id`, userId);
      }
      
      const { error: playerError } = await supabase
        .from('lobby_players')
        .insert([
          {
            user_id: userId,
            name: username,
            avatar_url: user?.user_metadata?.avatar_url || '/avatars/student.png',
            lobby_code: parseInt(code),
            is_host: true
          }
        ]);
      
      if (playerError) {
        console.error('Error adding player to lobby:', playerError);
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
    <Button 
      className="w-full text-md" 
      size="lg"
      onClick={handleCreateLobby}
      disabled={isCreating}
    >
      {isCreating ? "Creating..." : "Create Lobby"}
    </Button>
  );
}