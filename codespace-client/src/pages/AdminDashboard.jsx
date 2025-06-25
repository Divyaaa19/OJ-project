import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, problems: 0, active: 0 });
  const [problems, setProblems] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchStats();
    fetchProblems();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <h1 className="text-4xl font-bold text-center text-blue-400">🛠️ Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded shadow text-center">
          <p className="text-xl">👥 Total Users</p>
          <p className="text-3xl font-bold">{stats.users}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow text-center">
          <p className="text-xl">🧠 Problems</p>
          <p className="text-3xl font-bold">{stats.problems}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow text-center">
          <p className="text-xl">🟢 Active Users</p>
          <p className="text-3xl font-bold">{stats.active}</p>
        </div>
      </div>

      {/* Problem List */}
      <div className="bg-gray-900 mt-8 p-4 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4 text-blue-300">🧩List of Problems</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 border-b border-gray-600">
              <th className="p-2">Problem Name</th>
              <th className="p-2">Difficulty</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr key={problem._id} className="border-b border-gray-800 hover:bg-gray-800">
                <td
                  className="p-2 cursor-pointer text-blue-400 hover:underline"
                  onClick={() => navigate(`/problems/${problem._id}`)}
                >
                  {problem.title}
                </td>
                <td className="p-2 capitalize">{problem.difficulty}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => navigate(`/admin/edit-problem/${problem._id}`)}
                    className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProblem(problem._id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
  onClick={() => navigate("/admin/add-problem")}
  className=" mt-10 mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
>
  ➕ Add New Problem
</button>

      </div>
    </div>
  );
}
 