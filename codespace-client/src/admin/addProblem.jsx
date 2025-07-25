import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineTrash, HiOutlineCheck } from "react-icons/hi";
import { FaBrain, FaEye, FaEyeSlash } from "react-icons/fa";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddProblem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState({
    title: "",
    description: "",
    constraints: "",
    difficulty: "Easy",
    testCases: [{ input: "", output: "", explanation: "", hidden: false }],
  });
  const [adminCode, setAdminCode] = useState('');
  const [adminLanguage, setAdminLanguage] = useState('cpp');
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const codeTemplates = {
    cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}`,
    c: `#include <stdio.h>\n\nint main() {\n    // your code here\n    return 0;\n}`,
    python: `# your code here\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()`,
    java: `public class Main {\n    public static void main(String[] args) {\n        // your code here\n    }\n}`,
  };

  useEffect(() => {
    if (!adminCode) {
      setAdminCode(codeTemplates['cpp']);
    }
    // eslint-disable-next-line
  }, []);

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
      testCases: [
        ...problem.testCases,
        { input: "", output: "", explanation: "", hidden: false },
      ],
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

      await axios.post(
        `${import.meta.env.VITE_API_URL}api/admin/problems`,
        cleanedProblem,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Problem added successfully!");
      navigate("/admin-dashboard");
    } catch (err) {
      toast.error("Failed to add problem. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "text-green-400";
      case "Medium": return "text-yellow-400";
      case "Hard": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const handleLanguageChange = (e) => {
    setAdminLanguage(e.target.value);
    setAdminCode(codeTemplates[e.target.value]);
  };

  const runAdminTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}api/admin/test-solution`,
        {
          code: adminCode,
          language: adminLanguage,
          testCases: problem.testCases,
          problemTitle: problem.title,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTestResults(res.data.results);
      toast.success(res.data.verdict === "Accepted" ? "All test cases passed!" : "Some test cases failed.");
    } catch (err) {
      toast.error("Test run failed. Please check your code and try again.");
      setTestResults([]);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#181c2f] to-[#232946] text-white">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-cyan-900/20"></div>
        <div className="relative p-8 lg:p-12">
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
                Add New <span className="text-blue-400">Problem</span>
              </h1>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2/3 h-2 bg-gradient-to-r from-blue-400/40 via-cyan-300/30 to-purple-400/40 blur-lg rounded-full pointer-events-none"></div>
            </div>
            <p className="mt-3 text-base text-gray-300 max-w-xl mx-auto">
              Create a new coding problem with comprehensive test cases and detailed specifications.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 lg:px-12 pb-12 mt-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
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

                            <div className="space-y-6">
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
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="block text-gray-300 font-medium mb-2">Problem Description</label>
        <textarea
          name="description"
          value={problem.description}
          onChange={handleChange}
                  placeholder="Describe the problem in detail..."
          required
                  rows={6}
                  className="w-full p-4 bg-gray-800/80 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 text-white placeholder-gray-400 resize-vertical"
        />
              </div>

              {/* Constraints */}
              <div className="mt-6">
                <label className="block text-gray-300 font-medium mb-2">Constraints (Optional)</label>
        <textarea
          name="constraints"
          value={problem.constraints}
          onChange={handleChange}
                  placeholder="Specify any constraints or limitations..."
                  rows={4}
                  className="w-full p-4 bg-gray-800/80 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 text-white placeholder-gray-400 resize-vertical"
                />
              </div>
            </div>

            {/* Test Cases Section */}
            <div className="bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-[#232946]/90 rounded-3xl shadow-2xl border border-gray-700/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <HiOutlineCheck className="text-2xl text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    Test Cases
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:transform hover:scale-105"
                >
                  <HiOutlinePlus className="text-lg" />
                  Add Test Case
                </button>
              </div>

              <div className="space-y-6">
        {problem.testCases.map((tc, index) => (
                  <div key={index} className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-300">
                        Test Case #{index + 1}
                      </h3>
                      {problem.testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTestCase(index)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          <HiOutlineTrash className="text-sm" />
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Input */}
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Input</label>
            <textarea
              value={tc.input}
                          onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                          placeholder="Enter test case input..."
                          rows={4}
                          className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 text-white placeholder-gray-400 font-mono text-sm resize-vertical"
                        />
                      </div>

                      {/* Output */}
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Expected Output</label>
                        <textarea
              value={tc.output}
                          onChange={(e) => handleTestCaseChange(index, "output", e.target.value)}
                          placeholder="Enter expected output..."
                          rows={4}
                          className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 text-white placeholder-gray-400 font-mono text-sm resize-vertical"
            />
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="mt-4">
                      <label className="block text-gray-300 font-medium mb-2">Explanation (Optional)</label>
                      <textarea
              value={tc.explanation}
                        onChange={(e) => handleTestCaseChange(index, "explanation", e.target.value)}
                        placeholder="Explain the test case logic..."
                        rows={3}
                        className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 text-white placeholder-gray-400 resize-vertical"
            />
                    </div>

                    {/* Hidden Test Case Toggle */}
                    <div className="mt-4">
                      <label className="flex items-center gap-3 text-gray-300 font-medium cursor-pointer">
  <input
    type="checkbox"
    checked={tc.hidden || false}
    onChange={(e) => handleTestCaseChange(index, "hidden", e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500 focus:ring-2"
  />
                        <div className="flex items-center gap-2">
                          {tc.hidden ? <FaEyeSlash className="text-red-400" /> : <FaEye className="text-green-400" />}
                          <span>{tc.hidden ? "Hidden Test Case" : "Visible Test Case"}</span>
                        </div>
</label>
                      <p className="text-sm text-gray-400 mt-1 ml-7">
                        {tc.hidden ? "This test case will be hidden from users during practice." : "This test case will be visible to users."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Test Environment Section */}
            <div className="bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-gray-900/80 rounded-3xl shadow-2xl border border-purple-700/40 p-8 mt-8">
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
                onClick={runAdminTests}
                disabled={isTesting || !adminCode.trim() || problem.testCases.length === 0}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded text-white font-semibold shadow-lg disabled:opacity-50"
              >
                {isTesting ? "Running..." : "Run Against All Test Cases"}
              </button>
              {testResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-purple-300 mb-2">Test Results</h3>
                  <table className="w-full text-sm border border-purple-700/30 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-purple-900/40">
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Input</th>
                        <th className="px-3 py-2">Expected</th>
                        <th className="px-3 py-2">Output</th>
                        <th className="px-3 py-2">Verdict</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testResults.map((r, i) => (
                        <tr key={i} className="border-t border-purple-700/10">
                          <td className="px-3 py-2 text-center">{i + 1}</td>
                          <td className="px-3 py-2 whitespace-pre-wrap">{r.input}</td>
                          <td className="px-3 py-2 whitespace-pre-wrap">{r.expected}</td>
                          <td className="px-3 py-2 whitespace-pre-wrap">{r.output}</td>
                          <td className={`px-3 py-2 font-bold ${r.verdict === "Accepted" ? "text-green-400" : "text-red-400"}`}>{r.verdict}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            )}
          </div>

            {/* Submit Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          type="button"
                onClick={() => navigate("/admin-dashboard")}
                className="flex-1 sm:flex-none px-8 py-4 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 font-medium"
        >
                Cancel
        </button>
        <button
          type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Problem...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <HiOutlineCheck className="text-xl" />
                    Create Problem
                  </div>
                )}
        </button>
            </div>
      </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
