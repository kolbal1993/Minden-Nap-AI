/**
 * useAuth — Centralized auth state hook
 * - Tracks Firebase user
 * - Reads user role from Firebase Auth ID token custom claims (server-verified)
 *   NOT from email or localStorage (security: client-side checks can be spoofed)
 * - Loading state for Suspense / guards
 * - Used by AuthGuard and Navbar
 *
 * IMPORTANT: The custom claim `admin: true` is set via Firebase Admin SDK
 * (server-side). The client gets it through `user.getIdTokenResult()` and it
 * CANNOT be forged by the user. This is the only correct way to check role.
 */
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

export type UserRole = 'admin' | 'user' | 'guest';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('guest');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (!u) {
        setRole('guest');
        try {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userRole');
        } catch {}
        return;
      }
      // Read role from Firebase Auth ID token custom claims (server-verified)
      try {
        const tokenResult = await u.getIdTokenResult(true); // forceRefresh=true to get latest claims
        const isAdmin = !!tokenResult.claims.admin;
        setRole(isAdmin ? 'admin' : 'user');
        // Sync to localStorage for backwards compatibility with any legacy code
        try {
          localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
          localStorage.setItem('isLoggedIn', 'true');
        } catch {}
      } catch (err) {
        console.error('[useAuth] token claims error:', err);
        setRole('user');
      }
    });
    return () => unsubscribe();
  }, []);

  return { user, loading, role, isAuthenticated: !!user, isAdmin: role === 'admin' };
}