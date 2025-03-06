// import React from "react";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/router";

// const LooseGame = () => {
//   const router = useRouter();

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-800 text-white p-6">
//       <h2 className="text-center text-3xl font-bold mb-6">Game Over!</h2>
//       <p className="text-center text-xl mb-4">You flipped the black tile. You lose!</p>
//       <Button
//         className="mx-auto bg-yellow-400 text-black font-bold mt-6"
//         onClick={() => router.push("/")}
//       >
//         Go Back to Home
//       </Button>
//     </div>
//   );
// };

// export default LooseGame;

import React from 'react';

const LooseGame = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <h1>Loose Game Page</h1>
    </div>
  );
};

export default LooseGame;