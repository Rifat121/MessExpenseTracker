import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useLocation } from "react-router-dom";

const AdminDashboard = () => {
  const location = useLocation();
  const user = location.state?.user;
  const [pendingMembers, setPendingMembers] = useState([]);
  const [approvedMembers, setApprovedMembers] = useState([]);
  const messId = user.messId;
  const token = localStorage.getItem("token");

  const fetchPendingMembers = async () => {
    try {
      const res = await api.get(`/api/mess/${messId}/pending-members`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token as Bearer token
        },
      });
      console.log(res);
      setPendingMembers(res.data);
    } catch (error) {
      console.error("Fetch error", error.response?.data || error.message);
    }
  };

  const fetchApprovedMembers = async () => {
    try {
      const res = await api.get(`/api/mess/${messId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token as Bearer token
        },
      });
      setApprovedMembers(res.data);
    } catch (error) {
      console.error(
        "Approved fetch error",
        error.response?.data || error.message
      );
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.post(`/api/mess/${messId}/approve/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token as Bearer token
        },
      });
      fetchPendingMembers();
    } catch (error) {
      console.log(error, "Couldn't approve user");
    }
  };

  const handleReject = async (userId) => {
    try {
      await api.delete(`/api/mess/${messId}/reject/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token as Bearer token
        },
      });
      fetchPendingMembers();
    } catch (error) {
      console.log(error, "Couldn't reject user");
    }
  };

  const handleRemove = async (userId) => {
    try {
      await api.delete(`/api/mess/${messId}/remove/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token as Bearer token
        },
      });
      fetchApprovedMembers();
    } catch (error) {
      console.log(error, "Couldn't remove user");
    }
  };

  useEffect(() => {
    fetchPendingMembers();
    fetchApprovedMembers();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Pending Members */}
      <h2 className="text-2xl font-bold mb-4">Pending Members</h2>
      {pendingMembers.length === 0 ? (
        <p className="text-gray-500 mb-6">No pending members</p>
      ) : (
        pendingMembers.map((member) => (
          <div key={member._id} className="bg-white rounded-xl shadow p-4 mb-4">
            <p className="text-lg font-semibold">{member.name}</p>
            <p className="text-sm text-gray-500">{member.email}</p>
            <div className="flex space-x-3 mt-2">
              <button
                onClick={() => handleApprove(member._id)}
                className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(member._id)}
                className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}

      {/* Approved Members */}
      <h2 className="text-2xl font-bold mt-10 mb-4">Approved Members</h2>
      {approvedMembers.length === 0 ? (
        <p className="text-gray-500">No approved members yet</p>
      ) : (
        approvedMembers.map((member) => (
          <div key={member._id} className="bg-white rounded-xl shadow p-4 mb-4">
            <p className="text-lg font-semibold">{member.name}</p>
            <p className="text-sm text-gray-500">{member.email}</p>
            <div className="mt-2">
              <button
                onClick={() => handleRemove(member._id)}
                className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
