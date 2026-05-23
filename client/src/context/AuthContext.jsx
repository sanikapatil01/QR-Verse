import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authLogin, authMe, authRegister } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("qrverse_token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await authMe();
        if (!cancelled) setUser(res.data.user);
      } catch {
        if (!cancelled) {
          localStorage.removeItem("qrverse_token");
          setToken("");
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async ({ email, password }) => {
    const res = await authLogin({ email, password });
    localStorage.setItem("qrverse_token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async ({ name, email, password }) => {
    const res = await authRegister({ name, email, password });
    localStorage.setItem("qrverse_token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("qrverse_token");
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout, isAuthed: Boolean(token) }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

