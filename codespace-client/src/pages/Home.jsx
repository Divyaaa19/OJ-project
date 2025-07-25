import React from "react";
import { motion } from "framer-motion";
import { Rocket, Globe, StarIcon, UserCircle, Trophy, ListChecks, LayoutDashboard, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ContestsComingSoon from "./ContestsComingSoon";


export default function Home() {
    const navigate = useNavigate(); 
    // Simulate user/admin state (replace with real auth logic)
    const isAdmin = false; // Set true to show Admin Panel card
    const userName = null; // Set to a string to show greeting
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white overflow-hidden relative">
            {/* Background overlays and stars */}
            <div className="absolute inset-0 -z-20 bg-gradient-to-b from-gray-900 via-indigo-900 to-black overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-gradient-radial from-blue-200/40 via-pink-200/30 to-transparent opacity-80 pointer-events-none" />
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

            {/* Header Navigation */}
            <header className="w-full px-4 py-5 flex items-center justify-between bg-gradient-to-r from-gray-900/80 via-blue-900/70 to-gray-800/80 shadow-lg border-b border-blue-900/30 z-10 relative">
                {/* Mobile Hamburger - now on the left */}
                <button className="md:hidden p-2 mr-2" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-blue-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}> 
                    <Rocket className="w-8 h-8 text-blue-400" />
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text tracking-tight">CodeSpace</span>
                </div>
                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-8 text-lg font-semibold">
                    <button onClick={() => navigate("/problems")} className="hover:text-blue-400 transition">Problems</button>
                    <button onClick={() => navigate("/contests")} className="hover:text-purple-400 transition">Contests</button>
                    <button onClick={() => navigate("/leaderboard")} className="hover:text-yellow-400 transition">Leaderboard</button>
                    {isAdmin && <button onClick={() => navigate("/admin-dashboard")} className="hover:text-pink-400 transition">Admin</button>}
                </nav>
                <div>
                    {/* Login/Profile button */}
                    <button onClick={() => navigate(userName ? "/profile" : "/login")} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/80 hover:bg-blue-700 transition font-semibold border border-blue-900/30">
                        <UserCircle className="w-6 h-6" />
                        {userName ? userName : "Login"}
                    </button>
                </div>
                {/* Mobile Sidebar Menu */}
                {mobileMenuOpen && (
                    <>
                        {/* Overlay */}
                        <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu overlay"></div>
                        {/* Sidebar */}
                        <aside className="fixed top-0 left-0 h-full w-64 max-w-[80vw] bg-gradient-to-b from-gray-900 via-blue-900 to-gray-800 shadow-2xl z-50 flex flex-col p-8 gap-6 animate-slideIn overflow-y-auto">
                            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl focus:outline-none" aria-label="Close menu">&times;</button>
                            <button tabIndex={0} onClick={() => { setMobileMenuOpen(false); setTimeout(() => navigate("/problems"), 100); }} className="text-left w-full py-3 px-2 rounded-lg text-lg font-bold text-blue-300 hover:bg-blue-800/30 focus:bg-blue-800/40 transition focus:outline-none">Problems</button>
                            <button tabIndex={0} onClick={() => { setMobileMenuOpen(false); setTimeout(() => navigate("/contests"), 100); }} className="text-left w-full py-3 px-2 rounded-lg text-lg font-bold text-purple-300 hover:bg-purple-800/30 focus:bg-purple-800/40 transition focus:outline-none">Contests</button>
                            <button tabIndex={0} onClick={() => { setMobileMenuOpen(false); setTimeout(() => navigate("/leaderboard"), 100); }} className="text-left w-full py-3 px-2 rounded-lg text-lg font-bold text-yellow-300 hover:bg-yellow-800/30 focus:bg-yellow-800/40 transition focus:outline-none">Leaderboard</button>
                            {isAdmin && <button tabIndex={0} onClick={() => { setMobileMenuOpen(false); setTimeout(() => navigate("/admin-dashboard"), 100); }} className="text-left w-full py-3 px-2 rounded-lg text-lg font-bold text-pink-300 hover:bg-pink-800/30 focus:bg-pink-800/40 transition focus:outline-none">Admin</button>}
                        </aside>
                    </>
                )}
            </header>

            {/* Dashboard Panel */}
            <main className="container mx-auto px-6 py-20 flex flex-col items-center text-center relative z-10">
                <motion.div 
                    className="mb-10"
                    initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
        >
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 text-transparent bg-clip-text drop-shadow-lg">
                        {userName ? `Welcome back, ${userName}!` : "Welcome to CodeSpace"}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                        Your professional coding dashboard. Practice, compete, and track your progress in style.
                    </p>
                </motion.div>

        <motion.div
                    className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-gray-900/80 rounded-3xl shadow-2xl border border-blue-900/30 p-10 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
        >
                    {/* Problems Card */}
                    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-900/60 to-gray-800/60 rounded-2xl shadow-lg hover:scale-105 transition cursor-pointer border border-blue-700/30" onClick={() => navigate("/problems")}> 
                        <ListChecks className="w-10 h-10 text-blue-400 mb-2" />
                        <span className="text-xl font-bold mb-1">Solve Problems</span>
                        <span className="text-gray-400 text-sm">Sharpen your skills with curated coding challenges.</span>
                    </div>
                    {/* Contests Card */}
                    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-900/60 to-gray-800/60 rounded-2xl shadow-lg hover:scale-105 transition cursor-pointer border border-purple-700/30" onClick={() => navigate("/contests")}> 
                        <Trophy className="w-10 h-10 text-purple-400 mb-2" />
                        <span className="text-xl font-bold mb-1">View Contests</span>
                        <span className="text-gray-400 text-sm">Compete in live and upcoming coding contests.</span>
                    </div>
                    {/* Leaderboard Card */}
                    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-yellow-900/60 to-gray-800/60 rounded-2xl shadow-lg hover:scale-105 transition cursor-pointer border border-yellow-700/30" onClick={() => navigate("/leaderboard")}> 
                        <StarIcon className="w-10 h-10 text-yellow-400 mb-2" />
                        <span className="text-xl font-bold mb-1">Leaderboard</span>
                        <span className="text-gray-400 text-sm">See top performers and your own ranking.</span>
                    </div>
                    {/* Admin Panel Card (only if admin) */}
                    {isAdmin && (
                        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-pink-900/60 to-gray-800/60 rounded-2xl shadow-lg hover:scale-105 transition cursor-pointer border border-pink-700/30" onClick={() => navigate("/admin-dashboard")}> 
                            <Shield className="w-10 h-10 text-pink-400 mb-2" />
                            <span className="text-xl font-bold mb-1">Admin Panel</span>
                            <span className="text-gray-400 text-sm">Manage problems, users, and contests.</span>
                        </div>
                    )}
        </motion.div>

                {/* Animated icons row */}
        <motion.div
          className="mt-16 flex justify-center gap-12 text-blue-400"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
        >
          <Rocket className="w-10 h-10 animate-bounce" />
          <Globe className="w-10 h-10 animate-spin-slow" />
          <StarIcon className="w-10 h-10 animate-pulse" />
        </motion.div>
            </main>

            <div className="absolute bottom-0 w-full text-center text-sm text-gray-600 pb-4 z-20">
                Made with 💙
      </div>
    </div>
  );
}
