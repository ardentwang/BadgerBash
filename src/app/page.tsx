import Link from 'next/link'
import { Button } from "@/components/ui/button"
import NavBar from '@/components/navbar/navbar'
import CreateLobby from "@/components/ui/create-lobby"

export default function Home() {
  return (
    <div className="bg-background min-h-screen col-span-full relative">
      <NavBar/>
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-7xl mb-5">
          Badger Bash
        </div>
        <div className="mb-5 w-48">
          <Button className="w-full text-md" size="lg" asChild>
            <Link href="/join-lobby">Join Game Lobby</Link>
          </Button>
        </div>
        <div className='w-48'>
          <CreateLobby />
        </div>
      </div>
    </div>
  );
}