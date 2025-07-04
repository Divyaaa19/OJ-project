import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditProblem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);

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
      testCases: [...problem.testCases, { input: "", output: "" ,hidden:false}],
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
          if (hidden) tc.hidden=hidden;
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

      alert("Problem updated!");
      navigate("/admin-dashboard");
    } catch (err) {
      alert("Update failed.");
      console.error(err);
    }
  };

  if (!problem) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
  <h2 className="text-4xl font-bold mb-8 text-yellow-400 text-center">✏️Edit Problem</h2>
  <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-4xl mx-auto bg-gray-900 p-6 rounded shadow-lg">
    
    <div>
      <label className="block mb-1 text-gray-300 font-semibold">📝 Title</label>
      <input
        name="title"
        value={problem.title}
        onChange={handleChange}
        required
        className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
      />
    </div>

    <div>
      <label className="block mb-1 text-gray-300 font-semibold">📄 Description</label>
      <textarea
        name="description"
        value={problem.description}
        onChange={handleChange}
        required
        className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
      />
    </div>

    <div>
      <label className="block mb-1 text-gray-300 font-semibold">📌 Constraints</label>
      <textarea
        name="constraints"
        value={problem.constraints}
        onChange={handleChange}
        className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
      />
    </div>

    <div>
      <label className="block mb-1 text-gray-300 font-semibold">🚦 Difficulty</label>
      <select
        name="difficulty"
        value={problem.difficulty}
        onChange={handleChange}
        className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
      >
        <option value="Easy">🟢 Easy</option>
        <option value="Medium">🟠 Medium</option>
        <option value="Hard">🔴 Hard</option>
      </select>
    </div>

    <div>
      <h3 className="text-2xl font-semibold mt-8 mb-4 text-green-300">🧪 Test Cases</h3>
       <label className="text-sm mb-2 text-gray-400 block">🔹 Input (format: <code>1 2 3 \n 5</code>)</label>
      {problem.testCases.map((tc, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded mb-4 space-y-2">
         
          <textarea
            value={tc.input}
            onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
            className="w-full p-2 bg-gray-900 border border-gray-600 rounded font-mono"
            rows={3}
          />
          <input
            value={tc.output}
            onChange={(e) => handleTestCaseChange(index, "output", e.target.value)}
            placeholder="Expected Output"
            className="w-full p-2 bg-gray-900 border border-gray-600 rounded"
          />
          <input
            value={tc.explanation || ""}
            onChange={(e) => handleTestCaseChange(index, "explanation", e.target.value)}
            placeholder="Explanation (optional)"
            className="w-full p-2 bg-gray-900 border border-gray-600 rounded"
          />
          <label className="text-sm text-gray-300">
  <input
    type="checkbox"
    checked={tc.hidden || false}
    onChange={(e) => handleTestCaseChange(index, "hidden", e.target.checked)}
    className="mr-1"
  />
  Hidden Test Case
</label>
<br></br>
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
    </div>

    <button
      type="submit"
      className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 py-3 rounded font-bold text-black"
    >
      ✅ Update Problem
    </button>
  </form>
</div>

  );
}
