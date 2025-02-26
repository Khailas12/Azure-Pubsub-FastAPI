import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


interface LoginProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}


const Login = ({ setIsAuthenticated }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      const response = await axios.post("http://127.0.0.1:8000/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user_id", response.data.user_id);
      setIsAuthenticated(true); // Update authentication state
      navigate("/");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Login
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <p className="mt-4">
        Don't have an account?{" "}
        <button
          onClick={() => navigate("/register")}
          className="text-blue-500 underline"
        >
          Register
        </button>
      </p>
    </div>
  );
};

export default Login;