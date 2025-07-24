import { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarAlt, FaCode, FaTrophy, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Activity() {
  const [activityData, setActivityData] = useState([]);
  const [userStats, setUserStats] = useState({
    totalSubmissions: 0,
    problemsSolved: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  const token = localStorage.getItem("token");

  // Generate heatmap data for the past year
  const generateHeatmapData = (submissions) => {
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const heatmapData = [];

    // Create a map of submission dates
    const submissionDates = new Map();
    submissions.forEach(sub => {
      const date = new Date(sub.timestamp).toDateString();
      submissionDates.set(date, (submissionDates.get(date) || 0) + 1);
    });

    // Find the start of the first week (Sunday) for GitHub-style layout
    const firstWeekStart = new Date(oneYearAgo);
    firstWeekStart.setDate(firstWeekStart.getDate() - firstWeekStart.getDay());

    // Generate data for 53 weeks * 7 days = 371 days (GitHub standard)
    for (let day = 0; day < 371; day++) {
      const currentDate = new Date(firstWeekStart);
      currentDate.setDate(firstWeekStart.getDate() + day);
      
      const dateStr = currentDate.toDateString();
      const count = submissionDates.get(dateStr) || 0;
      heatmapData.push({
        date: new Date(currentDate),
        count: count,
        level: count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4
      });
    }

    return heatmapData;
  };

  // Calculate user statistics
  const calculateStats = (submissions) => {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get unique problems solved (based on accepted submissions)
    const acceptedSubmissions = submissions.filter(sub => sub.verdict === "Accepted");
    const uniqueSolvedProblems = new Set(acceptedSubmissions.map(sub => sub.problemId.toString()));
    const problemsSolved = uniqueSolvedProblems.size;
    


    // Get unique dates with accepted submissions (when problems were solved)
    const solveDateStrings = acceptedSubmissions.map(sub => {
      const date = new Date(sub.timestamp);
      date.setHours(0, 0, 0, 0);
      return date.toISOString().split('T')[0];
    });
    const uniqueSolveDates = [...new Set(solveDateStrings)].sort((a, b) => b.localeCompare(a));

    // Calculate longest streak based on solve dates
    for (let i = 0; i < uniqueSolveDates.length; i++) {
      const currentDate = new Date(uniqueSolveDates[i]);
      const nextDate = i < uniqueSolveDates.length - 1 ? new Date(uniqueSolveDates[i + 1]) : null;

      if (nextDate) {
        const diffDays = Math.floor((currentDate - nextDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          if (tempStreak > longestStreak) longestStreak = tempStreak;
          tempStreak = 1;
        }
      } else {
        tempStreak++;
      }
    }

    if (tempStreak > longestStreak) longestStreak = tempStreak;

    // Calculate current streak - check consecutive days from today backwards
    let checkDate = new Date(today);
    let currentStreakCount = 0;
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueSolveDates.includes(dateStr)) {
        currentStreakCount++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalSubmissions: submissions.length,
      problemsSolved: problemsSolved,
      currentStreak: currentStreakCount,
      longestStreak: longestStreak,
    };
  };

  const fetchActivityData = async () => {
    try {
      // Fetch submissions for activity data
      const submissionsRes = await axios.get(`${import.meta.env.VITE_API_URL}api/user/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      

      
      const heatmapData = generateHeatmapData(submissionsRes.data);
      const stats = calculateStats(submissionsRes.data);
      

      
      setActivityData(heatmapData);
      setUserStats(stats);
    } catch (error) {
      console.error("Error fetching activity data:", error);
    }
  };



  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: "New passwords do not match!", type: "error" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ text: "Password must be at least 6 characters long!", type: "error" });
      return;
    }

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}api/user/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({ text: "Password changed successfully!", type: "success" });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || "Failed to change password", 
        type: "error" 
      });
    }
  };

  useEffect(() => {
    fetchActivityData();
  }, []);

  const getHeatmapColor = (level) => {
    switch (level) {
      case 0: return "bg-gray-800";
      case 1: return "bg-green-600";
      case 2: return "bg-green-500";
      case 3: return "bg-green-400";
      case 4: return "bg-green-300";
      default: return "bg-gray-800";
    }
  };



  // Generate month labels for GitHub-style 53-week layout
  const getMonthLabels = () => {
    const monthLabels = [];
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    // Find the start of the first week (Sunday)
    const firstWeekStart = new Date(oneYearAgo);
    firstWeekStart.setDate(firstWeekStart.getDate() - firstWeekStart.getDay());
    
    // Generate labels for 53 weeks (GitHub standard)
    for (let week = 0; week < 53; week++) {
      const weekStart = new Date(firstWeekStart);
      weekStart.setDate(weekStart.getDate() + (week * 7));
      
      // Only show month label if this week contains the 1st of a month
      const monthStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
      const daysDiff = Math.floor((weekStart - monthStart) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 6 && daysDiff >= 0) {
        monthLabels.push({
          month: weekStart.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex: week
        });
      } else {
        monthLabels.push({ month: '', weekIndex: week });
      }
    }
    
    return monthLabels;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 mb-4">
          Activity Dashboard
        </h2>
        <p className="text-gray-300">Track your coding journey and manage your account</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-6 rounded-xl border border-blue-700/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Total Submissions</p>
              <p className="text-3xl font-bold text-white">{userStats.totalSubmissions}</p>
            </div>
            <FaCode className="text-4xl text-blue-400/60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 p-6 rounded-xl border border-green-700/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Problems Solved</p>
              <p className="text-3xl font-bold text-white">{userStats.problemsSolved}</p>
            </div>
            <FaTrophy className="text-4xl text-green-400/60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 p-6 rounded-xl border border-yellow-700/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm font-medium">Current Streak</p>
              <p className="text-3xl font-bold text-white">{userStats.currentStreak} days</p>
            </div>
            <FaCalendarAlt className="text-4xl text-yellow-400/60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 p-6 rounded-xl border border-purple-700/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Longest Streak</p>
              <p className="text-3xl font-bold text-white">{userStats.longestStreak} days</p>
            </div>
            <FaTrophy className="text-4xl text-purple-400/60" />
          </div>
        </div>
      </div>



      {/* Activity Heatmap */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 p-8 rounded-2xl border border-gray-700/30">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FaCalendarAlt className="text-blue-400" />
          Activity Heatmap
        </h3>
        
        <div className="flex justify-center">
          <div className="flex flex-col space-y-2">
            {/* Month labels */}
            <div className="grid gap-1 ml-8" style={{ gridTemplateColumns: `repeat(53, 12px)` }}>
              {getMonthLabels().map((monthLabel, index) => (
                <div key={index} className="text-xs text-gray-400 text-center w-3">
                  {monthLabel.month}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(53, 12px)` }}>
              {activityData.map((day, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.level)} border border-gray-700/20`}
                  title={`${day.date.toLocaleDateString()}: ${day.count} submissions`}
                />
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-end space-x-2 mt-4">
              <span className="text-xs text-gray-400">Less</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
              </div>
              <span className="text-xs text-gray-400">More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 p-8 rounded-2xl border border-gray-700/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaLock className="text-blue-400" />
            Account Settings
          </h3>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-2 rounded-lg text-white font-semibold transition-all duration-200"
          >
            {showPasswordForm ? "Cancel" : "Change Password"}
          </button>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg mb-4 ${
            message.type === "success" 
              ? "bg-green-900/40 border border-green-700/30 text-green-300" 
              : "bg-red-900/40 border border-red-700/30 text-red-300"
          }`}>
            {message.text}
          </div>
        )}

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 py-3 rounded-lg text-white font-semibold transition-all duration-200"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 