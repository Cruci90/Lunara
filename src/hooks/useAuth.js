import { useState, useCallback } from "react";

const TOKEN_KEY = "blw-auth-token";
const USER_KEY  = "blw-auth-user";

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });
  const [authError,   setAuthError]   = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const saveSession = useCallback((t, u) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
    setAuthError(null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const register = useCallback(async (email, password, name, role) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });
      const json = await res.json();
      if (!res.ok) { setAuthError(json.error ?? "Error al registrarse."); return false; }
      saveSession(json.token, json.user);
      return true;
    } catch {
      setAuthError("Error de conexión con el servidor.");
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, [saveSession]);

  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) { setAuthError(json.error ?? "Error al iniciar sesión."); return false; }
      saveSession(json.token, json.user);
      return true;
    } catch {
      setAuthError("Error de conexión con el servidor.");
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, [saveSession]);

  return { token, user, authError, authLoading, register, login, logout, setAuthError };
}
