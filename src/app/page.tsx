import NavBar from '@/components/navbar/navbar';
import GameDescription from '@/components/home/game-description';
import GameButtons from '@/components/home/game-buttons';
import ChangelogButton from '@/components/home/changelog-button';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      <NavBar />

      <main className="flex flex-col items-center justify-center min-h-screen space-y-10 px-4 text-center">

          <h1 className="text-foreground text-6xl font-bold select-none">
            BadgerBash
          </h1>

        <GameDescription />
        <GameButtons />
        
        <ChangelogButton />
      </main>
    </div>
  );
}