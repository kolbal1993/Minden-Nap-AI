import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  /** If set, only allows users with this role (e.g. 'admin') */
  requireRole?: 'admin' | 'user';
  /** Loading UI while auth state resolves */
  fallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
  </div>
);

/**
 * AuthGuard — Wraps a route element.
 * - Redirects to /login if user is not authenticated
 * - If requireRole="admin", also redirects to / if user is not admin
 * - Preserves the original location in `?redirect=` so login can return here
 */
export default function AuthGuard({ children, requireRole, fallback }: AuthGuardProps) {
  const { user, loading, role, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <>{fallback ?? <DefaultFallback />}</>;

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (requireRole === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
