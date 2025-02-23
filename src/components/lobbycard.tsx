"use client"
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button"

interface LobbyProps {
    lobby_id?: number,
    name: string,
    isPublic?: boolean,
    player_count: number 
}

const LobbyCard = (props : LobbyProps) =>{
    return(
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
                        >
                            Join
                        </Button>
                    </CardContent>
                </div>
            </Card>
        </div>
    )
}

export default LobbyCard