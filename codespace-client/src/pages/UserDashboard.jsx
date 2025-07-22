import Sidebar from "../components/sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaRegStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Activity from "../components/Activity";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [status, setStatus] = useState("All");
  const [activeTab, setActiveTab] = useState("Problems");
  const [sidebarOpen, setSidebarOpen] = useState(true); // toggle state
  const [userName, setUserName] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    const res = await axios.get("http://localhost:5000/api/user/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProblems(res.data);
  };

  const toggleFavorite = async (id) => {
    await axios.patch(
      `http://localhost:5000/api/user/favorite/${id}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    fetchData();
  };

  // Fetch user name for greeting
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(res.data.name || "User");
      } catch {
        setUserName("User");
      }
    };
    fetchUser();
    fetchData();
  }, []);

  const filtered = problems.filter((p) => {
    return (
      (difficulty === "All" || p.difficulty === difficulty) &&
      (status === "All" ||
        (status === "Solved" && p.solved) ||
        (status === "Unsolved" && !p.solved)) &&
      (search === "" || p.title.toLowerCase().includes(search.toLowerCase())) &&
      (activeTab === "Problems" || (activeTab === "Favorites" && p.favorite))
    );
  });

  const total = problems.length;
  const solved = problems.filter((p) => p.solved).length;

  return (
    <div className="flex min-h-screen relative bg-gradient-to-br from-[#0f172a] via-[#181c2f] to-[#232946]">
      {/* Toggle Sidebar Button */}

      {/* Sidebar */}
      <div
        className={`transition-all duration-300 h-screen bg-gray-900 ${
          sidebarOpen ? "w-64" : "w-16"
        } fixed`}
      >
        <Sidebar
          solved={solved}
          total={total}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={!sidebarOpen}
          toggleCollapse={() => setSidebarOpen((prev) => !prev)}
          userData={{ name: userName }}
        />
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        } w-full p-10 min-h-screen`}
      >
        {activeTab === "Activity" ? (
          <Activity />
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 p-5 text-center bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 text-transparent bg-clip-text drop-shadow-lg">
              CodeSpace Dashboard
            </h1>
            <div className="mx-auto w-2/3 h-2 bg-gradient-to-r from-blue-400/40 via-cyan-300/30 to-purple-400/40 blur-md rounded-full -mt-3 mb-4"></div>
            <div className="flex justify-between mb-6">
              <input
                className="bg-gray-900/60 border border-blue-700/40 p-3 rounded-xl w-1/2 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-md"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex gap-6">
                <div className="relative w-40">
                  <select
                    className="block appearance-none w-full bg-gray-900/60 text-white border border-blue-700/40 hover:border-blue-400 px-4 py-2 pr-8 rounded-xl leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option>All</option>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-blue-200">
                    ▼
                  </div>
                </div>

                <div className="relative w-40">
                  <select
                    className="block appearance-none w-full bg-gray-900/60 text-white border border-blue-700/40 hover:border-blue-400 px-4 py-2 pr-8 rounded-xl leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option>All</option>
                    <option>Solved</option>
                    <option>Unsolved</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-blue-200">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-2 text-left bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 text-transparent bg-clip-text drop-shadow-sm">Problems List</h2>

            <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 p-2 md:p-6 rounded-2xl shadow-2xl border border-blue-700/30 overflow-x-auto">
              <table className="w-full text-left rounded-2xl overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-900/60 via-gray-900/60 to-purple-900/60 text-blue-300 uppercase text-xs tracking-widest">
                    <th className="p-4 font-bold">#</th>
                    <th className="p-4 font-bold">Title</th>
                    <th className="p-4 font-bold">Difficulty</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Fav</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, idx) => (
                    <tr
                      key={p._id}
                      className={`transition-all duration-200 ${
                        idx % 2 === 0
                          ? "bg-gray-800/70"
                          : "bg-gray-900/60"
                      } hover:bg-gradient-to-r hover:from-blue-900/40 hover:to-purple-900/40 group`}
                    >
                      <td className="p-4 font-mono text-gray-400">{idx + 1}</td>
                      <td
                        className="p-4 text-blue-300 font-semibold hover:underline cursor-pointer transition group-hover:text-blue-400"
                        onClick={() => navigate(`/user-problems/${p._id}`)}
                      >
                        {p.title}
                      </td>
                      <td className="p-4 capitalize">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold
                            ${
                              p.difficulty === "Easy"
                                ? "bg-green-900/60 text-green-300 border border-green-500/30"
                                : p.difficulty === "Medium"
                                ? "bg-yellow-900/60 text-yellow-300 border border-yellow-500/30"
                                : "bg-red-900/60 text-red-300 border border-red-500/30"
                            }
                          `}
                        >
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold
                          ${p.solved ? "bg-blue-900/40 text-blue-300 border border-blue-500/30" : "bg-gray-700/40 text-gray-300 border border-gray-500/30"}`}
                        >
                          {p.solved ? "Solved" : "Unsolved"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => toggleFavorite(p._id)}>
                          {p.favorite ? (
                            <FaStar className="text-yellow-300 drop-shadow" />
                          ) : (
                            <FaRegStar className="text-blue-200 group-hover:text-yellow-200" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
