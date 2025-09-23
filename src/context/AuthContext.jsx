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
        if (!cancelled) {
          const overridesStr = safeGetLocal('userOverrides');
          let withOverrides = user || null;
          if (withOverrides && overridesStr) {
            try {
              const map = JSON.parse(overridesStr);
              const ov = map?.[String(withOverrides.id)] || null;
              if (ov && typeof ov === 'object') {
                withOverrides = { ...withOverrides, ...ov };
              }
            } catch { /* ignore */ }
          }
          setCurrentUser(withOverrides);
        }
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

  function safeGetLocal(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function safeSetLocal(key, val) {
    try { localStorage.setItem(key, val); } catch { /* ignore */ }
  }

  const persistOverrides = (id, updates) => {
    if (!id) return;
    const raw = safeGetLocal('userOverrides');
    let map = {};
    try { map = raw ? JSON.parse(raw) : {}; } catch { map = {}; }
    map[String(id)] = { ...(map[String(id)] || {}), ...updates };
    safeSetLocal('userOverrides', JSON.stringify(map));
  };

  const updateProfile = async (updates) => {
    // Client-side optimistic update; backend wiring added later
    setCurrentUser((u) => {
      if (!u) return u;
      const merged = { ...u, ...updates };
      persistOverrides(u.id, updates);
      return merged;
    });
    return { success: true };
  };

  const updateAvatar = async (file) => {
    if (!file) return { success: false, error: 'No file' };
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setCurrentUser((u) => {
      if (!u) return u;
      const merged = { ...u, avatarDataUrl: dataUrl };
      persistOverrides(u.id, { avatarDataUrl: dataUrl });
      return merged;
    });
    return { success: true };
  };

  const updatePassword = async ({ currentPassword, newPassword }) => {
    // Stubbed success; hook to backend later
    if (!newPassword) return { success: false, error: 'New password required' };
    return { success: true };
  };

  const value = { currentUser, signup, login, logout, updateProfile, updateAvatar, updatePassword, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};