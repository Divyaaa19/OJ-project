import React from "react";
import { motion } from "framer-motion";
import { Rocket, Globe, StarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function Home() {
    const navigate = useNavigate(); 
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white overflow-hidden relative">
      {/* Star background animation */}
      <div className="absolute inset-0 -z-10 animate-pulse opacity-20">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 py-16 flex flex-col items-center text-center">
        <motion.h1 
          className="text-5xl md:text-6xl font-extrabold mb-4 mt-30"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Welcome to <span className="text-blue-500">CodeSpace</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-300 max-w-xl mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          Explore the galaxy of coding problems. Practice. Compete. Launch your career into orbit.
        </motion.p>

        <motion.div
          className="flex gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <button onClick={() => navigate('/register')} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold">
            🚀 Start Solving
          </button>
          <button onClick={() => navigate('/login')} className="px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition font-semibold">
            👨‍🚀 Login
          </button>
        </motion.div>

        <motion.div
          className="mt-16 flex justify-center gap-12 text-blue-400"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <Rocket className="w-10 h-10 animate-bounce" />
          <Globe className="w-10 h-10 animate-spin-slow" />
          <StarIcon className="w-10 h-10 animate-pulse" />
        </motion.div>
      </div>

      <div className="absolute bottom-0 w-full text-center text-sm text-gray-600 pb-4">
        Made with 💙 in the Milky Way
      </div>
    </div>
  );
}
