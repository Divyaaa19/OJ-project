import React from "react";
import { HiOutlineClock, HiOutlineArrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function ContestsComingSoon() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white px-4">
      <div className="max-w-xl w-full bg-gray-900/90 rounded-3xl shadow-2xl border border-blue-900/40 p-10 flex flex-col items-center relative">
        {/* Back Arrow */}
        <button
          className="absolute -top-30 -left-40 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800/80 to-gray-700/80 text-gray-300 hover:text-white rounded-xl border border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          onClick={() => navigate("/")}
        >
          <HiOutlineArrowLeft className="text-xl" />
          <span className="font-semibold">Back</span>
        </button>
        <HiOutlineClock className="text-7xl text-blue-400 mb-4 animate-pulse" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 drop-shadow mb-4 text-center">
          Contests Coming Soon!
        </h1>
        <p className="text-lg text-gray-300 max-w-xl text-center mb-2">
          Our coding contests feature is launching soon.<br />
          Get ready to compete, climb the leaderboard, and win exciting rewards!
        </p>
        <span className="text-3xl mt-4 animate-bounce">🚀</span>
      </div>
    </div>
  );
} 