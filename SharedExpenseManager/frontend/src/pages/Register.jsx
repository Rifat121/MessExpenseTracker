import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const validateInputs = () => {
    if (!name || !email || !password || !mobile) {
      setError("All fields are required.");
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email.");
      return false;
    }
    if (password.length < 5) {
      setError("Password must be at least 5 characters.");
      return false;
    }
    if (mobile.length != 11) {
      setError("Mobile number must contain 11 digits");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (!validateInputs()) return;

    try {
      // Make the API request for registration
      const res = await api.post("/api/users/register", {
        name,
        email,
        password,
        mobile,
      });

      // On successful registration
      setSuccess("Registration successful! Logging you in...");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Registration failed", error);
      setError(
        error.response?.data.message || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <input
          type="text"
          placeholder="Enter Name"
          className="w-full px-3 py-2 border rounded mb-2"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Enter Email"
          className="w-full px-3 py-2 border rounded mb-2"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter Password"
          className="w-full px-3 py-2 border rounded mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Contact Number"
          className="w-full px-3 py-2 border rounded mb-2"
          onChange={(e) => setMobile(e.target.value)}
        />
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {success && <div className="text-green-500 mb-4">{success}</div>}
        <button
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          onClick={handleRegister}
        >
          Register
        </button>
        <p className="mt-3 text-center">Already have an account?</p>
        <button
          className="w-full bg-blue-500 text-white py-2 mt-2 rounded hover:bg-blue-600"
          onClick={() => navigate("/")}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Register;
