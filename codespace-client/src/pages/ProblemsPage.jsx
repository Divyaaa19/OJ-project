import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HiOutlineArrowLeft } from "react-icons/hi";

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProblems() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}api/user/public/problems`);
        setProblems(res.data);
        console.log('PROBLEMS:', res.data);
      } catch (err) {
        setProblems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto bg-gray-900/90 rounded-3xl shadow-2xl border border-blue-900/40 p-8 relative">
        {/* Back Arrow */}
        <button
          className="absolute -top-8 -left-45 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800/80 to-gray-700/80 text-gray-300 hover:text-white rounded-xl border border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          onClick={() => navigate("/")}
        >
          <HiOutlineArrowLeft className="text-xl" />
          <span className="font-semibold">Back</span>
        </button>
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 drop-shadow-lg text-center">Problems</h1>
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading problems...</div>
        ) : problems.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No problems found.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-gradient-to-r from-blue-900/60 via-cyan-900/60 to-purple-900/60">
                  <th className="px-6 py-4 rounded-l-2xl text-lg font-semibold text-blue-300">Title</th>
                  <th className="px-6 py-4 text-lg font-semibold text-cyan-300">Difficulty</th>
                  <th className="px-6 py-4 rounded-r-2xl text-lg font-semibold text-purple-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem, idx) => (
                  <tr key={problem._id} className={
                    `transition-all duration-200 hover:scale-[1.01] hover:shadow-lg bg-gradient-to-r from-gray-800/80 via-gray-900/80 to-gray-800/80 ${idx % 2 === 0 ? 'border-l-4 border-blue-700/40' : 'border-l-4 border-purple-700/40'}`
                  }>
                    <td className="px-6 py-4 font-semibold cursor-pointer text-blue-300 hover:underline text-lg" onClick={() => toast.info('Please login to view and solve problems.')}>{problem.title}</td>
                    <td className={`px-6 py-4 font-bold text-lg ${problem.difficulty === "Easy" ? "text-green-400" : problem.difficulty === "Medium" ? "text-yellow-400" : "text-red-400"}`}>{problem.difficulty}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toast.info('Please login to view and solve problems.')}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-md hover:shadow-xl transition-all duration-200 text-base"
                      >
                        <span>🔒 Solve</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
} 