import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SpymasterBoardProps {
  words: Array<{ word: string; color: string }>;
  team: string;
  onGiveClue: (clue: string) => void;
}

const SpymasterBoard = ({ words, team, onGiveClue }: SpymasterBoardProps) => {
  const [clue, setClue] = useState("");
  
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-bold mb-4">Spymaster View - {team} Team</h2>
      
      {/* Spymaster game board - always shows colors */}
      <div className="grid grid-cols-5 gap-2 bg-orange-900 p-4 rounded-lg mb-4">
        {words.map((tile, index) => (
          <div
            key={index}
            className={`w-28 h-16 rounded-md font-bold flex items-center justify-center 
            ${
              tile.color === "blue" 
                ? "bg-blue-500 text-white" 
                : tile.color === "red" 
                  ? "bg-red-500 text-white" 
                  : tile.color === "black" 
                    ? "bg-black text-white" 
                    : "bg-gray-200 text-black"
            }`}
          >
            {tile.word}
          </div>
        ))}
      </div>
      
      {/* Clue input */}
      <div className="w-full flex space-x-2 mt-4">
        <Input
          type="text"
          value={clue}
          onChange={(e) => setClue(e.target.value)}
          placeholder="Enter your clue"
          className="flex-grow"
        />
        <Button 
          onClick={() => {
            if (clue.trim()) {
              onGiveClue(clue);
              setClue("");
            }
          }}
          className="bg-yellow-400 text-black font-bold"
        >
          Give Clue
        </Button>
      </div>
    </div>
  );
};

export default SpymasterBoard;