"use client"

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

const avatarImages = [
  { file: 'party.png', label: 'Party' },
  { file: 'programmer.png', label: 'Programmer' },
  { file: 'student.png', label: 'Student' },
  { file: 'wizard.png', label: 'Wizard' },
];

export default function AvatarSelector({
  currentAvatar,
  onSelect,
}: {
  currentAvatar: string;
  onSelect: (avatarUrl: string) => void;
}) {
  const { user, refreshUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAvatarSelect = async (avatarUrl: string) => {
    if (!user || isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      // Update user metadata in auth
      await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl
        }
      });
      
      // Update the user profile in the users table
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating avatar in database:', error);
        return;
      }
      
      // Call the onSelect callback to update UI
      onSelect(avatarUrl);
      
      // Refresh the user context to get updated metadata
      await refreshUser();
      
    } catch (error) {
      console.error('Error updating avatar:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6 place-items-center">
      {avatarImages.map(({ file, label }) => {
        const isSelected = currentAvatar.includes(file);
        return (
          <div key={file} className="flex flex-col items-center">
            <img
              src={`/avatars/${file}`}
              alt={label}
              className={`w-20 h-20 rounded-full cursor-pointer border-4 transition ${
                isUpdating ? 'opacity-50' : ''
              } ${
                isSelected ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => handleAvatarSelect(`/avatars/${file}`)}
            />
            <span className="mt-1 text-sm font-medium text-gray-700">{label}</span>
          </div>
        );
      })}
    </div>
  );
}