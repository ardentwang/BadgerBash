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
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="black" flood-opacity="0.6" />
          </filter>
          </defs>

          <text
        fill="currentColor"
    fontSize="80"
    fontWeight="800"
    textAnchor="middle"
    className="text-orange-300"
    filter="url(#shadow)"
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

        <img
          src="/animated/sparkle_background.gif"
          alt="sparkles"
          className="fixed top-0 left-0 w-full h-full object-cover opacity-30 pointer-events-none z-0"
        />

         {/*Join + create lobby */}
        {/* <div className="mb-5">
          <Button className="w-full py-7 text-lg text-white bg-blue-800" size="lg" asChild>
            <Link href="/join-lobby">Join Game Lobby</Link>
          </Button>
        </div>

        <div className='w-48' >
          <CreateLobby />
        </div> */}

<div className="flex justify-center gap-8 mb-10">
  {/* Join Button */}
  <Button
    className="w-32 h-32 flex items-center justify-center text-center text-lg font-bold text-white bg-gradient-to-b from-purple-200 to-violet-200 border-[3px] border-black rounded-full shadow-lg hover:shadow-[0_0_25px_rgw-32 h-32 flex items-center justify-center text-center text-lg font-bold text-gray-800 bg-gradient-to-b from-[#FADADD] to-[#FADADD] border-[3px] border-black rounded-full shadow-lg hover:shadow-[0_0_35px_rgba(255,105,180,1),0_0_15px_rgba(255,255,255,0.8)] active:translate-y-1 active:shadow-md transition-all duration-200 ease-in-out cursor-pointerba(255,105,180,0.8)] active:translate-y-1 active:shadow-md transition-all duration-200 ease-in-out cursor-pointer"
    asChild
  >
    <Link href="/join-lobby">
      Join<br /> Game
      </Link>
  </Button>

  {/* Create Button */}
  <div>
    <CreateLobby />
  </div>
</div>

    </div>
      </div>
  );
}
