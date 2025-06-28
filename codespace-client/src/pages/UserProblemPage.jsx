import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProblemPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("// Write your code here");
  const [language, setLanguage] = useState("javascript"); // for future use
  const [testCases, setTestCases] = useState([]); // initial from problem.testCases
const [customCases, setCustomCases] = useState([]); // user-added cases
const [currentInput, setCurrentInput] = useState('');
const [outputs, setOutputs] = useState([]); // stores result for each case
const [selectedCase, setSelectedCase] = useState(0);
const allInputs = [...testCases, ...customCases];



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

  useEffect(() => {
  if (problem?.testCases) {
    setTestCases(problem.testCases.map(tc => tc.input));
  }
}, [problem]);

 const runCode = async () => {
  const allInputs = [...testCases, ...customCases];
  const results = [];

  for (const input of allInputs) {
    try {
      const res = await axios.post("http://localhost:8000/run", {
        language,
        code,
        input,
      });
      results.push(res.data.output || "No output");
    } catch (err) {
      results.push("Error");
    }
  }

  setOutputs(results);
  // Reset selected tab if the deleted one was active
  if (selectedCase >= allInputs.length) {
    setSelectedCase(0);
  }
};




  const submitCode = () => {
    alert("Submitting code...");
  };

  if (!problem) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="min-h-screen text-white bg-[#0f0f0f] p-6">
      <div className="flex gap-6">
        {/* LEFT: Problem Details */}
        <div className="w-1/2 p-6 bg-[#1a1a1a] rounded-md shadow-md overflow-y-auto flex-grow">
          <h2 className="text-3xl font-bold mb-4">{problem.title}</h2>
          <p className="mb-3 text-m text-gray-400 capitalize">
            {problem.difficulty}
          </p>

          <div className="mb-5">
            <h3 className="text-lg font-semibold mb-2">Description:</h3>
            <p className="text-gray-300 whitespace-pre-line">
              {problem.description}
            </p>
          </div>

          <div className="mb-5">
  <h3 className="text-lg font-semibold mb-2">Constraints:</h3>
  {problem.constraints && problem.constraints.trim().length > 0 ? (
    <ul className="list-disc list-inside text-gray-300">
      {problem.constraints
        .split("\n")
        .map((c, idx) => <li key={idx}>{c}</li>)}
    </ul>
  ) : (
    <p className="text-gray-400">No constraints provided.</p>
  )}
</div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Examples:</h3>
            {Array.isArray(problem.testCases) &&
            problem.testCases.length > 0 ? (
              problem.testCases.map((ex, idx) => (
                <div key={idx} className="mb-4 p-3 bg-[#2b2b2b] rounded">
                  <p>
                    <strong>Input:</strong> {ex.input}
                  </p>
                  <p>
                    <strong>Output:</strong> {ex.output}
                  </p>
                  {ex.explanation && (
                    <p>
                      <strong>Explanation:</strong> {ex.explanation}
                    </p>
                  )}
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
              <button
                onClick={runCode}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
              >
                Run
              </button>
              <button
                onClick={submitCode}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
              >
                Submit
              </button>
            </div>
          </div>

          <CodeMirror
            value={code}
            height="400px"
            theme="dark"
            extensions={[
        language === "javascript"
          ? javascript()
          : language === "python"
          ? python()
          : language === "cpp"
          ? cpp()
          : language === "java"
          ? java()
          : javascript(),
      ]}
            onChange={(val) => setCode(val)}
            className="flex-1 rounded"
          />
          <div className="mt-6 bg-[#1e1e1e] p-4 rounded border border-[#2d2d2d]">
  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
    🧪 Testcases
  </h3>

  {/* Tabs with add button */}
  <div className="flex items-center gap-2 mb-4 flex-wrap">
    {[...testCases, ...customCases].map((_, idx) => (
      <div
        key={idx}
        className={`relative px-4 py-1.5 rounded text-sm cursor-pointer transition-colors ${
          idx === selectedCase ? "bg-gray-700 text-white" : "bg-[#333] text-gray-300 hover:bg-[#444]"
        }`}
        onClick={() => setSelectedCase(idx)}
      >
        Case {idx + 1}
        {idx >= testCases.length && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const updated = [...customCases];
              updated.splice(idx - testCases.length, 1);
              setCustomCases(updated);
              setOutputs((prev) => {
                const updatedOutputs = [...prev];
                updatedOutputs.splice(idx, 1);
                return updatedOutputs;
              });
              if (selectedCase === idx) setSelectedCase(0);
            }}
            className="absolute -top-2 -right-2 bg-[#222] hover:bg-red-600 text-white text-xs rounded-full px-1"
          >
            ×
          </button>
        )}
      </div>
    ))}

    {/* Add Testcase button */}
    <button
      onClick={() => {
        if (currentInput.trim()) {
          setCustomCases([...customCases, currentInput.trim()]);
          setCurrentInput("");
        }
      }}
      className="px-4 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded"
    >
      ➕ Add Testcase
    </button>
  </div>

  {/* Testcase Display */}
  <div className="bg-[#2a2a2a] p-4 rounded text-green-300 whitespace-pre-wrap mb-2 text-sm">
    <div>
      <strong>Input:</strong> {allInputs[selectedCase] || "No input"}
    </div>
    <div className="mt-2 text-blue-300">
      <strong>Output:</strong> {outputs[selectedCase] ?? "Run to see output"}
    </div>
  </div>

  {/* Custom Input Textarea */}
  <textarea
    className="w-full bg-[#0d0d0d] text-white border border-[#333] p-2 rounded mt-2 text-sm"
    rows="3"
    placeholder="Enter custom input..."
    value={currentInput}
    onChange={(e) => setCurrentInput(e.target.value)}
  />
</div>



        </div>
      </div>
    </div>
  );
}
