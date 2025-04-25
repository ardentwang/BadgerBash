// app/page.js - Server Component
import NavBar from '@/components/navbar/navbar'
import GameDescription from '@/components/home/game-description'
import GameButtons from '@/components/home/game-buttons'

export default function Home() {
  return (
    <div className="bg-background min-h-screen col-span-full relative">
      <NavBar />

      <div className="flex flex-col justify-center items-center min-h-screen">
        {/* Simple Title - Server Rendered */}
        <h1 className="text-foreground text-6xl font-bold mb-4">
          BadgerBash
        </h1>

        {/* Client Component for animated description */}
        <GameDescription />

        {/* Client Component for buttons */}
        <GameButtons />
        
        {/* Static Image - Server Rendered */}
        <img 
          src="/animated/kawaiiBadgers3.gif" 
          alt="Cute badgers playing games" 
          className="w-[200px] mt-8 rounded-lg" 
        />
      </div>
    </div>
  );
}