import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      alert("Registration successful! 🚀");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed.");
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center text-white">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6 border border-gray-700">
        <h2 className="text-2xl md:text-3xl font-semibold font-sans text-center text-white mb-1">
          Create Your CodeSpace Account
        </h2>
        <p className="text-center text-gray-300 text-base mb-4 font-normal font-sans">Start your journey by creating an account below.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Name"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
          />
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
            className="w-full py-2 bg-gradient-to-r from-blue-500 to-fuchsia-500 hover:from-fuchsia-500 hover:to-blue-500 rounded-xl text-white font-semibold tracking-wide shadow-lg transition-all duration-200 text-lg mt-2 font-sans"
          >
            Create Account
          </button>
        </form>
        <div className="pt-4 text-center text-gray-400 text-base">
          Already have an account?{' '}
          <span
            className="text-blue-400 hover:underline hover:text-fuchsia-400 cursor-pointer font-semibold transition"
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
}
