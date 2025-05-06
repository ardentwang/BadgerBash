"use client";

import { useParams, useRouter } from "next/navigation";

export default function WinPage() {
  const params = useParams();
  const router = useRouter();
  const team = params.team;

  const isRed = team === "red";
  const isBlue = team === "blue";

  const handleReturnHome = () => {
    router.push("/");
  };

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

      <button
        onClick={handleReturnHome}
        className="mt-8 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
      >
        Return to Home Screen
      </button>
    </div>
  );
}