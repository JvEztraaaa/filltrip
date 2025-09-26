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
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok || data?.success === false) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(k => { if (k !== 'success') err[k] = data[k]; });
    }
    throw err;
  }
  return data;
}

function makeAbsoluteUrl(relativeOrAbsolute) {
  if (!relativeOrAbsolute) return relativeOrAbsolute;
  try {
    // If already absolute, this will parse fine and preserve
    const u = new URL(relativeOrAbsolute);
    return u.href;
  } catch {
    // Treat as relative to API base
    try { return new URL(relativeOrAbsolute.replace(/^\/+/, ''), API_BASE + '/').href; } catch { return relativeOrAbsolute; }
  }
}

function normalizeUser(user) {
  if (!user) return user;
  const u = { ...user };
  if (!u.fullName && (u.firstName || u.lastName)) {
    u.fullName = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  }
  if (u.avatarUrl) u.avatarUrl = makeAbsoluteUrl(u.avatarUrl);
  return u;
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
          setCurrentUser(normalizeUser(user) || null);
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

  const signup = async ({ firstName, lastName, username, email, password }) => {
    const body = toForm({ firstName, lastName, username, email, password });
    const { user } = await fetchJSON(`${API_BASE}/signup.php`, { method: 'POST', body });
    return { success: true, user: normalizeUser(user) };
  };

  const login = async ({ email, password }) => {
    const body = toForm({ email, password });
    const { user } = await fetchJSON(`${API_BASE}/login.php`, { method: 'POST', body });
    setCurrentUser(normalizeUser(user));
    return { success: true, user };
  };

  const logout = async () => {
    try {
      await fetchJSON(`${API_BASE}/logout.php`, { method: 'POST' });
    } finally {
      setCurrentUser(null);
    }
  };

  const updateProfile = async (updates) => {
    const body = toForm(updates);
    const { user } = await fetchJSON(`${API_BASE}/profile_update.php`, { method: 'POST', body });
    const nu = normalizeUser(user);
    setCurrentUser(nu || null);
    return { success: true, user: nu };
  };

  const updateAvatar = async (file) => {
    if (!file) return { success: false, error: 'No file' };
    const fd = new FormData();
    fd.append('avatar', file);
    const res = await fetch(`${API_BASE}/avatar_upload.php`, { method: 'POST', body: fd, credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success === false) throw new Error(data?.error || 'Upload failed');
    const avatarUrl = makeAbsoluteUrl(data.avatarUrl);
    setCurrentUser((u) => (u ? { ...u, avatarUrl } : u));
    return { success: true, avatarUrl };
  };

  const updatePassword = async ({ currentPassword, newPassword }) => {
    const body = toForm({ currentPassword, newPassword });
    await fetchJSON(`${API_BASE}/password_update.php`, { method: 'POST', body });
    return { success: true };
  };

  const value = { currentUser, signup, login, logout, updateProfile, updateAvatar, updatePassword, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};