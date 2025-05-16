import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Api from './api.ts';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await Api.login(username, password);
      localStorage.setItem('user', JSON.stringify(response.data.user || { username }));
      alert('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </button>
          <p className="text-white text-center">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-400 hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
