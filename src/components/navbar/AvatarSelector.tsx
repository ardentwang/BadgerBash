'use client';

import { useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export const avatarImages = [
  { file: 'party.png',        label: 'Party' },
  { file: 'programmer.png',   label: 'Programmer' },
  { file: 'student.png',      label: 'Student' },
  { file: 'wizard.png',       label: 'Wizard' },
  { file: 'ballet.png',       label: 'Ballerina' },
  { file: 'ninja.png',        label: 'Ninja-Badja' },
  { file: 'pirate.png',       label: 'Pirate' },
  { file: 'gamer.png',        label: 'Gamer' },
  { file: 'samurai.png',      label: 'Samurai' },
  { file: 'queen.png',        label: 'Queen' },
  { file: 'karate.png',       label: 'Karate' },
  { file: 'buffbadger.png',   label: 'Buff Badger' },
  { file: 'viking.png',       label: 'Viking' },
  { file: 'princess.png',     label: 'Princess' },
  { file: 'king.png',         label: 'King' },
  { file: 'zookeeper.png',    label: 'Zookeeper' },
  { file: 'astronaut.png',    label: 'Astronaut' },
  { file: 'soundcloudrapper.png', label: 'Soundcloud Rapper' },
] as const;

/* push the chosen sprite into CSS so the backdrop updates */
const setPolkaDotSprite = (url: string) =>
  document.documentElement.style.setProperty('--dot-url', `url("${url}")`);

interface Props {
  currentAvatar: string;
  onSelect: (url: string) => void;
  onClose?: () => void;
}

export default function AvatarSelector({ currentAvatar, onSelect, onClose }: Props) {
  const { user, refreshUser } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  /* click-outside to close */
  useEffect(() => {
    if (!onClose) return;
    const handler = (e: MouseEvent) =>
      containerRef.current && !containerRef.current.contains(e.target as Node) && onClose();
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  /* make sure backdrop matches current avatar when component mounts */
  useEffect(() => {
    if (currentAvatar) setPolkaDotSprite(currentAvatar);
  }, [currentAvatar]);

  const handleAvatarSelect = async (avatarUrl: string) => {
    if (!user) return;

    /* update Supabase auth + profile */
    const { error: authErr } = await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
    if (authErr) return console.error(authErr);
    const { error: dbErr } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id);
    if (dbErr) return console.error(dbErr);

    /* update UI + background */
    onSelect(avatarUrl);
    setPolkaDotSprite(avatarUrl);

    /* refresh context */
    await refreshUser();
  };

  return (
    <div ref={containerRef} className="max-h-96 overflow-y-auto p-4 rounded-lg">
      <div className="grid grid-cols-2 gap-6 place-items-center">
        {avatarImages.map(({ file, label }) => {
          const url = `/avatars/${file}`;
          const active = currentAvatar.includes(file);
          return (
            <div key={file} className="flex flex-col items-center mb-4">
              <div className="relative w-20 h-20">
                <Image
                  src={url}
                  alt={label}
                  fill
                  sizes="5rem"
                  className={`rounded-full cursor-pointer border-4 transition object-cover ${
                    active ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => handleAvatarSelect(url)}
                />
              </div>
              <span className="mt-1 text-sm font-medium text-gray-700">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
