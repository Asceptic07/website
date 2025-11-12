import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data();
};

export const requireAdmin = async (uid) => {
  const user = await getUserProfile(uid);
  if (!user || user.role !== 'admin') {
    throw new Error('Admin privileges required');
  }
  return true;
};