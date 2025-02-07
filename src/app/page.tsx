
import Link from 'next/link'
import { Button } from "@/components/ui/button"



export default function Home() {
  return (
    <div className="bg-background flex flex-col justify-center items-center min-h-screen col-span-full">
      <div className="text-7xl mb-5">
        Badger Bash
      </div>
      <div className="mb-5">
        <Button asChild>
          <Link href="/join-lobby">Join Game Lobby</Link>
        </Button>
      </div>
      <div>
        <Button>Create Game Lobby</Button>
      </div>
    </div>
  );
}