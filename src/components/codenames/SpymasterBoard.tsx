"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WordWithColor {
  word: string;
  color: string;
  revealed: boolean;
}

interface SpymasterBoardProps {
  words: WordWithColor[] | null;
  team: string;
  onGiveClue: (clue: string, clueNumber: number) => void;
  canInteract: boolean;
}

const SpymasterBoard: React.FC<SpymasterBoardProps> = ({
  words,
  team,
  onGiveClue,
  canInteract
}) => {
  const [clue, setClue] = useState('');
  const [clueNumber, setClueNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitClue = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if it's the player's turn
    if (!canInteract) {
      setError("It's not your turn to give a clue");
      return;
    }
    
    // Validate input
    if (!clue.trim()) {
      setError("Please enter a clue");
      return;
    }
    
    if (!clueNumber) {
      setError("Please select a number");
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      console.log(`🎲 Submitting clue: "${clue}" with number: ${clueNumber} for team: ${team}`);
      
      // Call the parent component callback to handle the clue submission
      onGiveClue(clue, parseInt(clueNumber));
      
      // Reset form
      setClue('');
      setClueNumber('');
      
    } catch (err) {
      console.error('❌ Exception while submitting clue:', err);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-600 text-white text-outline';
      case 'blue': return 'bg-blue-600 text-white text-outline';
      case 'black': return 'bg-black text-white text-outline';
      case 'yellow': return 'bg-gray-300 text-outline';
      default: return 'bg-gray-200';
    }
  };

  if (!words) {
    return (
      <div className="text-center p-4">
        <p>Loading words...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-4xl">
      {/* Word Grid - Main Focus */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {words.map((word, index) => (
          <div 
            key={index}
            className={`${getColorClass(word.color)} p-4 h-20 relative flex items-center justify-center rounded shadow text-center font-semibold`}
          >
            {word.word}
            {/* Modified revealed indicator - small checkmark in corner instead of overlay */}
            {word.revealed && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Compact Clue Form - At Bottom */}
      <div className="mt-4 p-3 bg-white rounded-lg shadow-md">
        {error && (
          <div className="text-red-500 text-sm p-2 mb-2 bg-red-50 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        {!canInteract && (
          <div className="bg-fuchsia-300 p-2 mb-2 rounded-md text-center">
            <p className="font-medium text-outline">Waiting for your turn to give a clue</p>
          </div>
        )}
        
        <form onSubmit={handleSubmitClue} className="flex items-end space-x-2">
          <div className="flex-grow">
            <label htmlFor="clue" className="block text-sm font-medium text-gray-700 mb-1">
              Word Clue:
            </label>
            <Input
              id="clue"
              value={clue}
              onChange={(e) => setClue(e.target.value)}
              placeholder="Enter clue"
              className="w-full text-gray-800 bg-white"
              maxLength={30}
              style={{ color: '#1a202c' }}
              disabled={!canInteract}
            />
          </div>
          
          <div className="w-32">
            <label htmlFor="clueNumber" className="block text-sm font-medium text-gray-700 mb-1">
              # of words:
            </label>
            <Select 
              value={clueNumber} 
              onValueChange={setClueNumber}
              disabled={!canInteract}
            >
              <SelectTrigger id="clueNumber" className="text-gray-800 bg-white" style={{ color: '#1a202c' }}>
                <SelectValue placeholder="Select" className="text-gray-800" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()} className="text-gray-800">
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className={`bg-${team}-500 hover:bg-${team}-600 text-white`}
            disabled={isSubmitting || !clue.trim() || !clueNumber || !canInteract}
          >
            {isSubmitting ? 'Sending...' : 'Give Clue'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SpymasterBoard;