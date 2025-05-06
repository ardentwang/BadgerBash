import React from "react";
import { Button } from "@/components/ui/button";

interface WordData {
  word: string;
  color: string;
  revealed: boolean;
}

interface OperativeBoardProps {
  words: WordData[];
  team: string;
  onSelectWord: (word: WordData, index: number) => void;
  canInteract: boolean;
  onEndTurn?: () => void; // New prop for ending turn
}

const OperativeBoard: React.FC<OperativeBoardProps> = ({ 
  words, 
  team, 
  onSelectWord, 
  canInteract,
  onEndTurn
}) => {
  const handleTileClick = (index: number) => {
    // Enhanced logging for card clicks
    console.log(`🎯 Card clicked - Index: ${index}`);
    console.log(`🎮 Can interact? ${canInteract ? "Yes" : "No"}`);
    
    const clickedWord = words[index];
    console.log(`📝 Clicked word details - Word: "${clickedWord.word}", Color: ${clickedWord.color}, Revealed: ${clickedWord.revealed}`);
    
    // Don't allow clicking if it's not this player's turn
    if (!canInteract) {
      console.log("❌ Interaction blocked - Not player's turn");
      return;
    }
    
    // Don't allow clicking already revealed tiles
    if (clickedWord.revealed) {
      console.log("❌ Interaction blocked - Card already revealed");
      return;
    }
    
    console.log(`✅ Valid card click - Sending to parent component`);
    console.log(`📊 Full word object being sent:`, JSON.stringify(clickedWord, null, 2));
    
    // Call the parent component's handler
    onSelectWord(clickedWord, index);
  };

  // Handler for ending turn
  const handleEndTurn = () => {
    if (!canInteract) {
      console.log("❌ Cannot end turn - Not player's turn");
      return;
    }
    
    console.log("🔄 Player chose to end turn");
    
    if (onEndTurn) {
      onEndTurn();
    }
  };
  
  // Log the current board state on render
  console.log(`🎮 Rendering OperativeBoard - Team: ${team}`);
  console.log(`📊 Words count: ${words.length}`);
  console.log(`📊 Revealed words: ${words.filter(w => w.revealed).length}`);
  
  return (
    <div className="flex flex-col items-center">
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
            data-testid={`card-${index}-${tile.word}`} // Add data attribute for testing
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
      
      {/* Controls for operative's turn */}
      {canInteract && (
        <div className="mt-4 w-full max-w-md">
          <div className="p-3 bg-green-100 rounded-lg text-center mb-3">
            <p className="font-medium text-green-800">Your turn! Select a word card or end your turn.</p>
          </div>
          
          {/* End Turn Button */}
          <Button 
            onClick={handleEndTurn}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2"
          >
            End Turn
          </Button>
        </div>
      )}
    </div>
  );
};

export default OperativeBoard;