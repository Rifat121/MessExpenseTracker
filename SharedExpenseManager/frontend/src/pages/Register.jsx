import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/api/users/register", {
        name,
        email,
        password,
      });
      alert("Registration successful! Please log in.");
      navigate("/");
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full px-3 py-2 border rounded mb-2"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border rounded mb-2"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border rounded mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />
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
