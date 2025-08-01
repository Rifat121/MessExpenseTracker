import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import AuthService from "../services/AuthService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = AuthService.getCurrentUser();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);
        setUser(decoded);
      } catch (error) {
        console.error("Failed to decode token", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
