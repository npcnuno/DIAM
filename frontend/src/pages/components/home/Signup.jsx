import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/accounts/signup/", {
        username,
        password,
      });
      alert("Signup successful!");

      navigate("/dashboard");
    } catch (error) {
      alert("Signup failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-lg space-y-6 p-10 bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-4xl font-bold text-center text-white">Sign Up</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white p-2.5 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white p-2.5 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-red-300"
          >
            Sign Up
          </button>
        </div>
        <div className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-red-400 hover:text-red-300">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default Signup;