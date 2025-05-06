"use client";

import { useParams } from "next/navigation";

export default function WinPage() {
  const params = useParams();
  const team = params.team;

  const isRed = team === "red";
  const isBlue = team === "blue";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 text-center">
      <h1 className="text-4xl font-bold text-gray-800">🎉 Congratulations!</h1>

      {isRed && (
        <p className="text-2xl mt-4 text-red-600">
          Woohoo! You win — go Red Team! 🔥
        </p>
      )}
      {isBlue && (
        <p className="text-2xl mt-4 text-blue-600">
          Woohoo! You win — go Blue Team! 💙
        </p>
      )}
      {!isRed && !isBlue && (
        <p className="text-2xl mt-4 text-gray-600">Unknown team result</p>
      )}

      
    </div>
  );
}
