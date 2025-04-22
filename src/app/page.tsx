import Link from 'next/link'
import { Button } from "@/components/ui/button"
import NavBar from '@/components/navbar/navbar'
import CreateLobby from "@/components/ui/create-lobby"

export default function Home() {
  return (
    <div className="bg-background min-h-screen col-span-full relative">
      <NavBar />

      <div className="flex flex-col justify-center items-center min-h-screen">

        {/*Curved Title */}
        <svg viewBox="0 -40 600 200" className="w-full h-[250px] mb-2">
          <defs>
          <path id="curve" d="M 50,150 Q 300,20 550,150" />
          </defs>
          <text
        fill="currentColor"
        fontSize="64"
        fontWeight="800"
        textAnchor="middle"
        className="text-orange-300 drop-shadow-md"
        >
            <textPath href="#curve" startOffset="50%">
              Badger Bash
            </textPath>
          </text>
        </svg>

        {/*Animated Badger GIF */}
        <img 
          src="/animated/kawaiiBadgers3.gif" 
          alt="Cute badgers playing games" 
          className="w-[350px] mb-8" 
        />

        {/*Join Button */}
        <div className="mb-5">
          <Button className="w-full py-7 text-lg text-white bg-blue-800" size="lg" asChild>
            <Link href="/join-lobby">Join Game Lobby</Link>
          </Button>
        </div>

        {/*Create Lobby */}
        <div className='w-48' >
          <CreateLobby />
        </div>

      </div>
    </div>
  );
}
