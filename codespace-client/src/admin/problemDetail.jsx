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
        const res = await axios.get(`http://localhost:5000/api/admin/problems/${id}`, {
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
      <section className="bg-gray-900 rounded-lg p-6 mb-6 shadow">
        <h2 className="text-xl font-semibold text-yellow-300 mb-2">📝 Description</h2>
        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{problem.description}</p>
      </section>

      {/* Constraints */}
      {problem.constraints && (
        <section className="bg-gray-900 rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold text-yellow-300 mb-2">📏 Constraints</h2>
          <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{problem.constraints}</p>
        </section>
      )}

      {/* Test Cases */}
      <section className="bg-gray-900 rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-yellow-300 mb-4">🧪 Test Cases</h2>
        {problem.testCases.length === 0 && (
          <p className="text-gray-500 italic">No test cases available.</p>
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
