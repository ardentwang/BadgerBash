"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlayerCardProps {
  userId: string;
  username: string;
  avatarUrl: string;
  isCurrentUser: boolean;
}

const PlayerCard = ({ username, avatarUrl, isCurrentUser }: PlayerCardProps) => {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name || name === 'Unknown User') return 'U';
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="flex items-center space-x-2 p-2 rounded-md bg-white bg-opacity-20 mb-2">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={avatarUrl} alt={`${username}'s avatar`} />
        <AvatarFallback>{getInitials(username)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 truncate">
        <p className="text-sm font-medium">
          {username || 'Unknown User'} 
          {isCurrentUser && <span className="ml-1 font-bold">(You)</span>}
        </p>
      </div>
    </div>
  );
};

export default PlayerCard;