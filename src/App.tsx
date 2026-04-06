/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ContactPage from './pages/ContactPage';
import AdminContacts from './pages/AdminContacts';
import AdminAnalytics from './pages/AdminAnalytics';
import ProfilePage from './pages/ProfilePage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AdminSettings from './pages/AdminSettings';
import AdminUsers from './pages/AdminUsers';
import AdminCampaigns from './pages/AdminCampaigns';
import AdminNotifications from './pages/AdminNotifications';
import CommunityPage from './pages/CommunityPage';
import AIDictionaryPage from './pages/AIDictionaryPage';
import ToolsPage from './pages/ToolsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ScrollToTop from './components/ScrollToTop';
import DynamicBackground from './components/DynamicBackground';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <DynamicBackground />
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
    </Router>
  );
}
