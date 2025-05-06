import NavBar from '@/components/navbar/navbar';
import GameDescription from '@/components/home/game-description';
import GameButtons from '@/components/home/game-buttons';
import ChangelogButton from '@/components/home/changelog-button';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* ═════ NAV ═════ */}
      
      <NavBar />



      {/* ═════ MAIN LANDING CONTENT ═════ */}
      <main className="flex flex-col items-center justify-center min-h-screen space-y-10 px-4 text-center">
        {/* — Headline + orbiting avatar — */}
        <div className="relative flex items-center justify-center">
          <h1 className="font-minecraft text-foreground text-6xl font-bold select-none">
            BadgerBash
          </h1>

          {/* Mini avatar that loops around the headline */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="orbiting w-20 h-20 rounded-full overflow-hidden drop-shadow-lg">
              <Image
                src="/avatars/party.png"        // later swap with user-selected avatar
                alt="Orbiting badger"
                width={80}
                height={80}
                priority
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Description + CTAs */}
        <GameDescription />
        <GameButtons />

        {/* Changelog trigger */}
        <ChangelogButton />
      </main>
    </div>
  );
}
