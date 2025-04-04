"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import PlayerSlot from '@/components/lobby/PlayerSlot'
import { supabase } from '@/lib/supabase'
import { useAuth } from "@/context/AuthContext"


const LobbyPage = () => {
  console.log(supabase.auth.getUser())
  console.log(useAuth())

  const lobbyData = {
    lobby_code: "123456",
    name: "New Lobby",
    player_count: 2
  };

  const playersData = [
    {
      user_id: "user1",
      username: "Player 1",
      avatar_url: "/avatars/student.png",
      is_host: true
    },
    {
      user_id: "user1",
      username: "Player 2",
      avatar_url: "/avatars/student.png",
      is_host: false
    }
  ];

  return (
    <div>
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="lobbyName" className="text-sm font-medium">
                Lobby Name
              </label>
              <div className="flex gap-2">
                <Input
                  id="lobbyName"
                  value={lobbyData.name}
                  disabled={true}
                />
                <Button
                  variant="outline"
                  disabled={true}
                >
                  Update
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lobby Code</label>
              <div className="bg-secondary p-3 rounded-lg">
                <p className="text-center font-mono text-2xl tracking-wider">
                  {lobbyData.lobby_code}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Players ({playersData.length}/4)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Map through 4 player slots 
                {Array.from({ length: 4 }).map((_, index) => (
                  <PlayerSlot 
                    key={index}
                    player={playersData[index] || null}
                    isCurrentUser={playersData[index]?.user_id === user?.id}
                  />
                ))}*/}
              </div>
              
              <div className="flex gap-4 mt-6 pt-4 border-t">
                <Button 
                  className="w-full" 
                >
                  Start Game
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                >
                  Leave Lobby
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LobbyPage;