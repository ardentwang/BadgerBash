"use client"

import { useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const avatarImages = [
  { file: 'party.png', label: 'Party' },
  { file: 'programmer.png', label: 'Programmer' },
  { file: 'student.png', label: 'Student' },
  { file: 'wizard.png', label: 'Wizard' },
  { file: 'ballet.png', label: 'Ballerina'},
  { file: 'ninja.png', label: 'Ninja-Badja'},
  { file: 'pirate.png', label: 'Pirate'},
  { file: 'gamer.png', label: 'Gamer'},
  { file: 'samurai.png', label: 'Samurai'},
  { file: 'queen.png', label: 'Queen'},
  { file: 'karate.png', label: 'Karate'},
  { file: 'buffbadger.png', label: 'Buff Badger'},
  { file: 'viking.png', label: 'Viking'},
  { file: 'princess.png', label: 'Princess'},
  { file: 'king.png', label: 'King'},
  { file: 'zookeeper.png', label: 'Zookeeper'},
  { file: 'astronaut.png', label: 'Astronaut'},
  { file: 'soundcloudrapper.png', label: 'Soundcloud Rapper'},
];

export default function AvatarSelector({
  currentAvatar,
  onSelect,
  onClose
}: {
  currentAvatar: string;
  onSelect: (avatarUrl: string) => void;
  onClose?: () => void;
}) {
  const { user, refreshUser } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside the component
  useEffect(() => {
    if (!onClose) return;
    
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node) && onClose) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleAvatarSelect = async (avatarUrl: string) => {
    if (!user) return;
    
    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });
      
      if (authError) {
        console.error('Error updating auth metadata:', authError);
        return;
      }
      
      // Update users table 
      const { error: dbError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
        
      if (dbError) {
        console.error('Error updating user profile:', dbError);
        return;
      }
      
      // Call the provided onSelect function
      onSelect(avatarUrl);
      
      // Refresh user context
      await refreshUser();
      
    } catch (error) {
      console.error('Error changing avatar:', error);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="max-h-96 overflow-y-auto p-4 rounded-lg"
    >
      <div className="grid grid-cols-2 gap-6 place-items-center">
        {avatarImages.map(({ file, label }) => {
          const isSelected = currentAvatar.includes(file);
          return (
            <div key={file} className="flex flex-col items-center mb-4">
              <div className="relative w-20 h-20">
                <Image
                  src={`/avatars/${file}`}
                  alt={label}
                  fill
                  sizes="5rem"
                  className={`rounded-full cursor-pointer border-4 transition object-cover ${
                    isSelected ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => handleAvatarSelect(`/avatars/${file}`)}
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