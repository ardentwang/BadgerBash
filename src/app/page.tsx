"use client"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import MusicPlayer from '@/components/musicplayer'

export default function Home() {
  return (
    <div className="bg-background min-h-screen col-span-full relative">
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-7xl mb-5">
          Badger Bash
        </div>
        <div className="mb-5">
          <Button asChild>
            <Link href="/join-lobby">Join Game Lobby</Link>
          </Button>
        </div>
        <div>
          <Button asChild>
            <Link href="/create-lobby">Create Game Lobby</Link>
          </Button>
        </div>
      </div>
      
      <div className="fixed bottom-4 right-4 z-50">
        <MusicPlayer />
      </div>
    </div>
  );
}