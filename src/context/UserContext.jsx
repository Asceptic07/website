// src/context/UserContext.jsx
import { getUserProfile } from '../services/user.js';
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { auth, db } from '../lib/firebase.js';
import { onIdTokenChanged, reload, getIdToken } from 'firebase/auth';
import { onAuthChange, signInEmail, signUpEmail, logout, resetPasswordEmail, changePassword } from '../services/auth.js';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

const UserContext = createContext(null);

const initialUserShape = {
  uid: null,
  name: '',
  email: '',
  emailVerified: false,   // added: tracked from Firebase user [web:3]
  phone: '',
  address: { street: '', city: '', state: '', pincode: '' },
  paymentInfo: { cardNumber: '', expiryDate: '', cvv: '' },
  role: 'user',
  loaded: false,
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(initialUserShape);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(null);

  // Merge helper that preserves nested objects
  const mergeUser = useCallback((patch) => {
    setUser((prev) => ({
      ...prev,
      ...patch,
      address: { ...prev.address, ...(patch.address || {}) },
      paymentInfo: { ...prev.paymentInfo, ...(patch.paymentInfo || {}) },
    }));
  }, []);

  // Auth + token listener: reacts when ID token refreshes (e.g., after verification) [web:57]
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (firebaseUser) => {
      setError(null);
      setAuthLoading(false);

      if (!firebaseUser) {
        setUser({ ...initialUserShape, loaded: true });
        return;
      }

      const base = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        emailVerified: !!firebaseUser.emailVerified, // capture verification state [web:3]
      };

      setProfileLoading(true);
      try {
        const profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          const ref = doc(db, 'users', firebaseUser.uid);
          await setDoc(ref, {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: 'user',
            createdAt: new Date(),
          }, { merge: true });
          mergeUser({ ...base, role: 'user', loaded: true });
        } else {
          mergeUser({
            ...initialUserShape,
            ...profile,
            ...base,
            loaded: true,
          });
        }
      } catch (e) {
        setError(e?.message || 'Failed to load profile');
        mergeUser({ ...base, loaded: true });
      } finally {
        setProfileLoading(false);
      }
    });
    return () => unsub();
  }, [mergeUser]);

  // Force-refresh the Firebase user and token claims (used by RequireAuth) [web:3][web:27]
  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return false;
    await reload(auth.currentUser);                 // pulls latest emailVerified [web:3]
    await getIdToken(auth.currentUser, true);       // refreshes token so claims update [web:27]
    const verified = !!auth.currentUser.emailVerified;
    mergeUser({ emailVerified: verified, uid: auth.currentUser.uid, email: auth.currentUser.email || '' });
    return verified;
  }, [mergeUser]);

  // Actions
  const signIn = useCallback(async (email, password) => {
    setError(null);
    const u = await signInEmail(email, password);
    return u;
  }, []);

  const signUp = useCallback(async (email, password, extraProfile = {}) => {
    setError(null);
    const u = await signUpEmail(email, password);
    if (u?.uid && Object.keys(extraProfile || {}).length) {
      await setDoc(doc(db, 'users', u.uid), { ...extraProfile, email, uid: u.uid, updatedAt: new Date() }, { merge: true });
    }
    return u;
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    await logout();
  }, []);

  const sendPasswordReset = useCallback(async (email) => {
    setError(null);
    await resetPasswordEmail(email);
  }, []);

  const updateUser = useCallback(async (updatedData) => {
    setError(null);
    if (!user?.uid) throw new Error('Not authenticated');
    mergeUser(updatedData);
    const ref = doc(db, 'users', user.uid);
    const updates = { ...updatedData, updatedAt: new Date() };
    await updateDoc(ref, updates).catch(async () => {
      await setDoc(ref, updates, { merge: true });
    });
  }, [mergeUser, user?.uid]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user?.uid),
    role: user?.role || 'user',
    authLoading,
    profileLoading,
    error,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updateUser,
    refreshUser, // expose for RequireAuth [web:57]
  }), [user, authLoading, profileLoading, error, signIn, signUp, signOut, sendPasswordReset, updateUser, refreshUser]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
};