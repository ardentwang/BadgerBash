"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from "@/components/ui/button"
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

interface LobbyProps {
    lobby_code: string | number,
    name: string,
    isPublic?: boolean,
    player_count: number 
}

const LobbyCard = (props: LobbyProps) => {
    const router = useRouter()
    const { user } = useAuth()
    const [isJoining, setIsJoining] = useState(false)

    const handleJoinLobby = async () => {
        if (!user) {
            console.error('No user found')
            return
        }

        setIsJoining(true)

        try {
            // Check if the lobby is full
            if (props.player_count >= 4) {
                alert('This lobby is full')
                setIsJoining(false)
                return
            }

            // Check if user is already in another lobby
            const { data: existingPlayer } = await supabase
                .from('players')
                .select('lobby_code')
                .eq('user_id', user.id)
                .single()

            // If they're in the same lobby, just navigate there
            if (existingPlayer && existingPlayer.lobby_code === props.lobby_code) {
                router.push(`/lobby/${props.lobby_code}`)
                return
            }

            // If they're in a different lobby, remove them first
            if (existingPlayer) {
                await supabase
                    .from('players')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('lobby_code', existingPlayer.lobby_code)
                
                // Update the player count in the previous lobby
                const { data: oldLobby } = await supabase
                    .from('lobbies')
                    .select('player_count')
                    .eq('lobby_code', existingPlayer.lobby_code)
                    .single()
                
                if (oldLobby) {
                    await supabase
                        .from('lobbies')
                        .update({ player_count: Math.max(0, oldLobby.player_count - 1) })
                        .eq('lobby_code', existingPlayer.lobby_code)
                }
            }

            // Navigate to the lobby - the lobby page will handle adding the player
            router.push(`/lobby/${props.lobby_code}`)
        } catch (error) {
            console.error('Error joining lobby:', error)
            alert('Failed to join lobby')
            setIsJoining(false)
        }
    }

    return (
        <div className='w-full'>
            <Card className='w-full mb-4 bg-white rounded-xl'>
                <div className='flex items-center justify-between'>
                    <CardHeader className='py-4 px-8 text-xl font-medium'>
                        {props.name}
                    </CardHeader>
                    <CardContent className='flex items-center gap-6 py-4 px-8'>
                        <div className='text-sm'>
                            Players: {props.player_count}/4
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleJoinLobby}
                            disabled={isJoining || props.player_count >= 4}
                        >
                            {isJoining ? 'Joining...' : props.player_count >= 4 ? 'Full' : 'Join'}
                        </Button>
                    </CardContent>
                </div>
            </Card>
        </div>
    )
}

export default LobbyCard