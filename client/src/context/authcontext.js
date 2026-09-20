import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on mount
  const fetchMe = async () => {
    const API_BASE_URL=`/api/v1`
    try {
      const { data } = await axios.get(`${API_BASE_URL}/auth/me`);
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
    const API_BASE_URL=`/api/v1`
    await axios.post(`${API_BASE_URL}/auth/logout`);
    setUser(null);
  };

  const refreshUser = async () => {
    const API_BASE_URL=`/api/v1`
    const { data } = await axios.get(`${API_BASE_URL}/auth/me`);
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