import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  updatePassword as firebaseUpdatePassword,
} from 'firebase/auth';

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

// Map firebase auth error codes to backend-like error semantics so UI mapError() works.
function mapFirebaseAuthError(code) {
  if (!code) return { message: 'Login failed', status: 400 };
  switch (code) {
    case 'auth/invalid-email':
    case 'auth/user-not-found':
      return { message: 'user not found', status: 404 };
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return { message: 'invalid password', status: 401 };
    case 'auth/too-many-requests':
      return { message: 'invalid password', status: 401 }; // Keep generic for security
    default:
      return { message: 'login failed', status: 400 };
  }
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth changes then sync with backend session
  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (cancelled) return;

      if (!firebaseUser) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }
      try {
        const { user: backendUser } = await fetchJSON(`${API_BASE}/me.php`, { method: 'GET' });
        const normalizedUser = normalizeUser(backendUser);
        const mergedUser = { ...normalizedUser, firebaseUid: firebaseUser.uid };
        setCurrentUser(mergedUser);
      } catch (err) {
        console.error('Failed to fetch backend user', err);
        setCurrentUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => { cancelled = true; unsubscribe(); };
  }, []);

  // Email/password signup (Firebase + backend)
  const signup = async ({ firstName, lastName, username, email, password }) => {
    try {
      if (!email || !password) return { success: false, error: 'Email and password required' };
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length) return { success: false, error: 'Email already in use' };

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const displayName = [firstName, lastName].filter(Boolean).join(' ').trim() || username || email.split('@')[0];
      if (displayName) {
        try { await firebaseUpdateProfile(firebaseUser, { displayName }); } catch {}
      }

      const body = toForm({ firstName, lastName, username, email, password });
      const { user: backendUser } = await fetchJSON(`${API_BASE}/signup.php`, { method: 'POST', body });
      const normalizedUser = normalizeUser(backendUser);
      const mergedUser = { ...normalizedUser, firebaseUid: firebaseUser.uid };
      setCurrentUser(mergedUser);
      return { success: true, user: mergedUser };
    } catch (error) {
      return { success: false, error: error.message || 'Signup failed' };
    }
  };

  // Email/password login (backend authoritative). Firebase is not used for credential validation here.
  const login = async ({ email, password }) => {
    const body = toForm({ email, password });
    try {
      const { user } = await fetchJSON(`${API_BASE}/login.php`, { method: 'POST', body });
      const normalized = normalizeUser(user);
      setCurrentUser(normalized);
      return { success: true, user: normalized };
    } catch (err) {
      // Normalize backend errors to consistent messages for UI mapping
      const raw = (err?.message || '').toLowerCase();
      if (raw.includes('not found') || raw.includes('no account') || err.status === 404) {
        return { success: false, error: { message: 'user not found', status: 404 } };
      }
      if (raw.includes('invalid password') || raw.includes('incorrect password') || err.status === 401) {
        return { success: false, error: { message: 'invalid password', status: 401 } };
      }
      if (raw.includes('invalid credentials')) {
        return { success: false, error: { message: 'invalid password', status: 401 } };
      }
      return { success: false, error: { message: 'login failed', status: err.status || 400 } };
    }
  };

  // Unified social auth (Google/Facebook) auto-provisions backend user if missing
  const continueWithProvider = async (providerName) => {
    try {
      let provider;
      if (providerName === 'google') {
        provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
      } else if (providerName === 'facebook') {
        provider = new FacebookAuthProvider();
      } else {
        return { success: false, error: 'Unsupported provider' };
      }

      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      if (!firebaseUser?.email) {
        return { success: false, error: 'Provider did not return an email' };
      }

      // Attempt backend login first
      const loginBody = toForm({ email: firebaseUser.email, password: firebaseUser.uid });
      try {
        const { user } = await fetchJSON(`${API_BASE}/login.php`, { method: 'POST', body: loginBody });
        const normalized = normalizeUser(user);
        const merged = { ...normalized, firebaseUid: firebaseUser.uid };
        setCurrentUser(merged);
        return { success: true, user: merged, created: false };
      } catch (loginErr) {
        // If login failed because user not found -> create then login
        const message = (loginErr?.message || '').toLowerCase();
        if (message.includes('not found') || message.includes('does not exist')) {
          const displayName = firebaseUser.displayName || '';
          const [firstName, ...rest] = displayName.trim().split(' ').filter(Boolean);
          const lastName = rest.join(' ') || firstName || '';
          const usernameBase = displayName.replace(/\s+/g, '').toLowerCase() || firebaseUser.email.split('@')[0];
          const signupBody = toForm({
            firstName: firstName || usernameBase,
            lastName: lastName || firstName || usernameBase,
            username: usernameBase,
            email: firebaseUser.email,
            password: firebaseUser.uid,
          });
          try {
            const { user: backendUser } = await fetchJSON(`${API_BASE}/signup.php`, { method: 'POST', body: signupBody });
            // After signup, we are effectively logged in (session cookie). Merge and return.
            const normalized = normalizeUser(backendUser);
            const merged = { ...normalized, firebaseUid: firebaseUser.uid };
            setCurrentUser(merged);
            return { success: true, user: merged, created: true };
          } catch (signupErr) {
            // If signup fails, sign out firebase to avoid inconsistent state
            try { await firebaseSignOut(auth); } catch {}
            return { success: false, error: signupErr.message || 'Backend signup failed' };
          }
        }
        // Other login errors propagate
        return { success: false, error: loginErr.message || 'Social login failed' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Social auth failed' };
    }
  };

  const logout = async () => {
    try {
      await fetchJSON(`${API_BASE}/logout.php`, { method: 'POST' });
      await firebaseSignOut(auth);
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
    if (currentUser?.firebaseUid) {
      try { await firebaseUpdatePassword(auth.currentUser, newPassword); } catch (e) { console.warn('Firebase password update failed', e); }
    }
    return { success: true };
  };

  const value = {
    currentUser,
    signup,
    login,
    continueWithGoogle: () => continueWithProvider('google'),
    continueWithFacebook: () => continueWithProvider('facebook'),
    logout,
    updateProfile,
    updateAvatar,
    updatePassword,
    loading,
  };
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};