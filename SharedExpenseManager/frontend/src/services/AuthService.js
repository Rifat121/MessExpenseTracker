import api from "../api/api";

const AuthService = {
  login: async (email, password) => {
    const response = await api.post("/api/users/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getCurrentUser: () => {
    const token = localStorage.getItem("token");
    if (token) {
      // In a real app, you'd decode the token here or verify it with the backend
      // For now, we'll just return a placeholder or decoded info if available
      return token; // Or decoded token if you have jwt-decode setup
    }
    return null;
  },
};

export default AuthService;