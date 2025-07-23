import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineTrash, HiOutlineCheck } from "react-icons/hi";
import { FaBrain, FaEye, FaEyeSlash } from "react-icons/fa";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const codeTemplates = {
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    // your code here\n    return 0;\n}`,
  python: `# your code here\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()`,
  java: `public class Main {\n    public static void main(String[] args) {\n        // your code here\n    }\n}`,
};

export default function EditProblem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adminCode, setAdminCode] = useState(codeTemplates["cpp"]);
  const [adminLanguage, setAdminLanguage] = useState("cpp");
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/admin/problems/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProblem(res.data);
      } catch (err) {
        alert("Failed to load problem.");
        console.error(err);
      }
    };
    fetchProblem();
  }, [id]);

  const handleChange = (e) => {
    setProblem({ ...problem, [e.target.name]: e.target.value });
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...problem.testCases];
    updated[index][field] = value;
    setProblem({ ...problem, testCases: updated });
  };

  const addTestCase = () => {
    setProblem({
      ...problem,
      testCases: [...problem.testCases, { input: "", output: "", explanation: "", hidden: false }],
    });
  };

  const removeTestCase = (index) => {
    if (problem.testCases.length > 1) {
    const updated = [...problem.testCases];
    updated.splice(index, 1);
    setProblem({ ...problem, testCases: updated });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const cleanedProblem = {
        ...problem,
        testCases: problem.testCases.map(({ input, output, explanation, hidden }) => {
          const tc = { input, output };
          if (explanation?.trim()) tc.explanation = explanation;
          if (hidden) tc.hidden = true;
          return tc;
        }),
      };
      await axios.put(
        `http://localhost:5000/api/admin/problems/${id}`,
        cleanedProblem,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Problem updated!");
      setTimeout(() => navigate("/admin-dashboard"), 1200);
    } catch (err) {
      toast.error("Update failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    setAdminLanguage(e.target.value);
    setAdminCode(codeTemplates[e.target.value]);
  };

  if (!problem) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#181c2f] to-[#232946] text-white">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-cyan-900/20"></div>
        <div className="relative p-8 lg:p-12 bg-gradient-to-b from-[#0f172a]/95 via-[#181c2f]/95 to-[#232946]/90 pb-6">
          {/* Navigation */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="flex items-center gap-2 bg-gradient-to-r from-gray-800/80 to-gray-700/80 hover:from-gray-700/80 hover:to-gray-600/80 text-gray-300 hover:text-white px-5 py-3 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:transform hover:scale-105"
            >
              <HiOutlineArrowLeft className="text-xl" />
              <span className="font-semibold">Back to Dashboard</span>
            </button>
          </div>
          {/* Main Header */}
          <div className="text-center mb-8">
            <div className="relative w-fit mx-auto">
              <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 drop-shadow-[0_2px_24px_rgba(56,189,248,0.25)] tracking-tight transition-all duration-500">
                Edit <span className="text-blue-400">Problem</span>
              </h1>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[60%] h-[2px] bg-gradient-to-r from-blue-500/10 via-cyan-400/10 to-purple-500/10 blur-sm rounded-full pointer-events-none"></div>
            </div>
            <p className="mt-3 text-base text-gray-300 max-w-xl mx-auto">
              Update the coding problem details and test cases below.
            </p>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="px-2 lg:px-12 pb-12 mt-4">
        <div className="max-w-3xl mx-auto">
          {/* Edit Problem Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent blur-sm mb-4"></div>
            {/* Problem Details Section */}
            <div className="bg-gradient-to-br from-[#232946]/90 via-gray-900/90 to-gray-800/90 rounded-3xl shadow-2xl border border-gray-700/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FaBrain className="text-2xl text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Problem Details
                </h2>
              </div>
              {/* Two-column grid for main fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Title */}
    <div>
                  <label className="block text-gray-300 font-medium mb-2">Problem Title</label>
      <input
        name="title"
        value={problem.title}
        onChange={handleChange}
                    placeholder="Enter problem title..."
        required
                    className="w-full p-4 bg-gray-800/80 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 text-white placeholder-gray-400"
      />
    </div>
                {/* Difficulty */}
    <div>
                  <label className="block text-gray-300 font-medium mb-2">Difficulty Level</label>
                  <select
                    name="difficulty"
                    value={problem.difficulty}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-800/80 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 text-white"
                  >
                    <option value="Easy" className="text-green-400">🟢 Easy</option>
                    <option value="Medium" className="text-yellow-400">🟠 Medium</option>
                    <option value="Hard" className="text-red-400">🔴 Hard</option>
                  </select>
                </div>
                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-gray-300 font-medium mb-2">Problem Description</label>
      <textarea
        name="description"
        value={problem.description}
        onChange={handleChange}
                    placeholder="Describe the problem in detail..."
        required
                    rows={6}
                    className="w-full min-h-[120px] p-4 bg-gray-800/80 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 text-white placeholder-gray-400 resize-y"
      />
    </div>
                {/* Constraints */}
                <div className="md:col-span-2">
                  <label className="block text-gray-300 font-medium mb-2">Constraints (Optional)</label>
      <textarea
        name="constraints"
        value={problem.constraints}
        onChange={handleChange}
                    placeholder="Specify any constraints or limitations..."
                    rows={4}
                    className="w-full min-h-[80px] p-4 bg-gray-800/80 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 text-white placeholder-gray-400 resize-y"
      />
    </div>
              </div>
            </div>
            {/* Test Cases Section */}
            <div className="bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-[#232946]/90 rounded-3xl shadow-2xl border border-gray-700/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <HiOutlineCheck className="text-2xl text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                    Test Cases
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700/80 to-cyan-700/80 hover:from-blue-600/80 hover:to-cyan-600/80 text-blue-200 hover:text-white rounded-xl border border-blue-700 hover:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <HiOutlinePlus className="text-lg" />
                  <span className="font-semibold">Add Test Case</span>
                </button>
    </div>
              <div className="space-y-6">
                {problem.testCases.map((tc, index) => (
                  <div key={index} className="bg-gray-900/80 border border-gray-700 rounded-2xl p-6 space-y-4 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
                        <label className="block text-gray-400 mb-1">Input</label>
          <textarea
            value={tc.input}
                          onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                          placeholder="Test case input..."
            rows={3}
                          className="w-full min-h-[48px] p-3 bg-gray-800/80 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none text-white placeholder-gray-400 resize-y"
          />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Expected Output</label>
          <input
            value={tc.output}
                          onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                          placeholder="Expected output..."
                          className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 mb-1">Explanation <span className="text-gray-500">(optional)</span></label>
          <input
                          value={tc.explanation || ''}
                          onChange={(e) => handleTestCaseChange(index, 'explanation', e.target.value)}
                          placeholder="Explanation for this test case..."
                          className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none text-white placeholder-gray-400"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <label className="flex items-center gap-2 text-gray-300 cursor-pointer select-none">
  <input
    type="checkbox"
    checked={tc.hidden || false}
                            onChange={(e) => handleTestCaseChange(index, 'hidden', e.target.checked)}
                            className="form-checkbox h-5 w-5 text-blue-500 rounded focus:ring-blue-400/20 border-gray-600 bg-gray-800"
                          />
                          {tc.hidden ? (
                            <FaEyeSlash className="text-lg text-gray-400" />
                          ) : (
                            <FaEye className="text-lg text-gray-400" />
                          )}
                          <span className="text-sm">Hidden</span>
</label>
                      </div>
                    </div>
          {problem.testCases.length > 1 && (
            <button
              type="button"
              onClick={() => removeTestCase(index)}
                        className="absolute top-4 right-4 flex items-center gap-1 text-red-400 hover:text-red-200 bg-red-900/30 hover:bg-red-900/60 px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-150"
            >
                        <HiOutlineTrash className="text-base" /> Remove
            </button>
          )}
        </div>
      ))}
              </div>
            </div>
            {/* Test Environment */}
            <div className="bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-gray-900/80 rounded-3xl shadow-2xl border border-purple-700/40 p-8 mt-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <FaBrain className="text-2xl text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  Test Environment (Admin Only)
                </h2>
              </div>
              <div className="mb-4 flex gap-4 items-center">
                <label className="text-gray-300 font-medium">Language:</label>
                <select
                  value={adminLanguage}
                  onChange={handleLanguageChange}
                  className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
                >
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
              <CodeMirror
                value={adminCode}
                height="200px"
                theme="dark"
                extensions={
                  adminLanguage === "python"
                    ? [python()]
                    : adminLanguage === "java"
                    ? [java()]
                    : [cpp()]
                }
                onChange={setAdminCode}
                className="mb-4 border border-gray-700 rounded"
              />
              <button
                type="button"
                onClick={async () => {
                  setIsTesting(true);
                  setTestResults([]);
                  try {
                    const trimmedTestCases = problem.testCases.map(tc => ({ ...tc, input: (tc.input || '').trim() }));
                    const res = await axios.post("http://localhost:5000/api/admin/test-solution", {
                      code: adminCode,
                      language: adminLanguage,
                      testCases: trimmedTestCases,
                      problemTitle: problem.title,
                    }, {
                      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    });
                    setTestResults(res.data.results);
                    toast.success(res.data.verdict === "Accepted" ? "All test cases passed!" : "Some test cases failed.");
                  } catch (err) {
                    console.error('Admin test run error:', err);
                    toast.error("Test run failed. Please check your code and try again.");
                    setTestResults([]);
                  } finally {
                    setIsTesting(false);
                  }
                }}
                disabled={isTesting || !adminCode.trim() || !problem?.testCases?.length}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded text-white font-semibold shadow-lg disabled:opacity-50"
              >
                {isTesting ? "Running..." : "Run Against All Test Cases"}
      </button>
              {testResults.length > 0 && (
                <div className="mt-6">
                  <div className={`mb-4 text-lg font-bold ${testResults.every(r => r.verdict === 'Accepted') ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {testResults.every(r => r.verdict === 'Accepted')
                      ? '✅ All test cases passed!'
                      : '❌ Some test cases failed.'}
                  </div>
                  <div className="overflow-x-auto rounded-xl shadow border border-purple-700/30 bg-[#181c2f]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-purple-900/40 text-purple-200">
                          <th className="px-4 py-2">#</th>
                          <th className="px-4 py-2">Input</th>
                          <th className="px-4 py-2">Expected</th>
                          <th className="px-4 py-2">Output</th>
                          <th className="px-4 py-2">Verdict</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testResults.map((r, i) => (
                          <tr key={i} className="border-t border-purple-700/10 hover:bg-purple-900/10 transition">
                            <td className="px-4 py-2 text-center font-semibold text-purple-300">{i + 1}</td>
                            <td className="px-4 py-2 whitespace-pre-wrap text-blue-200 bg-[#232946]/40 rounded-lg">{r.input}</td>
                            <td className="px-4 py-2 whitespace-pre-wrap text-green-300 bg-[#20243a]/40 rounded-lg">{r.expected}</td>
                            <td className="px-4 py-2 whitespace-pre-wrap text-yellow-200 bg-[#232946]/40 rounded-lg">{r.output}</td>
                            <td className="px-4 py-2 text-center">
                              {r.verdict === 'Accepted' && (
                                <span className="inline-block px-3 py-1 rounded-full bg-green-900/40 text-green-400 font-bold">Accepted</span>
                              )}
                              {r.verdict === 'Wrong Answer' && (
                                <span className="inline-block px-3 py-1 rounded-full bg-red-900/40 text-red-400 font-bold">Wrong Answer</span>
                              )}
                              {r.verdict === 'TLE' && (
                                <span className="inline-block px-3 py-1 rounded-full bg-yellow-900/40 text-yellow-400 font-bold">TLE</span>
                              )}
                              {r.verdict === 'MLE' && (
                                <span className="inline-block px-3 py-1 rounded-full bg-orange-900/40 text-orange-400 font-bold">MLE</span>
                              )}
                              {r.verdict === 'Error' && (
                                <span className="inline-block px-3 py-1 rounded-full bg-gray-700/40 text-gray-300 font-bold">Error</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
    </div>
            {/* Update Problem Button */}
            <div className="flex justify-end mt-8">
    <button
      type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-3 rounded-xl text-white font-bold shadow-lg text-lg disabled:opacity-60 transition-all duration-200"
    >
                {loading ? "Updating..." : "Update Problem"}
    </button>
            </div>
  </form>
</div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
