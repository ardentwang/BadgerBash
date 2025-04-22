"use client"

import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

// Define a proper type for the player data coming from lobby_players
interface PlayerData {
  user_id: string
  lobby_id?: string
  username: string
  avatar_url: string
  joined_at?: string
}

interface PlayerProps {
  player: PlayerData | null
  isCurrentUser?: boolean
  isHost?: boolean  // We'll pass this from the parent component
}

export default function PlayerSlot({ player, isCurrentUser, isHost = false }: PlayerProps) {
  if (!player) {
    // Empty player slot
    return (
      <Card className="h-24 flex items-center justify-center border-dashed border-2 border-gray-300 bg-gray-50">
        <CardContent className="p-4 text-center text-gray-500">
          Waiting for player...
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={`h-24 overflow-hidden ${isCurrentUser ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={player.avatar_url || '/avatars/student.png'}
            alt={`${player.username || 'Player'}'s avatar`}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{player.username}</div>
          <div className="flex items-center gap-2 mt-1">
            {isHost && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Host
              </span>
            )}
            {isCurrentUser && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                You
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}