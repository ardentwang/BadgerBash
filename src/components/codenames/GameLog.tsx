import React from "react";
import { Card } from "@/components/ui/card";

interface GameLogProps {
  logs: string[];
}

const GameLog = ({ logs }: GameLogProps) => {
  return (
    <Card className="w-96 mt-6 p-4 bg-gray-200 text-black rounded-lg mx-auto">
      <h3 className="text-lg font-bold">Game Log</h3>
      <div className="text-sm text-gray-600 max-h-40 overflow-y-auto">
        {logs.length > 0 ? 
          logs.map((log, index) => <p key={index} className="py-1">{log}</p>) : 
          <p>Game started. Waiting for Spymaster to give a clue...</p>
        }
      </div>
    </Card>
  );
};

export default GameLog;