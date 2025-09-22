import React, { createContext, useContext, useEffect, useState } from 'react';

const API_BASE =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost/filltrip-db';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

function toForm(obj) {
  const p = new URLSearchParams();
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) p.append(k, String(v));
  });
  return p;
}

async function fetchJSON(url, init = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    const msg = data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user } = await fetchJSON(`${API_BASE}/me.php`, { method: 'GET' });
        if (!cancelled) setCurrentUser(user || null);
      } catch {
        if (!cancelled) setCurrentUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signup = async ({ fullName, username, email, password }) => {
    const body = toForm({ fullName, username, email, password });
    const { user } = await fetchJSON(`${API_BASE}/signup.php`, { method: 'POST', body });
    return { success: true, user };
  };

  const login = async ({ email, password }) => {
    const body = toForm({ email, password });
    const { user } = await fetchJSON(`${API_BASE}/login.php`, { method: 'POST', body });
    setCurrentUser(user);
    return { success: true, user };
  };

  const logout = async () => {
    try {
      await fetchJSON(`${API_BASE}/logout.php`, { method: 'POST' });
    } finally {
      setCurrentUser(null);
    }
  };

  const value = { currentUser, signup, login, logout, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};