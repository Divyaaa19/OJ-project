import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddProblem() {
  const navigate = useNavigate();
  const [problem, setProblem] = useState({
    title: "",
    description: "",
    constraints: "",
    difficulty: "Easy",
    testCases: [{ input: "", output: "", explanation: "", hidden: "false" }],
  });

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
    const updated = [...problem.testCases];
    updated.splice(index, 1);
    setProblem({ ...problem, testCases: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const cleanedProblem = {
        ...problem,
        testCases: problem.testCases.map(({ input, output, explanation, hidden }) => {
          const tc = { input, output };
          if (explanation?.trim()) tc.explanation = explanation;
          if(hidden) tc.hidden=true;
          return tc;
        }),
      };

      await axios.post(
        "http://localhost:5000/api/admin/problems",
        cleanedProblem,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Problem added successfully!");
      navigate("/admin-dashboard");
    } catch (err) {
      alert("Failed to add problem.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-3xl font-bold mb-6 text-blue-400 text-center">
        ➕ Add New Problem
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
        <input
          name="title"
          value={problem.title}
          onChange={handleChange}
          placeholder="Title"
          required
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
        />
        <textarea
          name="description"
          value={problem.description}
          onChange={handleChange}
          placeholder="Description"
          required
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
        />
        <textarea
          name="constraints"
          value={problem.constraints}
          onChange={handleChange}
          placeholder="Constraints"
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
        />
        <select
          name="difficulty"
          value={problem.difficulty}
          onChange={handleChange}
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
        >
          <option value="Easy">🟢 Easy</option>
          <option value="Medium">🟠 Medium</option>
          <option value="Hard">🔴 Hard</option>
        </select>

        <h3 className="text-xl mt-4">🧪 Test Cases</h3>
        {problem.testCases.map((tc, index) => (
          <div key={index} className="bg-gray-700 p-3 rounded mb-2 space-y-2">
            <textarea
              value={tc.input}
              onChange={(e) =>
                handleTestCaseChange(index, "input", e.target.value)
              }
              placeholder={`Structured Input e.g.\nnums = [1,2,3], target = 5`}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded font-mono text-sm"
              rows={3}
            />

            <input
              value={tc.output}
              onChange={(e) =>
                handleTestCaseChange(index, "output", e.target.value)
              }
              placeholder="Expected Output"
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            />
            <input
              value={tc.explanation}
              onChange={(e) =>
                handleTestCaseChange(index, "explanation", e.target.value)
              }
              placeholder="Explanation (optional)"
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            />
            <label className="text-sm text-gray-300">
  <input
    type="checkbox"
    checked={tc.hidden || false}
    onChange={(e) => handleTestCaseChange(index, "hidden", e.target.checked)}
    className="mr-2"
  />
  Hidden Test Case
</label>


            {problem.testCases.length > 1 && (
              <button
                type="button"
                onClick={() => removeTestCase(index)}
                className="text-sm text-red-400 hover:underline"
              >
                ❌ Remove Test Case
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addTestCase}
          className="text-blue-400 hover:underline"
        >
          ➕ Add Test Case
        </button>

        <button
          type="submit"
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold"
        >
          🚀 Submit Problem
        </button>
      </form>
    </div>
  );
}
