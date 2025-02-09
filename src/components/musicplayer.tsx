import React, { useState, useRef } from 'react';
import { PlayCircle, PauseCircle, StopCircle } from 'lucide-react';
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const MusicPlayer = () => {
  const [currentSong, setCurrentSong] = useState<{ id: number; title: string; path: string; } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const songs = [
    { id: 1, title: 'Song 1', path: '/nightmare-pop.mp3' },
    { id: 2, title: 'Song 2', path: '/seaside-drift.mp3' },
  ];

  const playSong = (song: { id: number; title: string; path: string; }) => {
    if (currentSong?.id === song.id) {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
      } else if (audioRef.current) {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setCurrentSong(song);
      setIsPlaying(true);
      
      const audio = new Audio(song.path);
      audioRef.current = audio;
      audio.play();
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentSong(null);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Choose Background Music</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {songs.map((song) => (
            <button
              key={song.id}
              onClick={() => playSong(song)}
              className={buttonVariants({
                variant: "link",
                className: "w-full justify-start"
              })}
            >
              {currentSong?.id === song.id ? (
                isPlaying ? (
                  <PauseCircle className="text-primary" />
                ) : (
                  <PlayCircle className="text-primary" />
                )
              ) : (
                <PlayCircle className="text-muted-foreground" />
              )}
              {song.title}
            </button>
          ))}
        </div>
        
        {currentSong && (
          <div className="flex justify-center">
            <button
              onClick={stopPlayback}
              className={buttonVariants({
                variant: "link",
                size: "sm"
              })}
            >
              <StopCircle />
              Stop Music
            </button>
          </div>
        )}
        
        {currentSong && (
          <p className="text-center text-sm text-muted-foreground">
            Now Playing: {currentSong.title}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MusicPlayer;