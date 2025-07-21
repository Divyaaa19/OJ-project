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
    <div className="flex bg-black text-white min-h-screen relative">
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
          userName={userName}
        />
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        } w-full p-10`}
      >
        {activeTab === "Activity" ? (
          <Activity />
        ) : (
        <>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-8 p-5 text-center bg-gradient-to-r from-blue-300 via-fuchsia-400 to-pink-300 text-transparent bg-clip-text drop-shadow-lg">
            CodeSpace Dashboard
          </h1>
          <div className="flex justify-between mb-6">
            <input
              className="bg-white/10 backdrop-blur-md border border-blue-400/30 p-3 rounded-xl w-1/2 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-md"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-6">
              <div className="relative w-40">
                <select
                  className="block appearance-none w-full bg-white/10 backdrop-blur-md text-white border border-blue-400/30 hover:border-blue-400 px-4 py-2 pr-8 rounded-xl leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option>All</option>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-white">
                  ▼
                </div>
              </div>

              <div className="relative w-40">
                <select
                  className="block appearance-none w-full bg-white/10 backdrop-blur-md text-white border border-blue-400/30 hover:border-blue-400 px-4 py-2 pr-8 rounded-xl leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option>All</option>
                  <option>Solved</option>
                  <option>Unsolved</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-white">
                  ▼
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-400/20 p-2 md:p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-blue-200 border-b border-blue-400/30">
                  <th className="p-3 font-semibold">#</th>
                  <th className="p-3 font-semibold">Title</th>
                  <th className="p-3 font-semibold">Difficulty</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Fav</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr
                    key={p._id}
                    className="border-b border-blue-400/10 hover:bg-blue-400/10 transition-all duration-200 group"
                  >
                    <td className="p-3 text-blue-100 group-hover:text-white font-semibold">{idx + 1}</td>
                    <td
                      className="p-3 text-blue-300 group-hover:text-white hover:underline cursor-pointer font-semibold"
                      onClick={() => navigate(`/user-problems/${p._id}`)}
                    >
                      {p.title}
                    </td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md
                        ${p.difficulty === 'Easy' ? 'bg-green-400/20 text-green-300 border border-green-400/40' :
                          p.difficulty === 'Medium' ? 'bg-yellow-400/20 text-yellow-200 border border-yellow-400/40' :
                          'bg-red-400/20 text-red-200 border border-red-400/40'}`}
                      >
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md
                        ${p.solved ? 'bg-blue-400/20 text-blue-200 border border-blue-400/40' : 'bg-gray-700 text-gray-300 border border-gray-500/40'}`}
                      >
                        {p.solved ? 'Solved' : 'Unsolved'}
                      </span>
                    </td>
                    <td className="p-3">
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
