"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  isAuthenticated as checkAuth,
  loginWithPassword,
  logout as clearAuth,
} from "@/lib/client/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthenticated(checkAuth());
    setReady(true);
  }, []);

  const login = useCallback(async (password) => {
    await loginWithPassword(password);
    setAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
