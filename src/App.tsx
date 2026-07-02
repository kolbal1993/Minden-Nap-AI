import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ToastProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Container, Card } from './components/ui';

// Lazy load pages (already lazy, but pre-grouped for better caching)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const AIDictionaryPage = lazy(() => import('./pages/AIDictionaryPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

// Admin pages — keep them in a separate chunk (only loaded when admin routes hit)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminCourses = lazy(() => import('./pages/AdminCourses'));
const AdminContacts = lazy(() => import('./pages/AdminContacts'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminCampaigns = lazy(() => import('./pages/AdminCampaigns'));
const AdminNotifications = lazy(() => import('./pages/AdminNotifications'));

// Background + scroll + auth-sync are needed at top level
import ScrollToTop from './components/ScrollToTop';
import DynamicBackground from './components/DynamicBackground';
import AuthGuard from './components/AuthGuard';
import { useAuthSync } from './lib/useAuthSync';

const PageLoader = () => (
  <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  useAuthSync();

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <DynamicBackground />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:id" element={<NewsDetailPage />} />
              <Route path="/community" element={<AuthGuard><CommunityPage /></AuthGuard>} />
              <Route path="/tudastar" element={<CoursesPage />} />
              <Route path="/tudastar/szotar" element={<AIDictionaryPage />} />
              <Route path="/tudastar/eszkoztar" element={<ToolsPage />} />
              <Route path="/tudastar/:id" element={<CourseDetailPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
              <Route path="/messages" element={<AuthGuard><MessagesPage /></AuthGuard>} />
              <Route path="/admin" element={<AuthGuard requireRole="admin"><AdminAnalytics /></AuthGuard>} />
              <Route path="/admin/posts" element={<AuthGuard requireRole="admin"><AdminDashboard /></AuthGuard>} />
              <Route path="/admin/tudastar" element={<AuthGuard requireRole="admin"><AdminCourses /></AuthGuard>} />
              <Route path="/admin/contacts" element={<AuthGuard requireRole="admin"><AdminContacts /></AuthGuard>} />
              <Route path="/admin/users" element={<AuthGuard requireRole="admin"><AdminUsers /></AuthGuard>} />
              <Route path="/admin/notifications" element={<AuthGuard requireRole="admin"><AdminNotifications /></AuthGuard>} />
              <Route path="/admin/campaigns" element={<AuthGuard requireRole="admin"><AdminCampaigns /></AuthGuard>} />
              <Route path="/admin/analytics" element={<AuthGuard requireRole="admin"><AdminAnalytics /></AuthGuard>} />
              <Route path="/admin/settings" element={<AuthGuard requireRole="admin"><AdminSettings /></AuthGuard>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6">
      <Container size="md" className="text-center">
        <Card variant="elevated" className="p-12">
          <h1 className="text-6xl font-bold text-[var(--text-title)] mb-4">404</h1>
          <p className="text-[var(--text-desc)] mb-8">Az oldal nem található.</p>
          <a
            href="/"
            className="inline-block bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Vissza a főoldalra
          </a>
        </Card>
      </Container>
    </div>
  );
}
