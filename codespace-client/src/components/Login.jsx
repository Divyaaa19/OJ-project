import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      const { token, role } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role); // optional

      alert("Welcome to CodeSpace!");

      if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center text-white">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6 border border-gray-700">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center bg-gradient-to-r from-blue-400 via-fuchsia-400 to-pink-400 text-transparent bg-clip-text drop-shadow mb-1">
          CodeSpace Login
        </h2>
        <p className="text-center text-gray-300 text-base mb-4 font-medium">Sign in to your account to continue.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
          />
          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-blue-500 to-fuchsia-500 hover:from-fuchsia-500 hover:to-blue-500 rounded-xl text-white font-bold tracking-wide shadow-lg transition-all duration-200 text-lg mt-2"
          >
            Login to the Space Station 🌌
          </button>
        </form>
        <div className="pt-4 text-center text-gray-400 text-base">
          New user?{' '}
          <span
            className="text-blue-400 hover:underline hover:text-fuchsia-400 cursor-pointer font-semibold transition"
            onClick={() => navigate('/register')}
          >
            Register
          </span>
        </div>
      </div>
    </div>
  );
}
