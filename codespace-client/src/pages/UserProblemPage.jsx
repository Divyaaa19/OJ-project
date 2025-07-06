  import CodeMirror from "@uiw/react-codemirror";
  import { cpp } from "@codemirror/lang-cpp";
  import { python } from "@codemirror/lang-python";
  import { java } from "@codemirror/lang-java";
  import { useParams } from "react-router-dom";
  import { useEffect, useState } from "react";
  import axios from "axios";
  import Split from "react-split";

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
   const [complexityParts, setComplexityParts] = useState({ time: "", space: "" });
const [showComplexityModal, setShowComplexityModal] = useState(false);


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

  const getComplexity = async () => {
  if (!code.trim()) return;
  setLoadingComplexity(true);
  setComplexity(""); // raw text
  setComplexityParts({ time: "", space: "" }); // structured
  setShowComplexityModal(false);

  try {
    const res = await axios.post("http://localhost:5000/api/ai/complexity", {
      code,
      language,
    });

    const raw = res.data.complexity;
    setComplexity(raw);

    const timeMatch = raw.match(/Time Complexity:\s*(.*?)(?=\n|Space Complexity:|$)/i);
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
            .then((res) => setSubmissions(res.data))
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
      const results = [];
      const verdictList = [];

      for (let i = 0; i < allInputs.length; i++) {
        const input = allInputs[i].input;
        try {
          const res = await axios.post("http://localhost:8000/run", {
            language,
            code,
            input: input.trim(),
          });
          const output = (res.data.output || "").trim().replace(/\s+/g, " ");
          results.push(output);
          const expected =
            i < problem.testCases.length
              ? problem.testCases[i].output?.trim().replace(/\s+/g, " ")
              : customCases[i - problem.testCases.length]?.output
                  ?.trim()
                  .replace(/\s+/g, " ");
          verdictList.push(
            output === expected ? "Accepted ✅" : "Wrong Answer ❌"
          );
        } catch {
          results.push("Error");
          verdictList.push("Error ❌");
        }
      }
      setOutputs(results);
      setVerdicts(verdictList);
      if (selectedCase >= allInputs.length) setSelectedCase(0);
    };

    const submitCode = async () => {
      if (!problem?.testCases) return;
      const allCases = problem.testCases;
      const results = [];

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
          const verdict = output === expected ? "Accepted" : "Wrong Answer";
          results.push({ input, output, expected, verdict });
        } catch {
          results.push({
            input,
            output: "Error",
            expected: "",
            verdict: "Error ❌",
          });
        }
      }

      const allAccepted = results.every((r) => r.verdict === "Accepted");

      if (allAccepted) {
        setOutputs([]);
        setVerdicts([]);
        setFinalVerdict("Accepted");
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
          }
        );

        setTcScEstimation(aiRes.data.complexity); // Save to state

        await axios.post(
          "http://localhost:5000/api/user/submit",
          {
            problemId: id,
            code,
            language,
            timestamp: new Date().toISOString(),
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
        alert("❌ Some test cases failed. Please try again.");
      }
    };

    if (!problem) return <div className="text-white p-6">Loading...</div>;

    return (
      <div className="h-screen w-screen text-white bg-[#0f0f0f] flex">
        <Split
          className="flex h-full w-full min-h-0 overflow-hidden"
          sizes={[40, 60]}
          minSize={300}
          direction="horizontal"
          gutterSize={8}
          style={{ display: "flex" }}
        >
          <div className="overflow-auto bg-[#1a1a1a] p-8">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setActiveTab("description")}
                className={`text-sm font-semibold border-b-2 px-2 pb-1 ${
                  activeTab === "description"
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-400"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("submissions")}
                className={`text-sm font-semibold border-b-2 px-2 pb-1 ${
                  activeTab === "submissions"
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-400"
                }`}
              >
                Submissions
              </button>
            </div>

            {activeTab === "description" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold mb-2">{problem.title}</h2>
                  <span
                    className="text-sm font-medium px-3 py-1 rounded-full capitalize"
                    style={{
                      backgroundColor:
                        problem.difficulty === "Easy"
                          ? "rgba(34, 197, 94, 0.1)" // green-500 with 10% opacity
                          : problem.difficulty === "Medium"
                          ? "rgba(234, 179, 8, 0.1)" // yellow-500
                          : "rgba(239, 68, 68, 0.1)", // red-500
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
                  className="mb-4 text-gray-300"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {problem.description}
                </p>
                <h3 className="text-lg font-semibold mb-2">Constraints</h3>
                <ul className="list-disc list-inside text-gray-400 mb-4">
                  {problem.constraints?.split("\n").map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
                <h3 className="text-lg font-semibold mb-2">Examples</h3>
                {problem.testCases
                  ?.filter((tc) => !tc.hidden)
                  .map((tc, i) => (
                    <div
                      key={i}
                      className="mb-3 p-3 bg-[#2b2b2b] rounded text-sm text-green-300"
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
              <div className="text-sm text-gray-300">
                {submissions.length === 0 ? (
                  <p>No submissions yet.</p>
                ) : (
                  <table className="w-full mt-4 text-left text-sm rounded overflow-hidden shadow border border-gray-700">
                    <thead className="bg-gray-800 text-gray-300 uppercase tracking-wider text-xs">
                      <tr>
                        <th className="px-4 py-3">No.</th>
                        <th className="px-4 py-3">Language</th>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3">Code</th>
                      </tr>
                    </thead>
                    <tbody className="text-white bg-gray-900">
                      {submissions.map((sub, idx) => (
                        <tr
                          key={sub._id}
                          className="hover:bg-gray-800 transition duration-150 border-t border-gray-700"
                        >
                          <td className="px-4 py-3">{idx + 1}</td>
                          <td className="px-4 py-3 capitalize">{sub.language}</td>
                          <td className="px-4 py-3">
                            {new Date(sub.timestamp).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setModalCode(sub.code);
                                setShowModal(true);
                              }}
                              className="text-blue-400 hover:text-blue-300 hover:underline"
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
            className="flex flex-col w-full min-h-0 overflow-hiddenl"
            sizes={[60, 40]}
            direction="vertical"
            gutterSize={8}
          >
            <div className="flex flex-col h-full p-4 bg-[#1a1a1a] rounded shadow">
              <div className="flex-none p-2 flex justify-between items-centerr">
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
              <div className="flex items-center gap-2">
  {/* Run Button */}
  <button
    onClick={runCode}
    className="px-4 py-2 rounded-md text-white font-medium shadow transition 
               bg-gradient-to-tr from-blue-500 to-cyan-500 hover:opacity-90 hover:scale-[1.02]"
  >
    ▶ Run
  </button>

  {/* Submit Button (Improved icon) */}
  <button
    onClick={submitCode}
    className="px-4 py-2 rounded-md text-white font-medium shadow transition 
               bg-gradient-to-tr from-green-500 to-emerald-400 hover:opacity-90 hover:scale-[1.02]"
  >
    📤 Submit
  </button>

  {/* TC & SC Brain Button */}
  {finalVerdict === "Accepted" && (
    <button
      onClick={getComplexity}
      title="Analyze Time & Space Complexity"
      className="p-2 rounded-full shadow bg-gradient-to-tr from-purple-600 to-pink-500 hover:opacity-90 hover:scale-105 transition flex items-center justify-center"
    >
      <span role="img" aria-label="complexity" className="text-lg">🧠</span>
    </button>
  )}
</div>


              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-2 bg-[#1a1a1a] rounded shadow mt-2">
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
              {loadingComplexity && (
  <p className="text-blue-400 mt-3 animate-pulse">Analyzing complexity...</p>
)}


              
            </div>
        

            
            <div className="bg-[#1a1a1a] h-full p-4 shadow m-4 rounded">
              <h3 className="text-lg font-semibold mb-2">🧪 Test Cases</h3>

              {finalVerdict === "Accepted" ? (
                <div className="bg-[#222] p-6 rounded shadow-md border border-green-700/30">
                  <h2 className="text-green-400 text-xl font-semibold mb-4">
                    ✅ Result: Accepted
                  </h2>
                  <div className="text-sm text-gray-400 mb-3">
                    Total Passed:{" "}
                    <span className="text-green-300">
                      {problem.testCases?.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {problem.testCases?.map((_, idx) => (
                      <div
                        key={idx}
                        className="bg-green-600/20 text-green-300 px-4 py-2 rounded shadow-sm text-sm font-medium"
                      >
                        Test Case {idx + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {allInputs.map((input, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedCase(idx)}
                        className={`relative px-3 py-1.5 rounded cursor-pointer text-sm ${
                          idx === selectedCase
                            ? "bg-gray-700 text-white"
                            : "bg-[#333] text-gray-300 hover:bg-[#444]"
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
                      className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded"
                    >
                      ➕ Add Testcase
                    </button>
                  </div>

                  {/* New Testcase Input */}
                  {showAddInput ? (
                    <div className="bg-[#2a2a2a] p-4 rounded mb-4 space-y-3 border border-gray-600">
                      <textarea
                        className="w-full bg-[#121212] text-white border border-gray-600 p-3 rounded text-sm shadow-sm"
                        rows="1"
                        placeholder="Enter custom input..."
                        value={newInput}
                        onChange={(e) => setNewInput(e.target.value)}
                      />
                      <textarea
                        className="w-full bg-[#121212] text-white border border-gray-600 p-3 rounded text-sm shadow-sm"
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
                          className="bg-green-600 hover:bg-green-500 px-4 py-1 rounded text-sm"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => {
                            setNewInput("");
                            setNewOutput("");
                            setShowAddInput(false);
                          }}
                          className="bg-red-600 hover:bg-red-500 px-4 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Show only selected test case when not adding
                    <div className="bg-[#2a2a2a] rounded p-4 mt-4 border border-gray-700 shadow-sm text-sm text-green-300">
                      <p style={{ whiteSpace: "pre-wrap" }}>
                        <strong>Input:</strong>
                        <br />
                        {allInputs[selectedCase]?.input ||
                          allInputs[selectedCase]}
                      </p>
                      <p className="mt-2 text-blue-300">
                        <strong>Output:</strong>{" "}
                        {outputs[selectedCase] ?? "Run to see output"}
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
        <h2 className="text-lg font-semibold text-blue-400">Complexity Analysis</h2>
      </div>

      <div className="space-y-4 text-sm text-gray-300">
  <div className="bg-[#2a2a2a] p-4 rounded border border-blue-500/30 shadow-sm">
    <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
      📘 Time Complexity
    </h3>
    <ul className="list-disc list-inside text-gray-300 leading-relaxed">
      {complexityParts.time.split(/(?<=\.)\s+/).map((point, idx) => (
        <li key={idx}>{point}</li>
      ))}
    </ul>
  </div>

  <div className="bg-[#2a2a2a] p-4 rounded border border-purple-500/30 shadow-sm">
    <h3 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
      💾 Space Complexity
    </h3>
    <ul className="list-disc list-inside text-gray-300 leading-relaxed">
      {complexityParts.space.split(/(?<=\.)\s+/).map((point, idx) => (
        <li key={idx}>{point}</li>
      ))}
    </ul>
  </div>
</div>

    </div>
  </div>
)}


      </div>
    );
  }
