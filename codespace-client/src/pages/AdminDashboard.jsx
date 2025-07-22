import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HiOutlineLogout, HiOutlinePlus, HiOutlinePencilAlt, HiOutlineTrash, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { FaUsers, FaBrain, FaUserCheck, FaEdit, FaTrash } from "react-icons/fa";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, problems: 0, active: 0 });
  const [problems, setProblems] = useState([]);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
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
  const [activeProfileTab, setActiveProfileTab] = useState("info");
  const [adminSubmissions, setAdminSubmissions] = useState([]);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [modalCode, setModalCode] = useState("");
  const [modalLang, setModalLang] = useState("");

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(res.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchProblems = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/problems", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProblems(res.data);
    } catch (err) {
      console.error("Problem fetch error:", err);
    }
  };

  const deleteProblem = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/problems/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProblems(problems.filter(p => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
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
      const token = localStorage.getItem("token");
      await axios.patch(
        "http://localhost:5000/api/user/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({ text: "Password changed successfully!", type: "success" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (error) {
      setMessage({ text: error.response?.data?.error || "Failed to change password", type: "error" });
    }
  };

  const fetchAdminSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/submissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdminSubmissions(res.data);
    } catch (err) {
      setAdminSubmissions([]);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchProblems();
    fetchUserData();
  }, []);

  useEffect(() => {
    if (showProfile && activeProfileTab === "submissions") {
      fetchAdminSubmissions();
    }
  }, [showProfile, activeProfileTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#181c2f] to-[#232946] text-white p-10">
      {/* Greeting */}
      <div className="mb-6 flex justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-300">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold">{userData?.name || "Admin"}</span>
          </h3>
          <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mx-auto mt-2"></div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="relative w-fit">
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 drop-shadow-[0_2px_24px_rgba(56,189,248,0.25)] tracking-tight transition-all duration-500">
            Admin <span className="text-blue-400">Dashboard</span>
          </h1>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2/3 h-2 bg-gradient-to-r from-blue-400/40 via-cyan-300/30 to-purple-400/40 blur-lg rounded-full pointer-events-none"></div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center justify-center bg-gray-800/80 hover:bg-gray-700/80 text-blue-300 hover:text-blue-400 p-2 rounded-full border border-gray-700 hover:border-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="Profile"
          >
            <HiOutlineUser className="text-2xl" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200"
          >
            <HiOutlineLogout className="text-xl" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 p-8 rounded-2xl shadow-2xl border border-gray-700/60 min-w-[350px] max-w-full relative w-[95vw] ">
            <button
              onClick={() => { setShowProfile(false); setShowPasswordForm(false); setMessage({ text: "", type: "" }); setActiveProfileTab("info"); }}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
              title="Close"
            >
              ×
            </button>
            <div className="flex flex-col items-center mb-6">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-400 p-2 rounded-full mb-2">
                <HiOutlineUser className="text-4xl text-white" />
              </div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1">{userData?.name || "Admin"}</h2>
              <p className="text-gray-300 text-sm">{userData?.email || "admin@example.com"}</p>
            </div>
            <div className="flex gap-4 mb-6 justify-center">
              <button
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${activeProfileTab === "info" ? "bg-blue-700 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                onClick={() => setActiveProfileTab("info")}
              >
                Profile
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${activeProfileTab === "submissions" ? "bg-blue-700 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                onClick={() => setActiveProfileTab("submissions")}
              >
                My Submissions
              </button>
            </div>
            {activeProfileTab === "info" && (
              <>
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => setShowPasswordForm((v) => !v)}
                    className="flex items-center gap-1 px-3 py-1 text-sm border border-blue-500 text-blue-400 bg-transparent rounded hover:bg-blue-900/20 transition-all duration-200 mb-2 shadow-none font-medium"
                  >
                    <HiOutlinePencilAlt className="inline-block text-base" />
                    {showPasswordForm ? "Cancel" : "Change Password"}
                  </button>
                </div>
                {message.text && (
                  <div className={`p-3 rounded-lg mb-4 text-center ${
                    message.type === "success"
                      ? "bg-green-900/40 border border-green-700/30 text-green-300"
                      : "bg-red-900/40 border border-red-700/30 text-red-300"
                  }`}>
                    {message.text}
                  </div>
                )}
                {showPasswordForm && (
                  <form onSubmit={handlePasswordChange} className="space-y-3 p-2 bg-gray-900/60 rounded-lg border border-gray-800 max-w-xs mx-auto">
                    <div>
                      <label className="block text-gray-300 text-xs font-medium mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords.current ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs font-medium mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords.new ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs font-medium mb-1">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords.confirm ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-3 py-2 rounded text-white font-semibold text-sm transition-all duration-200 mt-2"
                    >
                      Update Password
                    </button>
                  </form>
                )}
              </>
            )}
            {activeProfileTab === "submissions" && (
              <div className="max-h-[400px] overflow-y-auto mt-2">
                {adminSubmissions.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No submissions found.</div>
                ) : (
                  <table className="w-full text-sm border border-blue-700/30 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-blue-900/40">
                        <th className="px-3 py-2">Time</th>
                        <th className="px-3 py-2">Problem</th>
                        <th className="px-3 py-2">Language</th>
                        <th className="px-3 py-2">Verdict</th>
                        <th className="px-3 py-2">Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminSubmissions.map((s, i) => (
                        <tr key={i} className="border-t border-blue-700/10">
                          <td className="px-3 py-2 text-center">{new Date(s.timestamp).toLocaleString()}</td>
                          <td className="px-3 py-2">{s.problemTitle || "-"}</td>
                          <td className="px-3 py-2">{s.language}</td>
                          <td className="px-3 py-2 text-center">
                            {s.verdict === "Accepted" && (
                              <span className="inline-block px-3 py-1 rounded-full bg-green-900/40 text-green-400 font-bold">Accepted</span>
                            )}
                            {s.verdict === "Wrong Answer" && (
                              <span className="inline-block px-3 py-1 rounded-full bg-red-900/40 text-red-400 font-bold">Wrong Answer</span>
                            )}
                            {s.verdict === "TLE" && (
                              <span className="inline-block px-3 py-1 rounded-full bg-yellow-900/40 text-yellow-400 font-bold">TLE</span>
                            )}
                            {s.verdict === "MLE" && (
                              <span className="inline-block px-3 py-1 rounded-full bg-orange-900/40 text-orange-400 font-bold">MLE</span>
                            )}
                            {s.verdict === "Error" && (
                              <span className="inline-block px-3 py-1 rounded-full bg-gray-700/40 text-gray-300 font-bold">Error</span>
                            )}
                          </td>
                          <td className="px-3 py-2 max-w-xs truncate">
                            <button
                              className="text-blue-400 hover:underline font-semibold px-2 py-1 rounded bg-blue-900/20 hover:bg-blue-900/40 transition"
                              onClick={() => { setModalCode(s.code); setModalLang(s.language); setShowCodeModal(true); }}
                            >
                              View Code
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 p-6 rounded-2xl shadow-2xl border border-gray-700/50 text-center hover:border-gray-600/50 transition-all duration-200">
          <div className="flex justify-center mb-3">
            <FaUsers className="text-3xl text-blue-400" />
          </div>
          <p className="text-lg text-gray-300 mb-2">Total Users</p>
          <p className="text-4xl font-bold text-blue-300">{stats.users}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 p-6 rounded-2xl shadow-2xl border border-gray-700/50 text-center hover:border-gray-600/50 transition-all duration-200">
          <div className="flex justify-center mb-3">
            <FaBrain className="text-3xl text-cyan-400" />
          </div>
          <p className="text-lg text-gray-300 mb-2">Problems</p>
          <p className="text-4xl font-bold text-cyan-300">{stats.problems}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 p-6 rounded-2xl shadow-2xl border border-gray-700/50 text-center hover:border-gray-600/50 transition-all duration-200">
          <div className="flex justify-center mb-3">
            <FaUserCheck className="text-3xl text-green-400" />
          </div>
          <p className="text-lg text-gray-300 mb-2">Active Users</p>
          <p className="text-4xl font-bold text-green-300">{stats.active}</p>
        </div>
      </div>

      {/* Problem List */}
      <div className="overflow-x-auto rounded-2xl shadow-2xl bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 p-1">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Problems Management
            </h2>
            <button
              onClick={() => navigate("/admin/add-problem")}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
            >
              <HiOutlinePlus className="text-xl" />
              Add New Problem
            </button>
          </div>

          <table className="w-full text-left rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-blue-900/60 via-gray-900/60 to-purple-900/60 text-blue-300 uppercase text-xs tracking-widest">
                <th className="p-4 font-bold">#</th>
                <th className="p-4 font-bold">Problem Name</th>
                <th className="p-4 font-bold">Difficulty</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 text-lg">
                    No problems found.
                  </td>
                </tr>
              ) : (
                problems.map((problem, idx) => (
                  <tr
                    key={problem._id}
                    className={`transition-all duration-200 ${
                      idx % 2 === 0
                        ? "bg-gray-800/70"
                        : "bg-gray-900/60"
                    } hover:bg-gradient-to-r hover:from-blue-900/40 hover:to-purple-900/40 group`}
                  >
                    <td className="p-4 font-mono text-gray-400">{idx + 1}</td>
                    <td
                      className="p-4 text-blue-300 font-semibold hover:underline cursor-pointer transition group-hover:text-blue-400"
                      onClick={() => navigate(`/problems/${problem._id}`)}
                    >
                      {problem.title}
                    </td>
                    <td className="p-4 capitalize">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold
                          ${
                            problem.difficulty === "Easy"
                              ? "bg-green-900/60 text-green-300 border border-green-500/30"
                              : problem.difficulty === "Medium"
                              ? "bg-yellow-900/60 text-yellow-300 border border-yellow-500/30"
                              : "bg-red-900/60 text-red-300 border border-red-500/30"
                          }
                        `}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => navigate(`/admin/edit-problem/${problem._id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-600/80 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        <FaEdit className="text-sm" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProblem(problem._id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        <FaTrash className="text-sm" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <p className="text-gray-400 text-sm">
              <span className="text-yellow-400 font-semibold">⚠️ Important:</span> Ensure that inputs follow standard format like:
            </p>
            <code className="block mt-2 text-green-300 font-mono bg-gray-900/50 p-2 rounded border border-gray-600/50">
              4<br/>
              2 7 11 15<br/>
              9
            </code>
          </div>
        </div>
      </div>

      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-blue-700/60 min-w-[350px] max-w-2xl w-full relative">
            <button
              onClick={() => setShowCodeModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
              title="Close"
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-blue-400 mb-4">Submission Code ({modalLang?.toUpperCase()})</h3>
            <pre className="bg-[#181c2f] border border-blue-900/30 rounded-xl p-4 text-gray-200 text-sm max-h-[60vh] overflow-auto whitespace-pre-wrap font-mono">
              {modalCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
