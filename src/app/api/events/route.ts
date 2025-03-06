import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Debugging: Log request body
    console.log("Received event request:", body);

    const { event, gameId, playerId, details } = body;

    // Validate request
    if (!event || !gameId || !playerId) {
      console.error("Missing required fields:", { event, gameId, playerId });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert into Supabase
    const { error } = await supabase
      .from("game_events")
      .insert([{ event, game_id: gameId, player_id: playerId, details }]);

    if (error) {
      console.error("Error inserting event into Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in event logging:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
