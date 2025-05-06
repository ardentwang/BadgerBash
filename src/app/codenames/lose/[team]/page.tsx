// import React from 'react';

// const LoseGame = () => {
//   return (
//     <div className="flex justify-center items-center h-screen">
//       <h1>Lose Game Page</h1>
//     </div>
//   );
// };

// export default LoseGame;







// "use client";

// import { useParams } from "next/navigation";
// import Link from "next/link";

// export default function LosePage() {
//   const params = useParams();
//   const team = params.team;

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-red-100 text-center">
//       <h1 className="text-4xl font-bold text-gray-800">Game Over</h1>
//       <p className="text-2xl mt-4 text-gray-600">
//         {team === "red" || team === "blue"
//           ? `${team.toUpperCase()} team lost! 💥`
//           : "Unknown team"}
//       </p>
//       <Link href="/codenames">
//         <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">
//           Back to Lobby
//         </button>
//       </Link>
//     </div>
//   );
// }


"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function LosePage() {
  const params = useParams();
  const team = params.team;

  const isRed = team === "red";
  const isBlue = team === "blue";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-100 text-center">
      <h1 className="text-4xl font-bold text-gray-800">Game Over</h1>

      {isRed && (
        <p className="text-2xl mt-4 text-red-600">
          Red team loses 😞 — better luck next time!
        </p>
      )}
      {isBlue && (
        <p className="text-2xl mt-4 text-blue-600">
          Blue team loses 😞 — better luck next time!
        </p>
      )}
      {!isRed && !isBlue && (
        <p className="text-2xl mt-4 text-gray-600">Unknown team result</p>
      )}


    </div>
  );
}