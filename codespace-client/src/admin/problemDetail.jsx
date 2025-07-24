import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}api/admin/problems/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProblem(res.data);
      } catch (err) {
        console.error("Problem fetch error", err);
      }
    };
    fetchProblem();
  }, [id]);

  if (!problem) {
    return <div className="text-white text-center mt-10 text-xl">🚀 Loading...</div>;
  }

  return (
    <div className="bg-black text-white min-h-screen p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-400 mb-4 border-b border-gray-700 pb-2">{problem.title}</h1>
      <div className="flex items-center text-sm text-gray-400 mb-6">
        <span className="bg-gray-800 px-3 py-1 rounded-full mr-2">🧩 Difficulty: <span className="capitalize text-white">{problem.difficulty}</span></span>
      </div>

      {/* Description */}
      <section className="bg-gradient-to-br from-[#232946]/90 via-gray-900/90 to-gray-800/90 rounded-3xl shadow-2xl border border-blue-700/40 p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <span className="text-2xl">📝</span>
          </div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Problem Description
          </h2>
        </div>
        <div className="text-gray-200 text-base leading-relaxed bg-[#20243a] rounded-xl p-5 border border-blue-900/20" style={{ whiteSpace: 'pre-wrap' }}>
          {problem.description}
        </div>
      </section>

      {/* Constraints */}
      {problem.constraints && (
        <section className="bg-gradient-to-br from-[#232946]/90 via-gray-900/90 to-gray-800/90 rounded-3xl shadow-2xl border border-purple-700/40 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <span className="text-2xl">📏</span>
            </div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Constraints
            </h2>
          </div>
          <div className="text-gray-200 text-base leading-relaxed bg-[#20243a] rounded-xl p-5 border border-purple-900/20" style={{ whiteSpace: 'pre-wrap' }}>
            {problem.constraints}
          </div>
        </section>
      )}

      {/* Test Cases */}
      <section className="bg-gradient-to-br from-[#232946]/90 via-gray-900/90 to-gray-800/90 rounded-3xl shadow-2xl border border-green-700/40 p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <span className="text-2xl">🧪</span>
          </div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
            Test Cases
          </h2>
        </div>
        {problem.testCases.length === 0 && (
          <div className="text-gray-500 italic">No test cases available.</div>
        )}
        {problem.testCases.map((tc, idx) => (
          <div key={idx} className="mb-6 border-b border-gray-800 pb-4">
            <p className="text-blue-400 font-semibold">Example {idx + 1}</p>
            <div className="mt-2">
              <p className="text-gray-300">🔢 <strong>Input:</strong></p>
              <pre className="bg-gray-800 p-3 rounded text-green-300 font-mono whitespace-pre-wrap">{tc.input}</pre>
            </div>
            <div className="mt-2">
              <p className="text-gray-300">✅ <strong>Expected Output:</strong></p>
              <pre className="bg-gray-800 p-3 rounded text-green-300 font-mono whitespace-pre-wrap">{tc.output}</pre>
            </div>
            {tc.explanation && (
              <div className="mt-2">
                <p className="text-gray-300">🧠 <strong>Explanation:</strong></p>
                <pre className="bg-gray-800 p-3 rounded text-gray-200 font-mono whitespace-pre-wrap">{tc.explanation}</pre>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
