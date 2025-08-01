import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Both Email and Password are required.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid Email address.");
      return;
    }

    if (password.length < 5) {
      setError("Password must be at least 5 characters long.");
      return;
    }
    try {
      const res = await AuthService.login(email, password);

      navigateToDashboard(res.isApproved);
    } catch (error) {
      console.error("Login failed", error);
      setError(
        error.response?.data.message ||
          "Login failed. Please check your credentials."
      );
    }
  };

  const navigateToDashboard = (isApproved) => {
    if (isApproved) {
      navigate("/dashboard");
    } else {
      navigate("/create-or-join");
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
        {error && <div className="text-red-500 mb-4">{error}</div>}
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
