import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

const TOKEN_KEY = "token";
const USER_KEY = "user";

const getStoredToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("smart_job_token");
};

const getStoredUser = () => {
  const rawUser = localStorage.getItem("user") || localStorage.getItem("smart_job_user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("smart_job_token");
  localStorage.removeItem("user");
  localStorage.removeItem("smart_job_user");
};

const storeAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("smart_job_token", token);
  localStorage.setItem("smart_job_user", JSON.stringify(user));
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const warmBackend = async () => {
      try {
        await authService.health();
      } catch {
        // Warm-up failure ignored
      }
    };

    const hydrateAuth = async () => {
      const storedToken = getStoredToken();

      if (!storedToken) {
        if (!cancelled) {
          setAuthReady(true);
        }
        return;
      }

      try {
        const { data } = await authService.me();

        if (cancelled) {
          return;
        }

        setToken(storedToken);
        setUser(data.user);
        storeAuth(storedToken, data.user);
      } catch {
        if (cancelled) {
          return;
        }

        setToken(null);
        setUser(null);
        clearAuthStorage();
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    };

    void warmBackend();
    hydrateAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = ({ token: nextToken, user: nextUser }) => {
    setToken(nextToken);
    setUser(nextUser);
    storeAuth(nextToken, nextUser);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Clear session regardless
    }

    setToken(null);
    setUser(null);
    clearAuthStorage();
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));
    localStorage.setItem("smart_job_user", JSON.stringify(nextUser));
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    authReady,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
