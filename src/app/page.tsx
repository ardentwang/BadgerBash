import NavBar from '@/components/navbar/navbar';
import GameDescription from '@/components/home/game-description';
import GameButtons from '@/components/home/game-buttons';
import ChangelogButton from '@/components/home/changelog-button';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* ── NAVIGATION ─────────────────────────────────── */}
      <NavBar />

      {/* ── MAIN LANDING CONTENT ───────────────────────── */}
      <main className="flex flex-col items-center justify-center min-h-screen space-y-10 px-4 text-center">
        {/* Headline with optional orbiting avatar */}

          <h1 className="text-foreground text-6xl font-bold select-none">
            BadgerBash
          </h1>

          

        {/* Description and call-to-action buttons */}
        <GameDescription />
        <GameButtons />

        {/* Changelog modal trigger */}
        <ChangelogButton />
      </main>
    </div>
  );
}