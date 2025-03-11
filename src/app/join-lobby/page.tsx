"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from "@/components/ui/tabs"
import { 
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import LobbyCard from '@/components/lobbycard'
import { useRouter } from 'next/navigation'

export default function JoinLobby() {
    const router = useRouter()
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const [lobbies, setLobbies] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [lobbyCode, setLobbyCode] = useState('')
    const [error, setError] = useState<string | null>(null)
    
    useEffect(() => {
        // Fetch public lobbies
        const fetchLobbies = async () => {
            setIsLoading(true)
            setError(null)
            
            try {
                const { data, error } = await supabase
                    .from('lobbies')
                    .select('*')
                    .order('created_at', { ascending: false })
                
                if (error) {
                    throw error
                }
                
                setLobbies(data || [])
            } catch (err) {
                console.error('Error fetching lobbies:', err)
                setError('Failed to load available lobbies')
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchLobbies()
        
        // Set up real-time subscription for lobbies
        const lobbiesSubscription = supabase
            .channel('public_lobbies')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'lobbies',
                filter: 'is_public=eq.true'
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setLobbies(prev => [payload.new, ...prev])
                } else if (payload.eventType === 'DELETE') {
                    setLobbies(prev => prev.filter(lobby => lobby.id !== payload.old.id))
                } else if (payload.eventType === 'UPDATE') {
                    setLobbies(prev => 
                        prev.map(lobby => 
                            lobby.id === payload.new.id ? payload.new : lobby
                        )
                    )
                }
            })
            .subscribe()
        
        return () => {
            lobbiesSubscription.unsubscribe()
        }
    }, [])
    
    const handleJoinWithCode = async (code: string) => {
        if (!code || code.length < 6) {
            setError('Please enter a valid 6-digit code')
            return
        }
        
        setIsLoading(true)
        setError(null)
        
        try {
            // Check if lobby exists
            const { data, error } = await supabase
                .from('lobbies')
                .select('lobby_code, player_count')
                .eq('lobby_code', parseInt(code))
                .single()
            
            if (error || !data) {
                setError('Lobby not found')
                return
            }
            
            if (data.player_count >= 4) {
                setError('Lobby is full')
                return
            }
            
            // Navigate to the lobby - joining will be handled in the lobby page
            router.push(`/lobby/${code}`)
            
        } catch (err) {
            console.error('Error joining with code:', err)
            setError('Failed to join lobby')
        } finally {
            setIsLoading(false)
        }
    }
    
    return (
        <div>
            <Button className="absolute mt-5 ml-5" variant="outline" size="icon" asChild>
                <Link href="/">
                    <ChevronLeft />
                </Link>
            </Button>
            
            <div className="absolute mt-10 left-1/2 transform -translate-x-1/2 w-fit">
                <Tabs defaultValue="public" className="w-full">
                    <TabsList>
                        <TabsTrigger value="private">Private Lobbies</TabsTrigger>
                        <TabsTrigger value="public">Public Lobbies</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="public" className="w-full">
                        <div className="w-full">
                            {isLoading ? (
                                <div className="text-center py-8">Loading lobbies...</div>
                            ) : lobbies.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No public lobbies available. Create your own game!
                                </div>
                            ) : (
                                lobbies.map((lobby) => (
                                    <LobbyCard
                                        key={lobby.id}
                                        lobby_code={lobby.lobby_code}
                                        name={lobby.name}
                                        player_count={lobby.player_count}
                                        isPublic={lobby.is_public}
                                    />
                                ))
                            )}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="private" className="absolute flex flex-col">
                        <div className="mb-5">Please enter the 6 digit code provided to the owner of the private lobby</div>
                        
                        <InputOTP 
                            maxLength={6} 
                            value={lobbyCode}
                            onChange={(value) => setLobbyCode(value)}
                            onComplete={(value) => handleJoinWithCode(value)}
                        >
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
                        
                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}