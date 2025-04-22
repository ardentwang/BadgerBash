import React from "react";
import { Card } from "@/components/ui/card";

interface TeamPanelProps {
  color: "red" | "blue";
  players: Array<any>;
  userId: string;
  score?: number;
}

const TeamPanel = ({ color, players, userId, score }: TeamPanelProps) => {
  const bgColor = color === "red" ? "bg-red-700" : "bg-blue-700";
  
  return (
    <Card className={`w-56 p-4 ${bgColor} text-white rounded-lg`}>
      <h3 className="text-xl font-bold">{color === "red" ? "Red" : "Blue"} Team {score !== undefined && `(${score})`}</h3>
      <div className="mt-2">
        <p className="font-bold mt-2">Operatives:</p>
        {players
          .filter(player => player.team === color && player.role === 'operative')
          .map((player, index) => (
            <div key={index} className="text-sm">
              {player.user_id === userId ? 'You' : player.user_id.substring(0, 8)}
            </div>
          ))}
        {players.filter(player => player.team === color && player.role === 'operative').length === 0 && 
          <div className="text-sm">-</div>
        }
        
        <p className="font-bold mt-2">Spymaster:</p>
        {players
          .filter(player => player.team === color && player.role === 'spymaster')
          .map((player, index) => (
            <div key={index} className="text-sm">
              {player.user_id === userId ? 'You' : player.user_id.substring(0, 8)}
            </div>
          ))}
        {players.filter(player => player.team === color && player.role === 'spymaster').length === 0 && 
          <div className="text-sm">-</div>
        }
      </div>
    </Card>
  );
};

export default TeamPanel;