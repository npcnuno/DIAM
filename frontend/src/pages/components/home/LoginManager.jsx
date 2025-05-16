import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginManager = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/accounts/check/", {
        withCredentials: true,
      })
      .then((response) => setUsername(response.data.username))
      .catch((error) => console.log("User not logged in"));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:8000/api/accounts/logout/", {
        withCredentials: true,
      });
      setUsername(null);
      navigate("/login");
    } catch (error) {
      alert("Logout failed");
    }
  };

  return (
    <div className="flex items-center justify-end p-4 bg-gray-800 text-white">
      {username ? (
        <>
          <p className="mr-4">Olá {username}!</p>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <p className="mr-4">Olá, não estás logado(a)!</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 transition duration-300"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Sign Up
          </button>
        </>
      )}
    </div>
  );
};

export default LoginManager;