import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, updateProfile as firebaseUpdateProfile, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, fetchSignInMethodsForEmail, getAdditionalUserInfo, updatePassword as firebaseUpdatePassword } from 'firebase/auth';

const API_BASE =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost/filltrip-db';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

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
    const u = new URL(relativeOrAbsolute);
    return u.href;
  } catch {
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
        console.error("Failed to fetch backend user", err);
        setCurrentUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // ------------------ EMAIL/PASSWORD SIGNUP ------------------
const signup = async ({ fullName, username, email, password }) => {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  const safeFullName = fullName?.trim() || email.split('@')[0];
  const safeUsername = username?.trim() || email.split('@')[0];

  // Split name into first/last
  const [firstName, ...lastParts] = safeFullName.split(' ');
  const lastName = lastParts.join(' ') || firstName;

  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (methods.length > 0) {
      return { success: false, error: 'Email already in use' };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await firebaseUpdateProfile(firebaseUser, { displayName: safeFullName });

    const body = toForm({ 
      firstName, 
      lastName, 
      username: safeUsername, 
      email, 
      password 
    });

    const { user: backendUser } = await fetchJSON(`${API_BASE}/signup.php`, { 
      method: 'POST', 
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include'   
    });

    const normalizedUser = normalizeUser(backendUser);
    const mergedUser = { ...normalizedUser, firebaseUid: firebaseUser.uid };

    setCurrentUser(mergedUser);
    return { success: true, user: mergedUser };
  } catch (error) {
    return { success: false, error: error.message || 'Signup failed' };
  }
};

  // ------------------ EMAIL/PASSWORD LOGIN ------------------
  const login = async ({ email, password }) => {
    if (!email || !password) return { success: false, error: 'Please enter email and password' };
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const body = toForm({ email, password });
      const { user } = await fetchJSON(`${API_BASE}/login.php`, { 
        method: 'POST', 
        body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      setCurrentUser(normalizeUser(user));
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  // ------------------ GOOGLE SIGNUP ------------------
  const signupWithGoogle = async () => {
  try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const info = getAdditionalUserInfo(result);

      if (!info.isNewUser) {
        await firebaseSignOut(auth);
        return { success: false, error: 'Email already exists, please login' };
      }

      const displayName = firebaseUser.displayName || '';
      const [firstName, ...lastParts] = displayName.split(' ');
      const lastName = lastParts.join(' ') || firstName;

      const body = toForm({
        firstName,
        lastName,
        username: displayName.replace(/\s+/g, '').toLowerCase(),
        email: firebaseUser.email,
        password: firebaseUser.uid
      });

      const { user: backendUser } = await fetchJSON(`${API_BASE}/signup.php`, { 
        method: 'POST', 
        body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const normalizedUser = normalizeUser(backendUser);
      setCurrentUser({ ...normalizedUser, firebaseUid: firebaseUser.uid });
      return { success: true, user: { ...normalizedUser, firebaseUid: firebaseUser.uid } };
    } catch (error) {
      return { success: false, error: error.message || 'Google signup failed' };
    }
  };

  // ------------------ GOOGLE LOGIN ------------------
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const body = toForm({ email: firebaseUser.email, password: firebaseUser.uid });
      const { user } = await fetchJSON(`${API_BASE}/login.php`, { 
        method: 'POST', 
        body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      setCurrentUser(normalizeUser(user));
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message || 'Google login failed' };
    }
  };

  // ------------------ FACEBOOK SIGNUP ------------------
  const signupWithFacebook = async () => {
  try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const info = getAdditionalUserInfo(result);

      if (!info.isNewUser) {
        await firebaseSignOut(auth);
        return { success: false, error: 'Email already exists, please login' };
      }

      const displayName = firebaseUser.displayName || '';
      const [firstName, ...lastParts] = displayName.split(' ');
      const lastName = lastParts.join(' ') || firstName;

      const body = toForm({
        firstName,
        lastName,
        username: displayName.replace(/\s+/g, '').toLowerCase(),
        email: firebaseUser.email,
        password: firebaseUser.uid
      });

      const { user: backendUser } = await fetchJSON(`${API_BASE}/signup.php`, { 
        method: 'POST', 
        body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const normalizedUser = normalizeUser(backendUser);
      const mergedUser = { ...normalizedUser, firebaseUid: firebaseUser.uid };

      setCurrentUser(mergedUser);
      return { success: true, user: mergedUser };
    } catch (error) {
      return { success: false, error: error.message || 'Facebook signup failed' };
    }
  };

  // ------------------ FACEBOOK LOGIN ------------------
  const loginWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const body = toForm({ email: firebaseUser.email, password: firebaseUser.uid });
      const { user } = await fetchJSON(`${API_BASE}/login.php`, { 
        method: 'POST', 
        body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      setCurrentUser(normalizeUser(user));
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message || 'Facebook login failed' };
    }
  };

  // ------------------ LOGOUT ------------------
  const logout = async () => {
    try {
      await fetchJSON(`${API_BASE}/logout.php`, { method: 'POST' });
      await firebaseSignOut(auth);
    } finally {
      setCurrentUser(null);
    }
  };

  // ------------------ UPDATE PROFILE ------------------
  const updateProfile = async (updates) => {
    const body = toForm(updates);
    const { user } = await fetchJSON(`${API_BASE}/profile_update.php`, { method: 'POST', body });
    const nu = normalizeUser(user);
    setCurrentUser(nu || null);
    return { success: true, user: nu };
  };

  // ------------------ UPDATE AVATAR ------------------
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

  // ------------------ UPDATE PASSWORD ------------------
  const updatePassword = async ({ currentPassword, newPassword }) => {
    const body = toForm({ currentPassword, newPassword });
    await fetchJSON(`${API_BASE}/password_update.php`, { method: 'POST', body });
    if (currentUser?.firebaseUid) {
      await firebaseUpdatePassword(auth.currentUser, newPassword);
    }
    return { success: true };
  };

  const value = {
    currentUser,
    signup,
    login,
    signupWithGoogle,
    loginWithGoogle,
    signupWithFacebook,
    loginWithFacebook,
    logout,
    updateProfile,
    updateAvatar,
    updatePassword,
    loading
  };

return (<AuthContext.Provider value={value}> {!loading && children} </AuthContext.Provider>); };