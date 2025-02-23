"use client"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
  } from "@/components/ui/input-otp"
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from "@/components/ui/tabs"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import LobbyCard from "@/components/lobbycard"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Lobby {
    lobby_id: string;
    name: string;
    player_count: number;
    isPublic: boolean;
}

export default function JoinLobby () {
    const [lobbies, setLobbies] = useState<Lobby[]>([])
    useEffect(() => {
        async function getLobbies() {
            const { data } = await supabase.from('lobbies').select('*');
            console.log("Fetched data: ", data);
            setLobbies(data || []);
        }
        getLobbies()
    }, [])


    return(
        <div>
            <Button className="absolute mt-5 ml-5" variant="outline" size="icon" asChild>
                <Link href="/">
                    <ChevronLeft />
                </Link>
            </Button>
            {/** 
             * absolute = start from top left since there's no relative css
             * left-1/2 = move right by 1/2 of screen
             * transform -translate-x-1/2 = move horizontally by 1/2 of its width (x), truly centered
             */}
            <div className="absolute mt-10 left-1/2 transform -translate-x-1/2 w-fit">
                <Tabs className="w-full">
                    <TabsList>
                        <TabsTrigger value="private">Private Lobbies</TabsTrigger>
                        <TabsTrigger value="public">Public Lobbies</TabsTrigger>
                    </TabsList>
                    <TabsContent value="public" className="w-full">
                        <div className="w-full">
                            {lobbies.map((lobby) => 
                                <LobbyCard
                                    key={lobby.lobby_id}
                                    {...lobby}
                                />
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="private" className="absolute flex flex-col">
                        <div className="mb-5">Please enter the 6 digit code provided to the owner of the private lobby</div>
                        <InputOTP maxLength={6}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}