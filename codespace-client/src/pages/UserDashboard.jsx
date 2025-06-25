import Sidebar from "../components/sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaRegStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


export default function UserDashboard() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [status, setStatus] = useState("All");
  const [activeTab, setActiveTab] = useState("Problems");

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    const res = await axios.get("http://localhost:5000/api/user/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProblems(res.data);
  };

  const toggleFavorite = async (id) => {
    await axios.patch(`http://localhost:5000/api/user/favorite/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = problems.filter(p => {
    return (
      (difficulty === "All" || p.difficulty === difficulty) &&
      (status === "All" || (status === "Solved" && p.solved) || (status === "Unsolved" && !p.solved)) &&
      (search === "" || p.title.toLowerCase().includes(search.toLowerCase())) &&
      (activeTab === "Problems" || (activeTab === "Favorites" && p.favorite))
    );
  });

  const total = problems.length;
  const solved = problems.filter(p => p.solved).length;

  return (
    <div className="flex bg-black text-white min-h-screen">
      <Sidebar solved={solved} total={total} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="ml-64 w-full p-6">
        <h1 className="text-4xl font-extrabold mb-8 text-center animate-pulse text-blue-400">
          🚀 Welcome to CodeSpace
        </h1>

        <div className="flex justify-between mb-4">
          <input
            className="bg-gray-800 p-2 rounded w-1/2"
            placeholder="🔍 Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-6">
  <div className="relative w-40">
    <select
      className="block appearance-none w-full bg-gray-800 text-white border border-gray-600 hover:border-gray-400 px-4 py-2 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      className="block appearance-none w-full bg-gray-800 text-white border border-gray-600 hover:border-gray-400 px-4 py-2 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 border-b border-gray-600">
              <th className="p-2">#</th>
              <th className="p-2">Title</th>
              <th className="p-2">Difficulty</th>
              <th className="p-2">Status</th>
              <th className="p-2">Fav</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, idx) => (
              <tr key={p._id} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="p-2">{idx + 1}</td>
                <td
  className="p-2 text-blue-400 hover:underline cursor-pointer"
  onClick={() => navigate(`/user-problems/${p._id}`)}
>
  {p.title}
</td>
                <td className="p-2 capitalize text-yellow-400">{p.difficulty}</td>
                <td className="p-2 text-green-400">{p.solved ? "✔" : "❌"}</td>
                <td className="p-2">
                  <button onClick={() => toggleFavorite(p._id)}>
                    {p.favorite ? <FaStar className="text-yellow-300" /> : <FaRegStar />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
