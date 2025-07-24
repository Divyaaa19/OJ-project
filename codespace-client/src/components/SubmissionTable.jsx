// components/SubmissionTable.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function SubmissionTable({ problemId }) {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${import.meta.env.VITE_API_URL}api/user/submissions/${problemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSubmissions(res.data))
      .catch(console.error);
  }, [problemId]);

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

  return (
    <table className="w-full text-sm mt-4 border-collapse border border-gray-600">
      <thead>
        <tr className="bg-[#222]">
          <th className="border border-gray-600 px-3 py-2">Time</th>
          <th className="border border-gray-600 px-3 py-2">Language</th>
          <th className="border border-gray-600 px-3 py-2">Verdict</th>
          <th className="border border-gray-600 px-3 py-2">Code</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((s, i) => (
          <tr key={i} className="hover:bg-[#333]">
            <td className="border border-gray-600 px-3 py-2">
              {new Date(s.timestamp).toLocaleString()}
            </td>
            <td className="border border-gray-600 px-3 py-2">{s.language}</td>
            <td className={`border border-gray-600 px-3 py-2 font-semibold ${getVerdictColor(s.verdict)}`}>
              {s.verdict || "Pending"}
            </td>
            <td className="border border-gray-600 px-3 py-2">
              <button
                className="text-blue-400 underline"
                onClick={() => alert(s.code)}
              >
                View Code
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
