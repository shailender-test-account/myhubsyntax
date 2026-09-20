import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on mount
  const fetchMe = async () => {
    try {
      const { data } = await axios.get("/api/v1/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

//   const login = async (email, password) => {
//     const { data } = await axios.post("/auth/login", { email, password });
//     setUser(data.user);
//     return data;
//   };

//   const register = async (name, email, password) => {
//     const { data } = await api.post("/auth/register", { name, email, password });
//     return data;
//   };

  const logout = async () => {
    await axios.post("/api/v1/auth/logout");
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await axios.get("/api/v1/auth/me");
    setUser(data.user);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading,logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);