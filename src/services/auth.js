import { auth, db } from '../lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
  getIdToken
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const signInEmail = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  if (!user.emailVerified){
    await signOut(auth);
    const err = new Error ("Please verify your email before signing in.");
    err.code = 'auth/email-not-verified';
    throw err;
  }
  await getIdToken(user, true);
  return user;
};

export const signUpEmail = async (email, password) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    email,
    role: 'user',
    createdAt: serverTimestamp(),
  }, { merge: true });

  
  const actionCodeSettings = {
    url: `${window.location.origin}/auth/action`,
    handleCodeInApp: true,
  };

  await sendEmailVerification(cred.user, actionCodeSettings);
  return cred.user;
};

export const resendVerificationEmail = async () => {
  if (!auth.currentUser) throw new Error('You need to be signed in.');
  const actionCodeSettings = {
    url: `${window.location.origin}/auth/verify-done`,
    handleCodeInApp: false,
  };
  await sendEmailVerification(auth.currentUser, actionCodeSettings);
  return true;
};


export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

export const logout = async () => {
  await signOut(auth);
};

export const changePassword = async (newPassword) => {
  if (!auth.currentUser) throw new Error('No authenticated user');
  await updatePassword(auth.currentUser, newPassword);
};

export const resetPasswordEmail = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const refreshVerificationStatus = async () => {
  const user = auth.currentUser;
  if (!user) return { verified: false };
  await reload(user); // fetch latest profile from server
  const verified = user.emailVerified;
  if (verified) {
    await getIdToken(user, true); // refresh token so email_verified claim updates
  }
  return { verified };
};