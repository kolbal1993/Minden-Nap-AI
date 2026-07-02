/**
 * useAuth — Centralized auth state hook
 * - Tracks Firebase user
 * - Reads user role from localStorage (set on login by LoginPage)
 * - Loading state for Suspense / guards
 * - Used by AuthGuard and AdminGuard
 */
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

export type UserRole = 'admin' | 'user' | 'guest';

const ADMIN_EMAILS = ['admin@mindennapai.hu', 'kolesbalazs93@gmail.com'];

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('guest');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
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
      // Determine role: admin emails OR explicit localStorage role
      try {
        const lsRole = localStorage.getItem('userRole') as UserRole | null;
        if (lsRole === 'admin' || isAdminEmail(u.email)) {
          setRole('admin');
        } else {
          setRole('user');
        }
      } catch {
        setRole(isAdminEmail(u.email) ? 'admin' : 'user');
      }
    });
    return () => unsubscribe();
  }, []);

  return { user, loading, role, isAuthenticated: !!user, isAdmin: role === 'admin' };
}
