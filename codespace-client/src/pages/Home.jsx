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
            <header className="w-full px-8 py-5 flex items-center justify-between bg-gradient-to-r from-gray-900/80 via-blue-900/70 to-gray-800/80 shadow-lg border-b border-blue-900/30 z-10 relative">
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
                {/* Mobile Hamburger */}
                <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {/* Hamburger icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
                </button>
                <div>
                    {/* Login/Profile button */}
                    <button onClick={() => navigate(userName ? "/profile" : "/login")} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/80 hover:bg-blue-700 transition font-semibold border border-blue-900/30">
                        <UserCircle className="w-6 h-6" />
                        {userName ? userName : "Login"}
                    </button>
                </div>
                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 bg-black/70 z-50 flex flex-col items-center justify-center md:hidden">
                        <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 text-white text-3xl">&times;</button>
                        <button onClick={() => {navigate("/problems"); setMobileMenuOpen(false);}} className="text-white text-2xl mb-4">Problems</button>
                        <button onClick={() => {navigate("/contests"); setMobileMenuOpen(false);}} className="text-white text-2xl mb-4">Contests</button>
                        <button onClick={() => {navigate("/leaderboard"); setMobileMenuOpen(false);}} className="text-white text-2xl mb-4">Leaderboard</button>
                        {isAdmin && <button onClick={() => {navigate("/admin-dashboard"); setMobileMenuOpen(false);}} className="text-white text-2xl mb-4">Admin</button>}
                    </div>
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
