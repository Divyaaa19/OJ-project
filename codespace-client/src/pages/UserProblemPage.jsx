import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Split from "react-split";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import ReactMarkdown from "react-markdown";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function UserProblemPage() {
  const { id } = useParams();
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
        "http://localhost:5000/api/ai/complexity",
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
      "http://localhost:5000/api/ai/review",
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
    setCode(templates[lang]);
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
      .get(`http://localhost:5000/api/user/user-problems/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProblem(res.data);
        axios
          .get(`http://localhost:5000/api/user/submissions/${id}`, {
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
        const res = await axios.post("http://localhost:8000/run", {
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
    if (selectedCase >= allInputs.length) setSelectedCase(0);
    setIsRunning(false);
  };

  const submitCode = async () => {
    setIsSubmitting(true);
    if (!problem?.testCases) return;
    const allCases = problem.testCases;
    const results = [];
    const verdictList = [];

    for (let i = 0; i < allCases.length; i++) {
      const { input, output: expectedRaw } = allCases[i];
      try {
        const res = await axios.post("http://localhost:8000/run", {
          language,
          code,
          input: input.trim(),
        });
        const output = (res.data.output || "").trim().replace(/\s+/g, " ");
        const expected = (expectedRaw || "").trim().replace(/\s+/g, " ");
        let verdict = "";
        if (/time limit exceeded/i.test(output)) {
          verdict = "TLE ⏰";
        } else if (/memory limit exceeded/i.test(output)) {
          verdict = "MLE 🧠";
        } else if (output === expected) {
          verdict = "Accepted";
        } else {
          verdict = "Wrong Answer";
        }
        results.push({ input, output, expected, verdict });
        verdictList.push(verdict);
      } catch {
        results.push({
          input,
          output: "Error",
          expected: "",
          verdict: "Error ❌",
        });
        verdictList.push("Error ❌");
      }
    }

    setOutputs(results.map(r => r.output));
    setVerdicts(verdictList);

    const allAccepted = verdictList.every((v) => v === "Accepted");

    if (allAccepted) {
      setFinalVerdict("Accepted");
      setShowEdgeCasesButton(false); // Hide edge cases button on success
      setShowEdgeCasesModal(false); // Hide modal on success
      setEdgeCases("");
      alert("✅ All test cases passed! Code submitted successfully.");
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/user/mark-solved",
        { problemId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // After marking problem as solved:
      const aiRes = await axios.post(
        "http://localhost:5000/api/ai/complexity",
        {
          code,
          language,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTcScEstimation(aiRes.data.complexity); // Save to state
      setShowReviewButton(true);
      console.log("📦 showReviewButton is now true");
      console.log("📦 Submissions length:", submissions.length);

      await axios.post(
        "http://localhost:5000/api/user/submit",
        {
          problemId: id,
          code,
          language,
          verdict: "Accepted",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = await axios.get(
        `http://localhost:5000/api/user/submissions/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissions(updated.data);
      setActiveTab("submissions");
    } else {
      setFinalVerdict("");
      setShowEdgeCasesButton(true); // Show edge cases button on failure
      setShowEdgeCasesModal(false); // Hide modal until button is clicked
      setEdgeCases("");
      alert("❌ Some test cases failed. Please try again.");
      
      // Save failed submission
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/user/submit",
        {
          problemId: id,
          code,
          language,
          verdict: "Wrong Answer",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    setIsSubmitting(false);
  };

  const handleShowEdgeCases = async () => {
    setLoadingEdgeCases(true);
    setShowEdgeCasesModal(true);
    setEdgeCases("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/ai/edge-cases",
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

  if (!problem) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="h-screen w-screen text-white flex" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
      <Split
        className="flex h-full w-full min-h-0 overflow-hidden"
        sizes={[40, 60]}
        minSize={300}
        direction="horizontal"
        gutterSize={8}
        style={{ display: "flex", height: "100%" }}
      >
        <div className="overflow-auto p-8 bg-[#101624]/80 backdrop-blur-xl rounded-2xl shadow-2xl m-4 border border-cyan-300/30">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setActiveTab("description")}
              className={`text-sm font-semibold border-b-2 px-2 pb-1 transition-all duration-200 ${
                activeTab === "description"
                  ? "border-cyan-300 text-cyan-300 bg-cyan-300/10 rounded-t"
                  : "border-transparent text-cyan-200 hover:text-cyan-300"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`text-sm font-semibold border-b-2 px-2 pb-1 transition-all duration-200 ${
                activeTab === "submissions"
                  ? "border-cyan-300 text-cyan-300 bg-cyan-300/10 rounded-t"
                  : "border-transparent text-cyan-200 hover:text-cyan-300"
              }`}
            >
              Submissions
            </button>
          </div>

          {activeTab === "description" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold mb-2 text-cyan-300 drop-shadow">{problem.title}</h2>
                <span
                  className="text-sm font-medium px-3 py-1 rounded-full capitalize border border-cyan-300/40"
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
              <p
                className="mb-4 text-cyan-100/90"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {problem.description}
              </p>
              <h3 className="text-lg font-semibold mb-2 text-cyan-300">Constraints</h3>
              <ul className="list-disc list-inside text-cyan-200/80 mb-4">
                {problem.constraints?.split("\n").map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              <h3 className="text-lg font-semibold mb-2 text-cyan-300">Examples</h3>
              {problem.testCases
                ?.filter((tc) => !tc.hidden)
                .map((tc, i) => (
                  <div
                    key={i}
                    className="mb-3 p-3 bg-cyan-300/10 rounded text-sm text-cyan-100 border border-cyan-300/20"
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
            <div className="text-sm text-cyan-100">
              {submissions.length === 0 ? (
                <p>No submissions yet.</p>
              ) : (
                <table className="w-full mt-4 text-left text-sm rounded-2xl overflow-hidden shadow-2xl border border-cyan-300/30 bg-[#101624]/80 backdrop-blur-xl">
                  <thead className="bg-cyan-300/10 text-cyan-300 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-4 py-3">No.</th>
                      <th className="px-4 py-3">Language</th>
                      <th className="p-4 font-bold">Verdict</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Code</th>
                    </tr>
                  </thead>
                  <tbody className="text-cyan-100">
                    {submissions.map((sub, idx) => (
                      <tr
                        key={sub._id}
                        className="hover:bg-cyan-300/10 transition duration-150 border-t border-cyan-300/20"
                      >
                        <td className="px-4 py-3 font-semibold">{idx + 1}</td>
                        <td className="px-4 py-3 capitalize">{sub.language}</td>
                        <td className="px-4 py-3">
                          {dayjs(sub.timestamp)
                            .tz("Asia/Kolkata")
                            .format("DD-MM-YYYY HH:mm:ss")}
                        </td>
                        

                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setModalCode(sub.code);
                              setShowModal(true);
                            }}
                            className="text-cyan-300 hover:text-cyan-100 hover:underline font-semibold"
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

          <div className="flex flex-col h-full p-4 bg-[#101624]/80 rounded-2xl shadow-2xl border border-cyan-300/30">
            <div className="flex-none p-2 flex justify-between items-center">
              <select
                className="bg-gray-800 text-white px-4 py-2 rounded"
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
                  className="px-6 py-2 rounded-lg text-white font-semibold shadow transition 
                    bg-gradient-to-tr from-blue-700 via-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-300 hover:scale-105 border border-blue-500/30"
                  disabled={isRunning || isSubmitting}
                >
                  Run
                </button>
                {/* Submission/AI Buttons Row - removed mt-4 for alignment */}
                <div className="flex gap-2 items-center">
                  <button
                    onClick={submitCode}
                    className="px-6 py-2 rounded-lg text-white font-semibold shadow transition 
                      bg-gradient-to-tr from-green-700 via-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-300 hover:scale-105 border border-green-500/30"
                    disabled={isRunning || isSubmitting}
                  >
                    Submit
                  </button>
                  {/* Show only one of the two buttons: complexity or edge cases */}
                  {finalVerdict === "Accepted" && (
                    <button
                      onClick={getComplexity}
                      title="Analyze Time & Space Complexity"
                      className="p-2 rounded-full shadow bg-gradient-to-tr from-purple-600 to-pink-500 hover:opacity-90 hover:scale-105 transition flex items-center justify-center"
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
                      className="p-2 rounded-full shadow bg-gradient-to-tr from-yellow-500 to-yellow-700 hover:opacity-90 hover:scale-105 transition flex items-center justify-center"
                      aria-label="edge-cases"
                      disabled={loadingEdgeCases || isRunning || isSubmitting}
                    >
                      <span className="text-lg">🧩</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden p-2 bg-[#101624] rounded-xl shadow mt-2 border border-cyan-300/20">
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
                  onChange={(val) => setCode(val)}
                  basicSetup={{ lineNumbers: true }}
                />
              </div>
            </div>
            {loadingComplexity && (
              <p className="text-cyan-300 mt-3 animate-pulse">
                Analyzing complexity...
              </p>
            )}
          </div>

          <div className="bg-[#101624]/80 h-full p-4 shadow m-4 rounded-2xl border border-cyan-300/30 overflow-y-auto max-h-[calc(100vh-120px)]">

            <h3 className="text-lg font-semibold mb-2 text-cyan-300"> Test Cases</h3>

            {finalVerdict === "Accepted" ? (
              <div className="bg-cyan-300/10 p-6 rounded shadow-md border border-green-700/30">
                <h2 className="text-green-400 text-xl font-semibold mb-4">
                  ✅ Result: Accepted
                </h2>
                <div className="text-sm text-cyan-200 mb-3">
                  Total Passed: {" "}
                  <span className="text-green-300">
                    {problem.testCases?.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {problem.testCases?.map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-green-600/20 text-green-300 px-4 py-2 rounded shadow-sm text-sm font-medium border border-green-300/30"
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
  className="bg-gradient-to-tr from-cyan-400 to-cyan-300 mt-3 hover:from-cyan-300 hover:to-cyan-200 text-cyan-900 px-4 py-2 rounded shadow-md text-sm font-semibold transition transform hover:scale-[1.02] border border-cyan-300/40"
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
 <div className="mt-4 bg-[#1e1e1e] border border-purple-700 rounded-xl p-5 text-white shadow-xl max-h-[350px] overflow-y-auto">
  <h4 className="text-purple-400 text-xl font-bold mb-4">
    🤖 AI Code Review
  </h4>

  <ReactMarkdown
    components={{
      p: ({ children }) => (
        <p className="text-cyan-100 leading-relaxed mb-3">{children}</p>
      ),
      li: ({ children }) => (
        <li className="text-cyan-100 list-disc ml-6 mb-2">{children}</li>
      ),
      h1: ({ children }) => (
        <h1 className="text-2xl font-bold text-cyan-100 mb-3 mt-4 border-b border-cyan-300 pb-1">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-lg font-semibold text-cyan-100 mt-4 mb-2 underline decoration-cyan-300">{children}</h2>
      ),
      code: ({ children }) => (
        <code className="bg-[#101624] px-1 py-0.5 rounded text-cyan-300 text-sm font-mono border border-cyan-300/20">{children}</code>
      ),
      pre: ({ children }) => (
        <pre className="bg-[#101624] p-3 rounded-lg overflow-auto text-sm text-cyan-100 font-mono mb-3 border border-cyan-300/20">
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
                      className={`relative px-3 py-1.5 rounded cursor-pointer text-sm border border-cyan-300/20 transition-all duration-150 font-semibold ${
                        idx === selectedCase
                          ? "bg-cyan-300/20 text-cyan-100 border-cyan-300"
                          : "bg-[#101624] text-cyan-200 hover:bg-cyan-300/10"
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
                    className="px-3 py-1.5 text-sm bg-cyan-300/20 hover:bg-cyan-300/30 text-cyan-100 rounded border border-cyan-300/20"
                  >
                    ➕ Add Testcase
                  </button>
                </div>

                {/* New Testcase Input */}
                {showAddInput ? (
                  <div className="bg-[#101624] p-4 rounded mb-4 space-y-3 border border-cyan-300/20">
                    <textarea
                      className="w-full bg-[#101624] text-cyan-100 border border-cyan-300/20 p-3 rounded text-sm shadow-sm"
                      rows="1"
                      placeholder="Enter custom input..."
                      value={newInput}
                      onChange={(e) => setNewInput(e.target.value)}
                    />
                    <textarea
                      className="w-full bg-[#101624] text-cyan-100 border border-cyan-300/20 p-3 rounded text-sm shadow-sm"
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
                        className="bg-cyan-300/30 hover:bg-cyan-300/50 px-4 py-1 rounded text-sm text-cyan-100 border border-cyan-300/20"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => {
                          setNewInput("");
                          setNewOutput("");
                          setShowAddInput(false);
                        }}
                        className="bg-red-600/30 hover:bg-red-600/50 px-4 py-1 rounded text-sm text-cyan-100 border border-red-400/20"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Show only selected test case when not adding
                  <div className="bg-[#101624] rounded p-4 mt-4 border border-cyan-300/20 shadow-sm text-sm text-cyan-100">
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      <strong>Input:</strong>
                      <br />
                      {allInputs[selectedCase]?.input ||
                        allInputs[selectedCase]}
                    </p>
                    <p className="mt-2 text-cyan-300">
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
                    <ReactMarkdown>{'\n- First\n- Second\n- Third'}</ReactMarkdown>
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
