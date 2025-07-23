import React from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineLockClosed, HiOutlineArrowLeft } from "react-icons/hi";

export default function LeaderboardPlaceholder() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white px-4">
      <div className="max-w-xl w-full bg-gray-900/90 rounded-3xl shadow-2xl border border-blue-900/40 p-10 flex flex-col items-center relative">
        {/* Back Arrow */}
        <button
          className="absolute -top-30 -left-35 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800/80 to-gray-700/80 text-gray-300 hover:text-white rounded-xl border border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          onClick={() => navigate("/")}
        >
          <HiOutlineArrowLeft className="text-xl" />
          <span className="font-semibold">Back</span>
        </button>
        {!isLoggedIn ? (
          <>
            <HiOutlineLockClosed className="text-7xl text-blue-400 mb-4 animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 drop-shadow mb-4 text-center">
              Login Required
            </h1>
            <p className="text-lg text-gray-300 max-w-xl text-center mb-6">
              Please log in to view the leaderboard and see your ranking among other coders.
            </p>
            <button
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-md hover:shadow-xl transition-all duration-200 text-lg"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 drop-shadow mb-4 text-center">
              Leaderboard Coming Soon!
            </h1>
            <p className="text-lg text-gray-300 max-w-xl text-center mb-2">
              The leaderboard feature is launching soon. Compete, climb the ranks, and see how you stack up against others!
            </p>
            <span className="text-3xl mt-4 animate-bounce">🏆</span>
          </>
        )}
      </div>
    </div>
  );
} 