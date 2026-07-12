/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AdminSettings — backed by Firestore `settings/site` (single document).
 * The hook provides a one-shot getDocs; write operations use setDoc.
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save,
  Globe,
  Bell,
  Shield,
  Menu,
  Settings as SettingsIcon,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import AdminSidebar from '../components/AdminSidebar';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

interface SiteSettings {
  siteName: string;
  contactEmail: string;
  isMaintenanceMode: boolean;
  emailOnContact: boolean;
  weeklyDigest: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Minden Nap AI',
  contactEmail: 'info@mindennapai.hu',
  isMaintenanceMode: false,
  emailOnContact: true,
  weeklyDigest: true,
};

export default function AdminSettings() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings/site once on mount (one-shot getDoc; no realtime needed for a global config doc)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'site'));
        if (!isMounted) return;
        if (snap.exists()) {
          const data = snap.data() as Partial<SiteSettings>;
          const merged: SiteSettings = { ...DEFAULT_SETTINGS, ...data };
          setSettings(merged);
          setOriginalSettings(merged);
        }
        setLoading(false);
      } catch (err) {
        console.error('[AdminSettings] load error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await setDoc(
        doc(db, 'settings', 'site'),
        {
          ...settings,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setOriginalSettings(settings);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('[AdminSettings] save error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  if (loading) {
    return (
      <div className="min-h-screen bg-main text-body flex font-sans transition-colors duration-300">
        <div className="fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 -translate-x-full transition-transform duration-300 ease-in-out">
          <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
        </div>
        <main className="flex-1 flex flex-col overflow-hidden w-full">
          <header className="h-20 border-b border-main bg-glass backdrop-blur-md flex items-center justify-between px-4 sm:px-8 shrink-0">
            <div className="flex items-center gap-4 sm:gap-6">
              <h1 className="text-lg sm:text-xl font-bold text-title">Beállítások</h1>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-4xl space-y-8">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="min-h-screen bg-main text-body flex font-sans transition-colors duration-300">
        <div className="fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 -translate-x-full transition-transform duration-300 ease-in-out">
          <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
        </div>
        <main className="flex-1 flex flex-col overflow-hidden w-full">
          <header className="h-20 border-b border-main bg-glass backdrop-blur-md flex items-center px-4 sm:px-8 shrink-0">
            <h1 className="text-lg sm:text-xl font-bold text-title">Beállítások</h1>
          </header>
          <div className="flex-1 overflow-auto p-8">
            <EmptyState
              icon={AlertCircle}
              title="Nem sikerült betölteni a beállításokat"
              description={error}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main text-body flex font-sans transition-colors duration-300">
      {/* Sidebar Overlay */}
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

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-20 border-b border-main bg-glass backdrop-blur-md flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-hover rounded-xl transition-colors md:hidden text-muted hover:text-title"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-title truncate">Beállítások</h1>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && !isSaved && (
              <button
                onClick={handleReset}
                className="text-muted hover:text-title text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Visszaállítás
              </button>
            )}
            {isSaved && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-500 text-xs sm:text-sm font-medium hidden xs:inline-flex items-center gap-1.5"
              >
                ✓ Mentve
              </motion.span>
            )}
            {error && (
              <span className="text-red-500 text-xs font-medium">{error}</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <Save className="w-4 h-4" /> {saving ? 'Mentés...' : 'Mentés'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl space-y-8">
            {/* General Settings */}
            <section className="bg-card rounded-3xl p-8 space-y-6 shadow-xl border-none">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="text-blue-600 w-6 h-6" />
                <h2 className="text-xl font-bold text-title">Általános beállítások</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider">Weboldal neve</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider">Kapcsolati email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-hover rounded-2xl border border-main">
                <div className="space-y-1">
                  <p className="font-bold text-title">Karbantartási mód</p>
                  <p className="text-sm text-muted">Ha be van kapcsolva, az oldal nem lesz elérhető a látogatók számára.</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, isMaintenanceMode: !settings.isMaintenanceMode })}
                  className={`w-14 h-8 rounded-full transition-all relative ${settings.isMaintenanceMode ? 'bg-blue-600' : 'bg-muted'}`}
                  aria-label="Karbantartási mód kapcsoló"
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.isMaintenanceMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </section>

            {/* Notification Settings */}
            <section className="bg-card rounded-3xl p-8 space-y-6 shadow-xl border-none">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="text-yellow-500 w-6 h-6" />
                <h2 className="text-xl font-bold text-title">Értesítések</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={settings.emailOnContact}
                    onChange={(e) => setSettings({ ...settings, emailOnContact: e.target.checked })}
                    className="w-5 h-5 rounded border-main bg-hover text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-body group-hover:text-title transition-colors">Email értesítés új kapcsolatfelvételről</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={settings.weeklyDigest}
                    onChange={(e) => setSettings({ ...settings, weeklyDigest: e.target.checked })}
                    className="w-5 h-5 rounded border-main bg-hover text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-body group-hover:text-title transition-colors">Heti analitikai összefoglaló küldése</span>
                </label>
              </div>
            </section>

            {/* Security Settings */}
            <section className="bg-card rounded-3xl p-8 space-y-6 shadow-xl border-none">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="text-green-500 w-6 h-6" />
                <h2 className="text-xl font-bold text-title">Biztonság</h2>
              </div>
              <p className="text-sm text-muted">
                A jelszó megváltoztatása a Firebase Authentication szolgáltatáson keresztül történik.
              </p>
              <button
                onClick={() => alert('A jelszó megváltoztatása a Firebase Auth fiókbeállításokban érhető el.')}
                className="bg-hover hover:bg-hover/80 border border-main px-6 py-3 rounded-xl text-sm font-bold transition-all text-title"
              >
                Admin jelszó megváltoztatása
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
