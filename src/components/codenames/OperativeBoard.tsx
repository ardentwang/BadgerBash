import React, { useState } from "react";

interface OperativeBoardProps {
  words: Array<{ word: string; color: string }>;
  team: string;
  onSelectWord: (word: { word: string; color: string }, index: number) => void;
}

const OperativeBoard = ({ words, team, onSelectWord }: OperativeBoardProps) => {
  const [flippedTiles, setFlippedTiles] = useState(Array(words.length).fill(false));
  
  const handleTileClick = (index: number) => {
    if (flippedTiles[index]) return; // Don't flip already flipped tiles
    
    setFlippedTiles(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = true;
      return newFlipped;
    });
    
    onSelectWord(words[index], index);
  };
  
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-bold mb-4">Operative View - {team} Team</h2>
      
      {/* Operative game board - only shows colors after selection */}
      <div className="grid grid-cols-5 gap-2 bg-orange-900 p-4 rounded-lg">
        {words.map((tile, index) => (
          <div
            key={index}
            className="relative w-28 h-16 rounded-md font-bold cursor-pointer"
            onClick={() => handleTileClick(index)}
          >
            {flippedTiles[index] ? (
              <div 
                className={`w-full h-full flex items-center justify-center rounded-md
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
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-400 text-black">
                {tile.word}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OperativeBoard;