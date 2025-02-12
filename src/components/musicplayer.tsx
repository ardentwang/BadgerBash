"use client"

import { Button } from "@/components/ui/button"
import { Music } from "lucide-react"


const MusicPlayer = () => {
  return(
    <div>
        <Button className='absolute mt-5 ml-5 z-50' variant="outline" size="icon">
            <Music />
        </Button>
    </div>
  )
}

export default MusicPlayer;