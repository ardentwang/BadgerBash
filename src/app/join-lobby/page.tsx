"use client" // client-side rendering
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

/**
 * Interface representing the structure of a Lobby
 */
interface Lobby {
    lobby_id: string; // Unique identifier for the lobby
    name: string; // Lobby name
    player_count: number; // Number of players currently in the lobby
    isPublic: boolean; // Indicates whether the lobby is public or private
}

/**
 * JoinLobby Component
 *
 * This component fetches and displays a list of lobbies from the database.
 * It provides two tabs: one for public lobbies and one for private lobbies.
 * Public lobbies are displayed using the LobbyCard component, while private
 * lobbies require the user to input a 6-digit code to join.
 */
export default function JoinLobby () {
    const [lobbies, setLobbies] = useState<Lobby[]>([]) // State to store the list of lobbies fetched from the database
    
    /**
   * useEffect: Fetch Lobbies from the Database
   *
   * On component mount,  useEffect retrieves all lobby records from the 'lobbies' table
   * using the Supabase client and updates the component state.
   */
    useEffect(() => {
        async function getLobbies() {
            const { data } = await supabase.from('lobbies').select('*');
            console.log("Fetched data: ", data);
            setLobbies(data || []); // Update state with fetched lobby data, or set to empty array if no data exists
        }
        getLobbies() // Call the function to fetch lobbies
    }, [])

    /**
   * Render the JoinLobby component UI.
   *
   * - A back button (using ChevronLeft) navigates to the home page.
   * - A centered Tabs component allows switching between Public and Private lobbies.
   *   - Public lobbies are rendered using the LobbyCard component.
   *   - Private lobbies display an OTP input for a 6-digit lobby code.
   */
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