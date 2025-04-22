import React from "react";

interface OperativeBoardProps {
  words: Array<{ word: string; color: string; revealed: boolean }>;
  team: string;
  onSelectWord: (word: { word: string; color: string; revealed: boolean }, index: number) => void;
  canInteract: boolean;
}

const OperativeBoard = ({ words, team, onSelectWord, canInteract }: OperativeBoardProps) => {
  const handleTileClick = (index: number) => {
    // Don't allow clicking if it's not this player's turn
    if (!canInteract) return;
    
    // Don't allow clicking already revealed tiles
    if (words[index].revealed) return;
    
    // Call the parent component's handler
    onSelectWord(words[index], index);
  };
  
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-bold mb-4">Operative View - {team} Team</h2>
      
      {!canInteract && (
        <div className="mb-4 p-3 bg-yellow-100 rounded-lg text-center">
          <p className="font-medium">Waiting for your turn to select a word</p>
        </div>
      )}
      
      {/* Operative game board - only shows colors after selection */}
      <div className="grid grid-cols-5 gap-2 bg-orange-900 p-4 rounded-lg">
        {words.map((tile, index) => (
          <div
            key={index}
            className={`relative w-28 h-20 rounded-md font-bold ${canInteract && !tile.revealed ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={() => handleTileClick(index)}
          >
            {tile.revealed ? (
              <div 
                className={`w-full h-full flex items-center justify-center rounded-md
                ${
                  tile.color === "blue" 
                    ? "bg-blue-500 text-white" 
                    : tile.color === "red" 
                      ? "bg-red-500 text-white" 
                      : tile.color === "black" 
                        ? "bg-black text-white" 
                        : "bg-yellow-200 text-black"
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
      
      {canInteract && (
        <div className="mt-4 p-2 bg-green-100 rounded-lg text-center">
          <p className="font-medium text-green-800">Your turn! Select a word card.</p>
        </div>
      )}
    </div>
  );
};

export default OperativeBoard;