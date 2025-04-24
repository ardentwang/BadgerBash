import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface GameLogProps {
  logs: string[];
}

const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when logs are updated
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card className="w-full max-w-3xl mt-6 p-4 bg-gray-200 text-black rounded-lg mx-auto">
      <h3 className="text-lg font-bold mb-2">Game Log</h3>
      <div 
        ref={logContainerRef}
        className="text-sm text-gray-700 max-h-40 overflow-y-auto p-2 bg-white rounded"
      >
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <p 
              key={index} 
              className={`py-1 ${index === 0 ? 'font-bold animate-pulse' : ''}`}
            >
              {log}
            </p>
          ))
        ) : (
          <p className="italic text-gray-500">Game started. Waiting for Spymaster to give a clue...</p>
        )}
      </div>
    </Card>
  );
};

export default GameLog;