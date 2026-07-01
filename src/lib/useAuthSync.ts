import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Syncs the Firebase auth user profile to Firestore on auth state changes.
 * Kept in a dedicated hook so Firebase SDK is only imported here.
 * Top-level App mounts this once, then routes are lazy-loaded.
 */
export function useAuthSync() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            uid: user.uid,
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
            lastSeen: serverTimestamp(),
            status: 'online',
          },
          { merge: true },
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[useAuthSync] profile sync failed:', err);
      }
    });
    return () => unsubscribe();
  }, []);
}
