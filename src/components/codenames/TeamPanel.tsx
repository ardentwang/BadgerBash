import React from "react";
import { Card } from "@/components/ui/card";

interface TeamPanelProps {
  color: "red" | "blue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  players: Array<any>;
  userId: string;
  score?: number;
}

const TeamPanel: React.FC<TeamPanelProps> = ({ color, players, userId, score }) => {
  const bgColor = color === "red" ? "bg-red-700" : "bg-blue-700";
  const rolePrefix = `${color}_`;
  
  return (
    <Card className={`w-56 p-4 ${bgColor} text-white rounded-lg`}>
      <h3 className="text-xl font-bold">{color === "red" ? "Red" : "Blue"} Team {score !== undefined && `(${score})`}</h3>
      <div className="mt-2">
        <p className="font-bold mt-2">Operatives:</p>
        {players
          .filter(player => player.role === `${rolePrefix}operative`)
          .map((player, index) => (
            <div key={index} className="text-sm">
              {player.user_id === userId ? 'You' : player.user_id.substring(0, 8)}
            </div>
          ))}
        {players.filter(player => player.role === `${rolePrefix}operative`).length === 0 && 
          <div className="text-sm">-</div>
        }
        
        <p className="font-bold mt-2">Spymaster:</p>
        {players
          .filter(player => player.role === `${rolePrefix}spymaster`)
          .map((player, index) => (
            <div key={index} className="text-sm">
              {player.user_id === userId ? 'You' : player.user_id.substring(0, 8)}
            </div>
          ))}
        {players.filter(player => player.role === `${rolePrefix}spymaster`).length === 0 && 
          <div className="text-sm">-</div>
        }
      </div>
    </Card>
  );
};

export default TeamPanel;