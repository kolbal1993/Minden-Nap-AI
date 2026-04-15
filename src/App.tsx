/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import ScrollToTop from './components/ScrollToTop';
import DynamicBackground from './components/DynamicBackground';
import { ToastProvider } from './components/ToastProvider';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminCourses = lazy(() => import('./pages/AdminCourses'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdminContacts = lazy(() => import('./pages/AdminContacts'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminCampaigns = lazy(() => import('./pages/AdminCampaigns'));
const AdminNotifications = lazy(() => import('./pages/AdminNotifications'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const AIDictionaryPage = lazy(() => import('./pages/AIDictionaryPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user profile to Firestore
        const userRef = doc(db, 'users', user.uid);
        try {
          await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
            lastSeen: serverTimestamp(),
            status: 'online'
          }, { merge: true });
        } catch (error) {
          console.error('Error syncing user profile:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <DynamicBackground />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
            <Route path="/community" element={<CommunityPage />} />
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
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/admin" element={<AdminAnalytics />} />
            <Route path="/admin/posts" element={<AdminDashboard />} />
            <Route path="/admin/tudastar" element={<AdminCourses />} />
            <Route path="/admin/contacts" element={<AdminContacts />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/campaigns" element={<AdminCampaigns />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Routes>
        </Suspense>
      </Router>
    </ToastProvider>
  );
}
