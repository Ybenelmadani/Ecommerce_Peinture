import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function fetchMe() {
    try {
      const res = await http.get("/me");
      setUser(res.data);
    } catch (e) {
      // token invalide/expiré => nettoyer
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setBooting(false);
    }
  }

  useEffect(() => {
    // si token existe, récupérer user
    if (token) fetchMe();
    else setBooting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, password) {
    const res = await http.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user); // on a déjà user
    return res.data;
  }

  async function register(payload) {
    // payload: {name,email,password, phone?, address?}
    const res = await http.post("/auth/register", payload);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data;
  }

  async function logout() {
    try {
      await http.post("/auth/logout");
    } catch (e) {
      // même si ça échoue, on déconnecte côté front
    }
    localStorage.removeItem("token");
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, booting, login, register, logout }),
    [user, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}