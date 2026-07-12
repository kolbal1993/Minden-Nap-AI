/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AdminSettings — Real Firestore `settings/site` document read/write.
 * No localStorage-based settings.
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Save,
  Globe,
  Bell,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import AdminSidebar from '../components/AdminSidebar';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Skeleton from '../components/Skeleton';

interface SiteSettings {
  siteName: string;
  contactEmail: string;
  isMaintenanceMode: boolean;
  emailOnContact: boolean;
  weeklyAnalyticsDigest: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Minden Nap AI',
  contactEmail: 'info@mindennapai.hu',
  isMaintenanceMode: false,
  emailOnContact: true,
  weeklyAnalyticsDigest: true,
};

const SETTINGS_DOC_PATH = 'settings/site';

export default function AdminSettings() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const [form, setForm] = useState<SiteSettings>(DEFAULT_SETTINGS);

  // Subscribe to Firestore settings/site doc (realtime)
  useEffect(() => {
    isMounted.current = true;
    const docRef = doc(db, SETTINGS_DOC_PATH);

    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<SiteSettings>;
          if (isMounted.current) {
            setForm({
              siteName: data.siteName || DEFAULT_SETTINGS.siteName,
              contactEmail: data.contactEmail || DEFAULT_SETTINGS.contactEmail,
              isMaintenanceMode: data.isMaintenanceMode ?? DEFAULT_SETTINGS.isMaintenanceMode,
              emailOnContact: data.emailOnContact ?? DEFAULT_SETTINGS.emailOnContact,
              weeklyAnalyticsDigest: data.weeklyAnalyticsDigest ?? DEFAULT_SETTINGS.weeklyAnalyticsDigest,
            });
            setLoading(false);
          }
        } else {
          // Doc doesn't exist yet — use defaults, ready to save
          if (isMounted.current) {
            setForm(DEFAULT_SETTINGS);
            setLoading(false);
          }
        }
      },
      (err) => {
        console.error('[AdminSettings] onSnapshot error:', err);
        if (isMounted.current) {
          setActionError(err.message);
          setLoading(false);
        }
      },
    );

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setActionError(null);
    try {
      await setDoc(
        doc(db, SETTINGS_DOC_PATH),
        {
          ...form,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  };

  return (
    <div className="min-h-screen bg-main text-body flex font-sans transition-colors duration-300">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-20 border-b border-main bg-glass backdrop-blur-md flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-hover rounded-xl transition-colors md:hidden text-muted hover:text-title"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-title truncate">Beállítások</h1>
            <span className="hidden sm:flex items-center gap-2 text-xs text-muted">
              <Globe className="w-3.5 h-3.5" /> Firestore: {SETTINGS_DOC_PATH}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isSaved && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-500 text-xs sm:text-sm font-medium hidden xs:block"
              >
                Mentve Firestore-ba!
              </motion.span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Mentés...' : 'Mentés Firestore-ba'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {actionError && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 text-sm">
              Hiba: {actionError}
            </div>
          )}

          {loading ? (
            <div className="space-y-8">
              <Skeleton className="h-48 w-full rounded-3xl" />
              <Skeleton className="h-48 w-full rounded-3xl" />
              <Skeleton className="h-48 w-full rounded-3xl" />
            </div>
          ) : (
            <div className="max-w-4xl space-y-8">
              {/* General Settings */}
              <section className="bg-card rounded-3xl p-8 space-y-6 shadow-xl border-none">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="text-blue-600 w-6 h-6" />
                  <h2 className="text-xl font-bold text-title">Általános</h2>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Oldal Neve</label>
                  <input
                    type="text"
                    value={form.siteName}
                    onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                    className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Kapcsolattartó E-mail</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-hover border border-main">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${form.isMaintenanceMode ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                    <div>
                      <h3 className="font-bold text-sm text-title">Karbantartás Mód</h3>
                      <p className="text-xs text-muted">Ha bekapcsolod, a felhasználók csak egy karbantartási oldalt látnak.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isMaintenanceMode}
                      onChange={(e) => setForm({ ...form, isMaintenanceMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-hover rounded-full peer peer-checked:bg-red-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-main" />
                  </label>
                </div>
              </section>

              {/* Notifications */}
              <section className="bg-card rounded-3xl p-8 space-y-6 shadow-xl border-none">
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="text-orange-500 w-6 h-6" />
                  <h2 className="text-xl font-bold text-title">Értesítési Beállítások</h2>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.emailOnContact}
                    onChange={(e) => setForm({ ...form, emailOnContact: e.target.checked })}
                    className="w-5 h-5 rounded border-main bg-hover text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-body group-hover:text-title transition-colors">Email értesítés új kapcsolatfelvételről</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.weeklyAnalyticsDigest}
                    onChange={(e) => setForm({ ...form, weeklyAnalyticsDigest: e.target.checked })}
                    className="w-5 h-5 rounded border-main bg-hover text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-body group-hover:text-title transition-colors">Heti analitikai összefoglaló küldése</span>
                </label>
              </section>

              {/* Security Settings */}
              <section className="bg-card rounded-3xl p-8 space-y-6 shadow-xl border-none">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="text-green-500 w-6 h-6" />
                  <h2 className="text-xl font-bold text-title">Biztonság</h2>
                </div>
                <p className="text-xs text-muted">A biztonsági beállítások (jelszóváltoztatás, 2FA) később kerülnek hozzáadásra.</p>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
