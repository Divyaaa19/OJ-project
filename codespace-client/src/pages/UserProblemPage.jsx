import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Split from "react-split";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function UserProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [customCases, setCustomCases] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [outputs, setOutputs] = useState([]);
  const [verdicts, setVerdicts] = useState([]);
  const [selectedCase, setSelectedCase] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [submissions, setSubmissions] = useState([]);
  const [finalVerdict, setFinalVerdict] = useState("");
  const [newInput, setNewInput] = useState("");
  const [complexity, setComplexity] = useState("");
  const [loadingComplexity, setLoadingComplexity] = useState(false);
  const [newOutput, setNewOutput] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const [review, setReview] = useState("");

  const [complexityParts, setComplexityParts] = useState({
    time: "",
    space: "",
  });
  const [showComplexityModal, setShowComplexityModal] = useState(false);
  const [aiReview, setAIReview] = useState("");
  const [loadingReview, setLoadingReview] = useState(false);
  const [showReviewButton, setShowReviewButton] = useState(false);
  const [tcScEstimation, setTcScEstimation] = useState(""); // Add this

  const [language, setLanguage] = useState("cpp");
  const templates = {
    cpp: `#include <bits/stdc++.h>
  using namespace std;

  int main() {
      // your code goes here
      return 0;
  }`,
    c: `#include <stdio.h>

  int main() {
      // your code goes here
      return 0;
  }`,
    python: `# your code goes here
  def main():
      pass

  if __name__ == "__main__":
      main()`,
    java: `public class Main {
      public static void main(String[] args) {
          // your code goes here
      }
  }`,
  };
  const [code, setCode] = useState(templates["cpp"]); // initial template

  // Edge Cases state
  const [showEdgeCasesButton, setShowEdgeCasesButton] = useState(false);
  const [edgeCases, setEdgeCases] = useState("");
  const [loadingEdgeCases, setLoadingEdgeCases] = useState(false);
  const [showEdgeCasesModal, setShowEdgeCasesModal] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verdict memory per language
  const [verdictMemory, setVerdictMemory] = useState({}); // { [lang]: { verdicts, outputs, finalVerdict } }
  // Code memory per language
  const [codeMemory, setCodeMemory] = useState({}); // { [lang]: code }

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case "Accepted":
        return "text-green-400";
      case "Wrong Answer":
        return "text-red-400";
      case "TLE ⏰":
        return "text-yellow-400";
      case "MLE 🧠":
        return "text-orange-400";
      case "Error ❌":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const getComplexity = async () => {
    if (!code.trim()) return;
    setLoadingComplexity(true);
    setComplexity(""); // raw text
    setComplexityParts({ time: "", space: "" }); // structured
    setShowComplexityModal(false);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}api/ai/complexity`,
        { code, language },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const raw = res.data.complexity;
      setComplexity(raw);

      const timeMatch = raw.match(
        /Time Complexity:\s*(.*?)(?=\n|Space Complexity:|$)/i
      );
      const spaceMatch = raw.match(/Space Complexity:\s*(.*?)(?=\n|$)/i);

      setComplexityParts({
        time: timeMatch ? timeMatch[1].trim() : "Not found",
        space: spaceMatch ? spaceMatch[1].trim() : "Not found",
      });

      setShowComplexityModal(true);
    } catch (err) {
      console.error(err);
      setComplexity("❌ Failed to analyze complexity.");
      setComplexityParts({ time: "Error", space: "Error" });
    } finally {
      setLoadingComplexity(false);
    }
  };

  const getAIReview = async () => {
    setLoadingReview(true);
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}api/ai/review`,
        { code, language },
        {
          headers: {
          Authorization: `Bearer ${token}` },
    });

      let reviewText = res.data.review;

      // ✅ Convert to string safely
      if (typeof reviewText !== "string") {
        console.warn("AI Review is not a string:", reviewText);
        reviewText = JSON.stringify(reviewText, null, 2);
      }

      setAIReview(reviewText);
    } catch (err) {
      console.error("Error getting AI review:", err);
      setAIReview("⚠️ Failed to load AI review.");
    } finally {
      setLoadingReview(false);
    }
  };




  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    // Restore code for this language, or use template
    setCode(codeMemory[lang] || templates[lang]);
    // Restore verdicts/outputs/finalVerdict for this language, or reset
    const mem = verdictMemory[lang] || { verdicts: [], outputs: [], finalVerdict: "" };
    setVerdicts(mem.verdicts);
    setOutputs(mem.outputs);
    setFinalVerdict(mem.finalVerdict);
  };

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalCode, setModalCode] = useState("");

  const allInputs = [
    ...testCases.map((input) => ({ input })), // existing
    ...customCases, // already in { input, output } format
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${import.meta.env.VITE_API_URL}api/user/user-problems/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProblem(res.data);
        axios
          .get(`${import.meta.env.VITE_API_URL}api/user/submissions/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setSubmissions(res.data);

            // ✅ Check if any past submission is Accepted
            const hasAccepted = res.data.some(
              (s) => s.verdict?.toLowerCase() === "accepted"
            );
            if (hasAccepted) {
              setShowReviewButton(true);
            }
          })
          .catch((err) => console.error("Error fetching submissions:", err));
      })
      .catch((err) => console.error("Error fetching problem:", err));
  }, [id]);

  useEffect(() => {
    if (problem?.testCases) {
      const visible = problem.testCases.filter((tc) => !tc.hidden);
      setTestCases(visible.map((tc) => tc.input));
    }
  }, [problem]);

  const runCode = async () => {
    setIsRunning(true);
    const results = [];
    const verdictList = [];

    for (let i = 0; i < allInputs.length; i++) {
      const input = allInputs[i].input;
      let expected = "";
      if (i < problem.testCases.length) {
        expected = (problem.testCases[i].output || "").trim().replace(/\s+/g, " ");
      } else {
        expected = (customCases[i - problem.testCases.length]?.output || "").trim().replace(/\s+/g, " ");
      }
      try {
        const res = await axios.post(`${import.meta.env.VITE_COMPILER_URL}run`, {
          language,
          code,
          input: input.trim(),
        });
        const output = (res.data.output || "").trim().replace(/\s+/g, " ");
        let verdict = "";
        if (/time limit exceeded/i.test(output)) {
          verdict = "TLE ⏰";
        } else if (/memory limit exceeded/i.test(output)) {
          verdict = "MLE 🧠";
        } else if (output === expected) {
          verdict = "Accepted ✅";
        } else {
          verdict = "Wrong Answer ❌";
        }
        verdictList.push(verdict);
        results.push(output);
      } catch {
        results.push("Error");
        verdictList.push("Error ❌");
      }
    }
    setOutputs(results);
    setVerdicts(verdictList);
    setVerdictMemory((prev) => ({
      ...prev,
      [language]: {
        verdicts: verdictList,
        outputs: results,
        finalVerdict: "", // runCode does not set final verdict
      },
    }));
    if (selectedCase >= allInputs.length) setSelectedCase(0);
    setIsRunning(false);
  };

  const submitCode = async () => {
    setIsSubmitting(true);
      try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}api/user/submit`,
        {
          problemId: id,
          code,
          language,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Use the new backend response
      setVerdicts(res.data.verdicts);
      setOutputs([]); // No outputs for hidden cases
      if (res.data.allPassed) {
      setFinalVerdict("Accepted");
        setShowEdgeCasesButton(false);
        setShowEdgeCasesModal(false);
        setEdgeCases("");
        toast.success("✅ All test cases passed! Code submitted successfully.");
      await axios.post(
        `${import.meta.env.VITE_API_URL}api/user/mark-solved`,
        { problemId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const aiRes = await axios.post(
        `${import.meta.env.VITE_API_URL}api/ai/complexity`,
          { code, language },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTcScEstimation(aiRes.data.complexity);
        setShowReviewButton(true);
        const updated = await axios.get(
          `${import.meta.env.VITE_API_URL}api/user/submissions/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubmissions(updated.data);
        setActiveTab("submissions");
      } else {
        setFinalVerdict("");
        setShowEdgeCasesButton(true);
        setShowEdgeCasesModal(false);
        setEdgeCases("");
        toast.error("❌ Some test cases failed. Please try again.");
        const updated = await axios.get(
          `${import.meta.env.VITE_API_URL}api/user/submissions/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubmissions(updated.data);
        setActiveTab("submissions");
      }
      setVerdictMemory((prev) => ({
        ...prev,
        [language]: {
          verdicts: res.data.verdicts,
          outputs: [],
          finalVerdict: res.data.allPassed ? "Accepted" : "",
        },
      }));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setIsSubmitting(false), 1000);
    }
  };

  const handleShowEdgeCases = async () => {
    setLoadingEdgeCases(true);
    setShowEdgeCasesModal(true);
    setEdgeCases("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}api/ai/edge-cases`,
        {
          code,
          language,
          prompt: problem.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Edge cases API response:", res.data);
      setEdgeCases(res.data.edgeCases || "No edge cases found.");
      if (!res.data.edgeCases || !res.data.edgeCases.trim()) {
        setTimeout(() => setShowEdgeCasesModal(false), 2000);
      }
    } catch (err) {
      console.error("Edge cases API error:", err);
      setEdgeCases("⚠️ Failed to fetch edge cases.");
      setTimeout(() => setShowEdgeCasesModal(false), 2000);
    } finally {
      setLoadingEdgeCases(false);
    }
  };

  function ensureBulletedList(text) {
    if (!text) return "";
    text = text.replace(/\r\n/g, '\n');
    if (/^\s*[-*]\s+/m.test(text)) return text;
    let lines = text.split('\n');
    if (lines.length === 1) {
      if (text.includes('. ')) {
        lines = text.split('. ');
      } else if (text.includes('; ')) {
        lines = text.split('; ');
      }
    }
    const list = lines
      .map(line => {
        const trimmed = line.trim().replace(/^[\d\-\*\.]+\s*/, '');
        return trimmed ? `- ${trimmed}` : '';
      })
      .join('\n');
    return '\n' + list;
  }

  // When user edits code, update code and codeMemory
  const handleCodeChange = (val) => {
    setCode(val);
    setCodeMemory((prev) => ({ ...prev, [language]: val }));
  };

  if (!problem) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="h-screen w-screen text-white bg-gradient-to-br from-[#0f172a] via-[#181c2f] to-[#232946] flex">
      <ToastContainer position="top-center" autoClose={3000} />
      {/* Back Arrow */}
      <button
        onClick={() => navigate("/user-dashboard")}
        className="absolute top-6 left-6 z-50 flex items-center text-blue-300 hover:text-blue-400 p-1 transition-all duration-200"
        title="Back to Dashboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <Split
        className="flex h-full w-full min-h-0 overflow-hidden"
        sizes={[40, 60]}
        minSize={300}
        direction="horizontal"
        gutterSize={8}
        style={{ display: "flex", height: "100%" }}
      >
        {/* Left Panel: Problem Description & Submissions */}
        <div className="overflow-auto p-8 bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl m-4 border border-blue-700/30">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setActiveTab("description")}
              className={`text-base font-semibold border-b-2 px-4 pb-2 transition-all duration-200 rounded-t-lg shadow-sm
                ${activeTab === "description"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-blue-200 hover:text-blue-300"}
              `}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`text-base font-semibold border-b-2 px-4 pb-2 transition-all duration-200 rounded-t-lg shadow-sm
                ${activeTab === "submissions"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-blue-200 hover:text-blue-300"}
              `}
            >
              Submissions
            </button>
          </div>

          {activeTab === "description" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 text-transparent bg-clip-text drop-shadow-lg">
                  {problem.title}
                </h2>
                <span
                  className="text-sm font-bold px-4 py-1 rounded-full capitalize border border-blue-700/30 shadow-sm"
                  style={{
                    backgroundColor:
                      problem.difficulty === "Easy"
                        ? "rgba(34, 197, 94, 0.08)"
                        : problem.difficulty === "Medium"
                        ? "rgba(234, 179, 8, 0.08)"
                        : "rgba(239, 68, 68, 0.08)",
                    color:
                      problem.difficulty === "Easy"
                        ? "rgb(34, 197, 94)"
                        : problem.difficulty === "Medium"
                        ? "rgb(234, 179, 8)"
                        : "rgb(239, 68, 68)",
                  }}
                >
                  {problem.difficulty}
                </span>
              </div>
              <p className="mb-4 text-blue-100/90 text-lg leading-relaxed" style={{ whiteSpace: "pre-wrap" }}>
                  {problem.description}
              </p>
              <h3 className="text-xl font-bold mb-2 text-blue-300">Constraints</h3>
              <div className="prose prose-invert max-w-none text-blue-200/80 mb-4 text-base">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{problem.constraints}</ReactMarkdown>
                </div>
              <h3 className="text-xl font-bold mb-2 text-blue-300">Examples</h3>
              {problem.testCases?.filter((tc) => !tc.hidden).map((tc, i) => (
                      <div
                        key={i}
                  className="mb-3 p-4 bg-blue-400/10 rounded-xl text-base text-blue-100 border border-blue-700/20 shadow-sm"
                >
                  <p style={{ whiteSpace: "pre-wrap" }}>
                    <strong>Input:</strong>
                    <br />
                    {tc.input}
                  </p>
                  <p className="mt-2" style={{ whiteSpace: "pre-wrap" }}>
                    <strong>Output:</strong>
                    <br />
                    {tc.output}
                  </p>
                        {tc.explanation && (
                    <p className="mt-2">
                      <strong>Explanation:</strong> {tc.explanation}
                    </p>
                        )}
                      </div>
                    ))}
            </>
          )}

          {activeTab === "submissions" && (
            <div className="text-base text-blue-100">
              {submissions.length === 0 ? (
                <p>No submissions yet.</p>
              ) : (
                <table className="w-full mt-4 text-left text-base rounded-2xl overflow-hidden shadow-2xl border border-blue-700/30 bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-xl">
                  <thead className="bg-blue-900/40 text-blue-300 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-4 py-3">No.</th>
                      <th className="px-4 py-3">Language</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Code</th>
                      </tr>
                    </thead>
                  <tbody className="text-blue-100">
                      {submissions.map((sub, idx) => (
                        <tr
                          key={sub._id}
                        className="hover:bg-blue-400/10 transition duration-150 border-t border-blue-700/20"
                        >
                        <td className="px-4 py-3 font-semibold">{idx + 1}</td>
                        <td className="px-4 py-3 capitalize">{sub.language}</td>
                        <td className="px-4 py-3">
                          {dayjs(sub.timestamp).tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss")}
                          </td>
                        <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setModalCode(sub.code);
                                setShowModal(true);
                              }}
                            className="text-blue-400 hover:text-blue-100 hover:underline font-semibold"
                            >
                              View Code
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              )}
            </div>
          )}
        </div>

        {/* Right Panel: Code Editor, Actions, Test Cases */}
        <Split
          className="flex flex-col w-full min-h-0"
          sizes={[60, 40]}
          direction="vertical"
          gutterSize={8}
          gutter={(index, direction) => {
            const gutter = document.createElement("div");
            gutter.className = `gutter gutter-${direction}`;
            return gutter;
          }}
          style={{ flex: 1, minHeight: 0 }}
        >
          <div className="flex flex-col h-full p-6 bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 rounded-2xl shadow-2xl border border-blue-700/30">
            <div className="flex-none p-2 flex justify-between items-center">
              <select
                className="bg-gray-900/80 text-blue-200 px-4 py-2 rounded border border-blue-700/30 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={language}
                onChange={handleLanguageChange}
              >
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
              <div className="flex-1 flex items-center justify-center">
                {isRunning && (
                  <span className="text-blue-400 font-semibold animate-pulse">Running code...</span>
                )}
                {isSubmitting && (
                  <span className="text-green-400 font-semibold animate-pulse">Submitting code...</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Run Button */}
                <button
                  onClick={runCode}
                  className="px-6 py-2 rounded-lg text-white font-semibold shadow transition bg-gradient-to-tr from-blue-700 via-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-300 hover:scale-105 border border-blue-700/30"
                  disabled={isRunning || isSubmitting}
                >
                  Run
                </button>
                {/* Submission/AI Buttons Row */}
                <div className="flex gap-2 items-center">
                <button
                  onClick={submitCode}
                    className="px-6 py-2 rounded-lg text-white font-semibold shadow transition bg-gradient-to-tr from-green-700 via-green-500 to-green-400 hover:from-green-600 hover:to-green-300 hover:scale-105 border border-green-700/30"
                    disabled={isRunning || isSubmitting}
                >
                  Submit
                </button>
                {finalVerdict === "Accepted" && (
                  <button
                    onClick={getComplexity}
                    title="Analyze Time & Space Complexity"
                      className="p-2 rounded-full shadow bg-gradient-to-tr from-purple-600 to-pink-500 hover:opacity-90 hover:scale-105 transition flex items-center justify-center border border-purple-700 mt-1"
                      aria-label="complexity"
                      disabled={isRunning || isSubmitting}
                    >
                      <span className="text-lg">🧠</span>
                    </button>
                  )}
                  {showEdgeCasesButton && !finalVerdict && (
                    <button
                      onClick={handleShowEdgeCases}
                      title="Show Possible Edge Cases"
                      className="p-2 rounded-full shadow bg-gradient-to-tr from-yellow-500 to-yellow-700 hover:opacity-90 hover:scale-105 transition flex items-center justify-center border border-yellow-700 mt-1"
                      aria-label="edge-cases"
                      disabled={loadingEdgeCases || isRunning || isSubmitting}
                    >
                      <span className="text-lg">🧩</span>
                  </button>
                )}
              </div>
            </div>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden p-2 bg-gray-900/80 rounded-xl shadow mt-2 border border-blue-700/20">
              <div className="h-full overflow-auto">
                <CodeMirror
                  value={code}
                  theme="dark"
                  height="100%"
                  extensions={
                    language === "python"
                      ? [python()]
                      : language === "java"
                      ? [java()]
                      : [cpp()]
                  }
                  onChange={handleCodeChange}
                  basicSetup={{ lineNumbers: true }}
                />
              </div>
            </div>
            {loadingComplexity && (
              <p className="text-blue-300 mt-3 animate-pulse">
                Analyzing complexity...
              </p>
            )}
          </div>

          {/* Test Cases Panel */}
          <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 h-full p-6 shadow m-4 rounded-2xl border border-blue-700/30 overflow-y-auto max-h-[calc(100vh-120px)]">
            <h3 className="text-xl font-bold mb-4 text-blue-300">Test Cases</h3>

            {finalVerdict === "Accepted" ? (
              <div className="bg-blue-400/10 p-6 rounded shadow-md border border-green-700/30">
                <h2 className="text-green-400 text-xl font-semibold mb-4">
                  ✅ Result: Accepted
                  </h2>
                <div className="text-sm text-blue-200 mb-3">
                  Total Passed: {" "}
                  <span className="text-green-300">
                    {problem.testCases?.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {verdicts.map((verdict, idx) => (
                    <div
                      key={idx}
                      className={`bg-green-600/20 text-green-300 px-4 py-2 rounded shadow-sm text-sm font-medium border border-green-300/30`}
                    >
                      Test Case {idx + 1}
                    </div>
                  ))}
                </div>
                {(showReviewButton || finalVerdict === "Accepted") && (
                  <div className="...">
                    {!aiReview && (
                      <button
                        onClick={getAIReview}
  className="bg-gradient-to-tr from-purple-600 to-pink-500 mt-3 hover:from-purple-500 hover:to-pink-400 text-white px-4 py-2 rounded shadow-md text-sm font-semibold transition transform hover:scale-[1.02] border border-purple-700"
                      >
                        <span className="mr-1 animate-pulse">🧠</span> Review Code
                      </button>


                    )}

                  </div>
                )}

          

                {loadingReview && (
                  <p className="text-purple-400 mt-3 animate-pulse">
                    Analyzing code...
                  </p>
                )}
                {aiReview && typeof aiReview === "string" && (
                  <div className="mt-4 bg-gradient-to-br from-purple-900/80 via-pink-900/80 to-gray-900/80 border border-purple-700 rounded-xl p-5 text-white shadow-xl max-h-[350px] overflow-y-auto">
                    <h4 className="text-purple-400 text-xl font-bold mb-4">
                      🤖 AI Code Review
                    </h4>

                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
        <p className="text-blue-100 leading-relaxed mb-3">{children}</p>
                        ),
                        li: ({ children }) => (
        <li className="text-blue-100 list-disc ml-6 mb-2">{children}</li>
                        ),
                        h1: ({ children }) => (
        <h1 className="text-2xl font-bold text-blue-100 mb-3 mt-4 border-b border-blue-300 pb-1">{children}</h1>
                        ),
                        h2: ({ children }) => (
        <h2 className="text-lg font-semibold text-blue-100 mt-4 mb-2 underline decoration-blue-300">{children}</h2>
                        ),
                        code: ({ children }) => (
        <code className="bg-[#101624] px-1 py-0.5 rounded text-blue-300 text-sm font-mono border border-blue-300/20">{children}</code>
                        ),
                        pre: ({ children }) => (
        <pre className="bg-[#101624] p-3 rounded-lg overflow-auto text-sm text-blue-100 font-mono mb-3 border border-blue-300/20">
                            {children}
                          </pre>
                        ),
                      }}
                    >
                      {aiReview}
                    </ReactMarkdown>
                  </div>


                )}

              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-3">
                  {allInputs.map((input, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedCase(idx)}
                      className={`relative px-3 py-1.5 rounded cursor-pointer text-sm border border-blue-300/20 transition-all duration-150 font-semibold ${
                          idx === selectedCase
                          ? "bg-blue-300/20 text-blue-100 border-blue-300"
                          : "bg-[#101624] text-blue-200 hover:bg-blue-300/10"
                        }`}
                    >
                      Case {idx + 1}
                      {idx >= testCases.length && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const updated = [...customCases];
                            updated.splice(idx - testCases.length, 1);
                            setCustomCases(updated);
                            if (selectedCase >= allInputs.length - 1) {
                              setSelectedCase(Math.max(0, selectedCase - 1));
                            }
                          }}
                          className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 text-red-400 hover:text-red-600 text-[10px] font-bold"
                        >
                          ✖
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setShowAddInput(true)}
                    className="px-3 py-1.5 text-sm bg-blue-300/20 hover:bg-blue-300/30 text-blue-100 rounded border border-blue-300/20"
                  >
                    ➕ Add Testcase
                  </button>
                </div>

                {/* New Testcase Input */}
                {showAddInput ? (
                  <div className="bg-[#101624] p-4 rounded mb-4 space-y-3 border border-blue-300/20">
                    <textarea
                      className="w-full bg-[#101624] text-blue-100 border border-blue-300/20 p-3 rounded text-sm shadow-sm"
                      rows="1"
                      placeholder="Enter custom input..."
                      value={newInput}
                      onChange={(e) => setNewInput(e.target.value)}
                    />
                    <textarea
                      className="w-full bg-[#101624] text-blue-100 border border-blue-300/20 p-3 rounded text-sm shadow-sm"
                      rows="1"
                      placeholder="Enter expected output..."
                      value={newOutput}
                      onChange={(e) => setNewOutput(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (newInput.trim() && newOutput.trim()) {
                            setCustomCases([
                              ...customCases,
                              {
                                input: newInput.trim(),
                                output: newOutput.trim(),
                              },
                            ]);
                            setNewInput("");
                            setNewOutput("");
                            setShowAddInput(false);
                            setSelectedCase(allInputs.length); // select new one
                          }
                        }}
                        className="bg-blue-300/30 hover:bg-blue-300/50 px-4 py-1 rounded text-sm text-blue-100 border border-blue-300/20"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => {
                          setNewInput("");
                          setNewOutput("");
                          setShowAddInput(false);
                        }}
                        className="bg-red-600/30 hover:bg-red-600/50 px-4 py-1 rounded text-sm text-blue-100 border border-red-400/20"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Show only selected test case when not adding
                  <div className="bg-[#101624] rounded p-4 mt-4 border border-blue-300/20 shadow-sm text-sm text-blue-100">
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      <strong>Input:</strong>
                      <br />
                      {allInputs[selectedCase]?.input ||
                        allInputs[selectedCase]}
                    </p>
                    <p className="mt-2 text-blue-300">
                      <strong>Output:</strong> {outputs[selectedCase] ?? "Run to see output"}
                    </p>
                    {verdicts[selectedCase] && (
                      <p
                        className={`mt-2 font-semibold ${
                            verdicts[selectedCase].includes("Accepted")
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                        Verdict: {verdicts[selectedCase]}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
            
          </div>
        </Split>
      </Split>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#1a1a1a] text-white w-3/4 max-h-[80vh] overflow-y-auto p-6 rounded shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Submitted Code</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-red-400 hover:text-red-600 text-xl"
              >
                &times;
              </button>
            </div>
            <pre className="bg-[#0d0d0d] p-4 rounded overflow-auto whitespace-pre-wrap text-sm">
              {modalCode}
            </pre>
          </div>
        </div>
      )}
      {showComplexityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#1a1a1a] transition-transform duration-300 scale-100 text-white w-[90%] md:w-[60%] p-6 rounded-lg shadow-lg border border-blue-700 relative">
            <button
              onClick={() => setShowComplexityModal(false)}
              className="absolute top-3 right-4 text-red-400 hover:text-red-600 text-xl font-bold"
            >
              &times;
            </button>
            <div className="flex items-center mb-4 space-x-2">
              <span className="text-xl">📊</span>
              <h2 className="text-lg font-semibold text-blue-400">
                Complexity Analysis
              </h2>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="bg-[#2a2a2a] p-4 rounded border border-blue-500/30 shadow-sm">
                <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                  📘 Time Complexity
                </h3>
                <ul className="list-disc list-inside text-gray-300 leading-relaxed">
                  {complexityParts.time
                    .split(/(?<=\.)\s+/)
                    .map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                </ul>
              </div>

              <div className="bg-[#2a2a2a] p-4 rounded border border-purple-500/30 shadow-sm">
                <h3 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  💾 Space Complexity
                </h3>
                <ul className="list-disc list-inside text-gray-300 leading-relaxed">
                  {complexityParts.space
                    .split(/(?<=\.)\s+/)
                    .map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))} 
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edge Cases Modal */}
      {showEdgeCasesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#1a1a1a] transition-transform duration-300 scale-100 text-white w-[90%] md:w-[60%] p-6 rounded-lg shadow-lg border border-yellow-700 relative">
            <button
              onClick={() => setShowEdgeCasesModal(false)}
              className="absolute top-3 right-4 text-red-400 hover:text-red-600 text-xl font-bold"
            >
              &times;
            </button>
            <div className="flex items-center mb-4 space-x-2">
              <span className="text-xl">🧩</span>
              <h2 className="text-lg font-semibold text-yellow-400">
                Possible Edge Cases
              </h2>
            </div>
            <div className="space-y-4 text-sm text-gray-300">
              <div className="bg-[#2a2a2a] p-4 rounded border border-yellow-500/30 shadow-sm">
                {loadingEdgeCases ? (
                  <div className="text-yellow-200">Generating edge cases...</div>
                ) : edgeCases && edgeCases.trim() ? (
                  <div className="prose prose-invert max-w-none text-yellow-100">
                    <ReactMarkdown>{edgeCases}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-yellow-200">No edge cases found or failed to fetch edge cases.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
