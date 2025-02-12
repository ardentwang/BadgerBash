"use client"

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

  return(
    <div>
        "Hello World"
    </div>
  )
}

export default MusicPlayer;