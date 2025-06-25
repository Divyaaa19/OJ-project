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
    testCases: [{ input: "", output: "" }]
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
    setProblem({ ...problem, testCases: [...problem.testCases, { input: "", output: "" }] });
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
      await axios.post("http://localhost:5000/api/admin/problems", problem, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Problem added successfully!");
      navigate("/admin-dashboard"); // 👈 back to dashboard
    } catch (err) {
      alert("Failed to add problem.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-3xl font-bold mb-6 text-blue-400 text-center">➕ Add New Problem</h2>
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
            <input
              value={tc.input}
              onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
              placeholder="Input"
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            />
            <input
              value={tc.output}
              onChange={(e) => handleTestCaseChange(index, "output", e.target.value)}
              placeholder="Expected Output"
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            />
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
        <button type="button" onClick={addTestCase} className="text-blue-400 hover:underline">
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
