import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Api from "./api.ts";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [baseName, setBaseName] = useState("");
  const [baseLocation, setBaseLocation] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !role) {
      alert("Please fill in all fields");
      return;
    }
    if (
      (role === "AdminBase" && (!baseName || !baseLocation)) ||
      (role === "AdminOperator" && (!baseName || !baseLocation))
    ) {
      alert("Please provide base name and location for AdminBase");
      return;
    }
    try {
      const response = await Api.register(
        username,
        password,
        role,
        role === "AdminBase" || role === "AdminOperator" ? baseName : undefined,
        role === "AdminBase" || role === "AdminOperator"
          ? baseLocation
          : undefined,
      );
      console.log("User created:", response.data);
      localStorage.setItem("token", response.data.access);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("base", response.data.base);
      alert("Signup successful!");
      if (role === "AdminBase" || role === "Pessoal")
        navigate("/BaseDashboard");
      if (role === "AdminOperator" || role === "Operator")
        navigate("/OperatorDashboard");
    } catch (error) {
      alert(
        "Signup failed: " + (error.response?.data?.error || "Unknown error"),
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-lg space-y-6 p-10 bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-4xl font-bold text-center text-white">Sign Up</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white p-2.5 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
              placeholder="Username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white p-2.5 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
              placeholder="Password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white p-2.5 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
            >
              <option value="">Select Role</option>
              <option value="Administrator">Administrator</option>
              <option value="AdminOperator">Operator Administrator</option>
              <option value="AdminBase">Base Administrator</option>
              <option value="Operador">Operator</option>
              <option value="Pessoal">Personnel</option>
            </select>
          </div>
          {(role === "AdminBase" || role === "AdminOperator") && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Base Name
                </label>
                <input
                  type="text"
                  value={baseName}
                  onChange={(e) => setBaseName(e.target.value)}
                  className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white p-2.5 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="Base Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Base Location
                </label>
                <input
                  type="text"
                  value={baseLocation}
                  onChange={(e) => setBaseLocation(e.target.value)}
                  className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white p-2.5 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="Base Location"
                />
              </div>
            </>
          )}
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
