"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const LobbyCreation = () => {
  const [lobbyName, setLobbyName] = useState('New Lobby');
  const [lobbyCode, setLobbyCode] = useState('');

  //YO I NEEDA FIND A WAY TO MAKE THIS UNIQUE AND INTEGRATION
  useEffect(() => {
    const generateCode = () => {
      const code = Math.floor(100 + Math.random() * 900).toString();
      const secondcode = Math.floor(100 + Math.random() * 900).toString();
      setLobbyCode(code + " - " + secondcode);
    };
    generateCode();
  }, []);

  //POSSIBLE BOT IMPLEMENTATION?!??!?!?
  const PlayerSlot = ({ number }) => (
    <div className="flex items-center justify-center w-full h-24 bg-secondary rounded-lg border-2 border-border">
      <p className="text-muted-foreground">Player {number}</p>
    </div>
  );

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