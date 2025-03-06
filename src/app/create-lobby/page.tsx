"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {supabase} from "@/lib/supabase"
import { useRouter } from "next/navigation";

interface PlayerSlotProps {
  number: number;
}

const LobbyCreation = () => {
  const [lobbyName, setLobbyName] = useState('New Lobby');
  const [lobbyCode, setLobbyCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    const setupLobby = async () => {
      try {
        const { data: lobbiesData } = await supabase
          .from('lobbies')
          .select('lobby_code');
        
        const existingCodes = lobbiesData?.map(lobby => lobby.lobby_code) || [];
        
        let code;
        do {
          const firstPart = Math.floor(100 + Math.random() * 900).toString();
          const secondPart = Math.floor(100 + Math.random() * 900).toString();
          code = firstPart + secondPart;
        } while (existingCodes.includes(parseInt(code)));
        
        const { error } = await supabase
          .from('lobbies')
          .insert([
            { 
              name: 'New Lobby', 
              player_count: 1, 
              is_public: false, 
              lobby_code: parseInt(code)
            }
          ])
          .select();
        
        if (error) {
          console.error('Error creating lobby:', error);
          return;
        }
        
        setLobbyCode(code);
        router.push(`/lobby/${code}`);
      } catch (err) {
        console.error('Error in lobby creation process:', err);
      }
    };
    
    setupLobby();
  }, []); 

  //POSSIBLE BOT IMPLEMENTATION?!??!?!?
  // React.FC will make it so the typing of the argument is ignored - remember to either adjust or delete when adding future implementation :3
  const PlayerSlot: React.FC<PlayerSlotProps> = ({ number }) => (
    <div className="flex items-center justify-center w-full h-24 bg-secondary rounded-lg border-2 border-border">
      <p className="text-muted-foreground">Player {number}</p>
    </div>
  );

  return null;
};

export default LobbyCreation;