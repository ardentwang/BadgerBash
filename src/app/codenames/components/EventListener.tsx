"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const EventListener = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const subscription = supabase
      .channel("game_events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "game_events" },
        (payload) => {
          console.log("New event:", payload.new);
          setEvents((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg">
      <h3 className="text-lg font-bold">Game Events</h3>
      <ul className="mt-2 space-y-1">
        {events.map((event, index) => (
          <li key={index} className="text-sm">
            {event.event} - {JSON.stringify(event.details)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventListener;
