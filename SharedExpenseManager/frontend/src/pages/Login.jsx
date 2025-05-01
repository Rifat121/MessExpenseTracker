import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const res = await api.post("/api/users/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token); // Store token
      if (res.data.messId) {
        navigate("/dashboard");
      } else {
        navigate("/create-or-join");
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="auth-container">
      <div className="form-box">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="input-field mb-3"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input-field mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary mb-2" onClick={handleLogin}>
          Login
        </button>
        <p className="text-small">Don't have an account?</p>
        <button
          className="btn btn-secondary mt-2"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Login;
