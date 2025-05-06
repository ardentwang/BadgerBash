"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

interface SpymasterClueFormProps {
  lobbyCode: number;
  team: string;
  onClueSubmit: (clue: string, clueNumber: number) => void;
}

const SpymasterClueForm: React.FC<SpymasterClueFormProps> = ({
  lobbyCode,
  team,
  onClueSubmit
}) => {
  const [clue, setClue] = useState('');
  const [clueNumber, setClueNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      
      // Upsert to Supabase
      const { data, error } = await supabase
        .from('codenames_games')
        .upsert({
          lobby_code: lobbyCode,
          clue: clue,
          clue_number: parseInt(clueNumber),
          latest_move: `${team} spymaster gave clue: ${clue} (${clueNumber})`
        }, {
          onConflict: 'lobby_code'
        });
      
      if (error) {
        console.error('❌ Error submitting clue:', error);
        setError("Failed to submit clue. Please try again.");
        return;
      }
      
      console.log('✅ Clue submitted successfully:', data);
      
      // Call the callback with the new clue
      onClueSubmit(clue, parseInt(clueNumber));
      
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
  
  return (
    <Card className="w-full max-w-md bg-white">
      <CardHeader className={`bg-${team}-600 text-white`}>
        <CardTitle>Give a Clue</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="clue">Enter your clue:</Label>
            <Input
              id="clue"
              value={clue}
              onChange={(e) => setClue(e.target.value)}
              placeholder="Type your clue here"
              className="w-full"
              maxLength={30}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clueNumber">Select number of words:</Label>
            <Select
              value={clueNumber}
              onValueChange={setClueNumber}
            >
              <SelectTrigger id="clueNumber" className="w-full">
                <SelectValue placeholder="Select a number" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className={`w-full bg-${team}-500 hover:bg-${team}-600`} 
            disabled={isSubmitting || !clue.trim() || !clueNumber}
          >
            {isSubmitting ? 'Submitting...' : 'Give Clue'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SpymasterClueForm;