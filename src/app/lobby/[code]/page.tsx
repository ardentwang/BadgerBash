"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import Link from "next/link";

interface Lobby {
  name: string;
  player_count: number;
  is_public: boolean;
  lobby_code: number;
}

interface PlayerSlotProps {
  number: number;
}

export default function LobbyPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const { code } = React.use(params); // Get lobby code from the URL
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [lobbyName, setLobbyName] = useState("New Lobby");

  useEffect(() => {
    if (!code) return;

    const fetchLobby = async () => {
      const { data, error } = await supabase
        .from("lobbies")
        .select("*")
        .eq("lobby_code", code)
        .single();

      if (error || !data) {
        setErrorMessage("Lobby not found or may have expired.");
        setLoading(false);
        return;
      }

      setLobby(data);
      setLobbyName(data.name);
      setLoading(false);
    };

    fetchLobby();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("realtime-lobby")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "lobbies", filter: `lobby_code=eq.${code}` },
        (payload) => {
          setLobby(payload.new);
          setLobbyName(payload.new.name);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    
  }, [code]);

  if (loading) return <p>Loading lobby...</p>;
  if (errorMessage) return <p className="text-red-500">{errorMessage}</p>;

  const updateLobbyName = async () => {
    const { error } = await supabase
      .from("lobbies")
      .update({ name: lobbyName })
      .eq("lobby_code", code);

    if (error) console.error("Error updating lobby name:", error);
  };

  const leaveLobby = () => {
    router.push("/"); // Redirect to home when leaving
  };

  const PlayerSlot: React.FC<PlayerSlotProps> = ({ number }) => (
    <div className="flex items-center justify-center w-full h-24 bg-secondary rounded-lg border-2 border-border">
      <p className="text-muted-foreground">Player {number}</p>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-red-400">
        <Button
            className="absolute"
            variant="outline"
            size="icon"
            asChild
        >
            <Link href="/">
            <ChevronLeft />
            </Link>
        </Button>

      <div className="flex space-x-6">
        {/* Left Side - Lobby Card */}
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
                onBlur={updateLobbyName}
                className="text-lg font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lobby Code</label>
              <div className="bg-secondary p-3 rounded-lg">
                <p className="text-center font-mono text-2xl tracking-wider">
                  {code}
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

        {/* Right Side - Game Selection Buttons */}
        <div className="flex flex-col space-y-4 ml-12">
          <Link href="/codenames/joingame">
            <Button className="w-40 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg">
              Codenames
            </Button>
          </Link>
          <Button className="w-40 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg">
            Uno
          </Button>
          <Button className="w-40 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg">
            Monopoly
          </Button>
        </div>
      </div>
    </div>
  );
}
