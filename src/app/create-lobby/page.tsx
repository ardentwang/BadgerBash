"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {supabase} from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


interface PlayerSlotProps {
  number: number;
}

const LobbyCreation = () => {

  const [lobbyName, setLobbyName] = useState('New Lobby');
  const [lobbyCode, setLobbyCode] = useState('');

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
      } catch (err) {
        console.error('Error in lobby creation process:', err);
      }
    };
    
    setupLobby();
  }, []); 

  //POSSIBLE BOT IMPLEMENTATION?!??!?!?
  // React.FC will make it so the typing of the argument is ignored - remember to either adjust or delete when adding future implementation :3
  const PlayerSlot: React.FC<PlayerSlotProps> = ({ number }) => {
    // Local avatar image paths
    const avatarUrls = [
      "/avatars/programmer.png",
      "/avatars/student.png",
      "/avatars/wizard.png",
      "/avatars/party.png",
    ];
    return (
      <div className="flex flex-col items-center justify-center w-full h-32 border-2 bg-teal-400 border-black p-4 
              rounded-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
        <Avatar className="w-16 h-16 border-2 border-black bg-white p-1">
  <AvatarImage src={avatarUrls[number - 1]} alt={`User ${number}`} className="rounded-full" />
  <AvatarFallback>P{number}</AvatarFallback>
</Avatar>

        <p className="text-lg font-semibold text-black mt-2">User {number}</p>
      </div>
    );
  };
  
  
  
  

  return (
    <div>
        <Button className="absolute mt-5 ml-5" variant="outline" size="icon" asChild>
            <Link href="/">
                <ChevronLeft />
            </Link>
        </Button>
        <div className="min-h-screen w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
            <CardHeader className="space-y-4">
              <div className="space-y-2">
                  <label htmlFor="lobbyName" className="text-sm font-medium">
                  Lobby Name
                  </label>
                  <Input
                    id="lobbyName"
                    value={lobbyName}
                    onChange={(e) => setLobbyName(e.target.value)}
                    onBlur={async () => {
                        // update backend when user finishes editing
                        const { error } = await supabase
                            .from('lobbies')
                            .update({ name: lobbyName }) 
                            .eq('lobby_code', lobbyCode) 
                            .select()
                        if (error) {
                            console.error('Error updating lobby name:', error);
                        }
                    }}
                    className="text-lg font-semibold"
                  />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Lobby Code</label>
                <div className="bg-secondary p-3 rounded-lg">
                <p className="text-center font-mono text-2xl tracking-wider">
                    {lobbyCode}
                </p>
                </div>
            </div>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Players</h3>
                <div className="grid grid-cols-2 gap-4">
                <PlayerSlot number={1} />
                <PlayerSlot number={2} />
                <PlayerSlot number={3} />
                <PlayerSlot number={4} />
                </div>
            </div>
            </CardContent>
        </Card>
        </div>
    </div>
  );
};

export default LobbyCreation;