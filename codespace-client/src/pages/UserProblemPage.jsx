import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProblemPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("// Write your code here");
  const [language, setLanguage] = useState("javascript"); // for future use

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`http://localhost:5000/api/user/user-problems/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setProblem(res.data);
      })
      .catch((err) => {
        console.error("Error fetching problem:", err);
      });
  }, [id]);

  const runCode = () => {
    alert("Running code...");
  };

  const submitCode = () => {
    alert("Submitting code...");
  };

  if (!problem) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="min-h-screen text-white bg-[#0f0f0f] p-6">
      <div className="flex gap-6">
        {/* LEFT: Problem Details */}
        <div className="w-1/2 p-6 bg-[#1a1a1a] rounded-md shadow-md overflow-y-auto max-h-[90vh]">
          <h2 className="text-3xl font-bold mb-3">{problem.title}</h2>
          <p className="mb-2 text-sm text-gray-400 capitalize">{problem.difficulty}</p>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Description:</h3>
            <p className="text-gray-300 whitespace-pre-line">{problem.description}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Constraints:</h3>
            {Array.isArray(problem.constraints) && problem.constraints.length > 0 ? (
              <ul className="list-disc list-inside text-gray-300">
                {problem.constraints &&
  problem.constraints.split('\n').map((c, idx) => <li key={idx}>{c}</li>)}

              </ul>
            ) : (
              <p className="text-gray-400">No constraints provided.</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-1">Examples:</h3>
            {Array.isArray(problem.testCases) && problem.testCases.length > 0 ? (
  problem.testCases.map((ex, idx) => (
    <div key={idx} className="mb-3 p-3 bg-[#2b2b2b] rounded">
      <p><strong>Input:</strong> {ex.input}</p>
      <p><strong>Output:</strong> {ex.output}</p>
      <p><strong>Explanation:</strong> {ex.explanation || "N/A"}</p>
    </div>
  ))
) : (
  <p className="text-gray-400">No examples provided.</p>
)}

          </div>
        </div>

        {/* RIGHT: Code Editor */}
        <div className="w-1/2 p-6 bg-[#1a1a1a] rounded-md shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <select
              className="bg-gray-800 text-white px-3 py-2 rounded"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
            <div className="space-x-2">
              <button onClick={runCode} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">
                Run
              </button>
              <button onClick={submitCode} className="px-4 py-2 bg-green-600 rounded hover:bg-green-500">
                Submit
              </button>
            </div>
          </div>

          <CodeMirror
            value={code}
            height="400px"
            theme="dark"
            extensions={[javascript()]} // Change based on `language` later
            onChange={(val) => setCode(val)}
            className="flex-1 rounded"
          />
        </div>
      </div>
    </div>
  );
}
