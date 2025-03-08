import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type PlayerRole = "spymaster" | "operative";
export type Team = "red" | "blue";

export interface WordCard {
  word: string;
  color: Team | "neutral" | "black";
  revealed: boolean;
}

export interface GameState {
  id: string;
  board: WordCard[];
  turn: Team;
  clue: { word: string; count: number } | null;
  players: { id: string; name: string; role: PlayerRole; team: Team }[];
  winner: Team | null;
}

/**
 * Logs a player's move in the game_events table.
 */
export const logMove = async (gameId: string, playerId: string, word: string, wordIndex: number) => {
    const { data, error } = await supabase.from("game_events").insert([
      {
        game_id: gameId,
        player_id: playerId,
        word,
        word_index: wordIndex,
        timestamp: new Date().toISOString(),
      },
    ]).select(); // Use .select() to return inserted data
  
    if (error) {
      console.error("Error logging move:", error);
    } else {
      console.log("Move logged successfully:", data);
    }
  };
  

/**
 * Handles a player's word selection.
 */
export const selectWord = async (gameId: string, playerId: string, wordIndex: number) => {
  const { data: gameData, error } = await supabase.from("games").select("*").eq("id", gameId).single();
  if (error || !gameData) {
    console.error("Game not found:", error);
    return;
  }

  const game: GameState = gameData;
  const wordCard = game.board[wordIndex];

  if (wordCard.revealed) {
    console.warn("Word already revealed.");
    return;
  }

  // Reveal the word
  wordCard.revealed = true;

  // Log the move
  await logMove(gameId, playerId, wordCard.word, wordIndex);

  // Update the game state in Supabase
  await supabase.from("games").update({ board: game.board }).eq("id", gameId);
};
