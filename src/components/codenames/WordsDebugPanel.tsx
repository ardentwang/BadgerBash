import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WordData {
  word: string;
  color: string;
  revealed: boolean;
}

interface WordsDebugPanelProps {
  words: WordData[];
  playerRole: string;
}

const WordsDebugPanel: React.FC<WordsDebugPanelProps> = ({ words, playerRole }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sort words first by color, then by word
  const sortedWords = [...words].sort((a, b) => {
    if (a.color !== b.color) {
      // Red first, then blue, then yellow, then black
      const colorOrder = { red: 0, blue: 1, yellow: 2, black: 3 };
      return colorOrder[a.color as keyof typeof colorOrder] - colorOrder[b.color as keyof typeof colorOrder];
    }
    return a.word.localeCompare(b.word);
  });

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-200 text-red-900';
      case 'blue': return 'bg-blue-200 text-blue-900';
      case 'yellow': return 'bg-yellow-200 text-yellow-900';
      case 'black': return 'bg-gray-800 text-white';
      default: return 'bg-gray-200';
    }
  };

  return (
    <Card className="mt-4 p-3 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-bold">Debug Panel ({playerRole})</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Hide Debug" : "Show Debug"}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="text-xs overflow-auto" style={{ maxHeight: '200px' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-1 text-left">Word</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Color</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Revealed</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Index</th>
              </tr>
            </thead>
            <tbody>
              {sortedWords.map((word, index) => (
                <tr key={index} className={`${getColorClass(word.color)} ${word.revealed ? 'opacity-70' : ''}`}>
                  <td className="border border-gray-300 px-2 py-1">{word.word}</td>
                  <td className="border border-gray-300 px-2 py-1">{word.color}</td>
                  <td className="border border-gray-300 px-2 py-1">{word.revealed ? "Yes" : "No"}</td>
                  <td className="border border-gray-300 px-2 py-1">{words.findIndex(w => w.word === word.word)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2">
            <p>Total words: {words.length}</p>
            <p>Red words: {words.filter(w => w.color === 'red').length}</p>
            <p>Blue words: {words.filter(w => w.color === 'blue').length}</p>
            <p>Yellow words: {words.filter(w => w.color === 'yellow').length}</p>
            <p>Black words: {words.filter(w => w.color === 'black').length}</p>
            <p>Revealed words: {words.filter(w => w.revealed).length}</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default WordsDebugPanel;