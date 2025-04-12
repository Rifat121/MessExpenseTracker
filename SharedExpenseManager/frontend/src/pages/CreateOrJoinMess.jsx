import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateOrJoinMess = () => {
  const [createMessName, setCreateMessName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [activeTab, setActiveTab] = useState("create");

  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/mess/create", {
        name: createMessName,
      });
      if (res.status === 200) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error creating mess:", err.response?.data || err.message);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/mess/join", { code: joinCode });
      if (res.status === 200) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error joining mess:", err.response?.data || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-6 rounded-2xl shadow-xl space-y-6">
      <h2 className="text-2xl font-bold text-center">Join or Create a Mess</h2>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 py-2 rounded-full ${
            activeTab === "create"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Create
        </button>
        <button
          onClick={() => setActiveTab("join")}
          className={`px-4 py-2 rounded-full ${
            activeTab === "join"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Join
        </button>
      </div>

      {activeTab === "create" && (
        <form onSubmit={handleCreate} className="space-y-4">
          <label className="block">
            <span className="text-gray-700">Mess Name</span>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              value={createMessName}
              onChange={(e) => setCreateMessName(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Create Mess
          </button>
        </form>
      )}

      {activeTab === "join" && (
        <form onSubmit={handleJoin} className="space-y-4">
          <label className="block">
            <span className="text-gray-700">Invite Code</span>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
          >
            Join Mess
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateOrJoinMess;
