/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AdminNotifications — Real Firestore `notifications` collection (realtime onSnapshot).
 * No localStorage, no mock notifications.
 */

import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Trash2,
  Search,
  Plus,
  X,
  Menu,
  Megaphone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  ShieldCheck,
  BookOpen,
  ExternalLink,
  Database,
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface NotificationDoc {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  icon?: string;
  read: boolean;
  createdAt?: any;
}

export default function AdminNotifications() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'admin' as 'admin' | 'news' | 'course',
    icon: 'Bell',
    link: '',
    userId: 'all',
  });

  // Firestore realtime notifications
  const { data: notifsRaw, loading, error } = useFirestoreCollection('notifications', {
    orderBy: 'createdAt',
    max: 500,
  });

  const notifications: NotificationDoc[] = useMemo(
    () => notifsRaw as unknown as NotificationDoc[],
    [notifsRaw],
  );

  const handleNotificationClick = (link?: string) => {
    if (!link) return;
    if (link.startsWith('http')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      navigate(link);
    }
  };

  const handleDeleteClick = (id: string) => {
    setNotificationToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!notificationToDelete) return;
    setActionError(null);
    try {
      await deleteDoc(doc(db, 'notifications', notificationToDelete));
      setIsDeleteConfirmOpen(false);
      setNotificationToDelete(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleSendNotification = async () => {
    if (!formData.title || !formData.message) return;
    setActionError(null);
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: formData.userId,
        type: formData.type,
        title: formData.title,
        message: formData.message,
        icon: formData.icon,
        link: formData.link || null,
        read: false,
        createdAt: serverTimestamp(),
      });
      setIsModalOpen(false);
      setFormData({ title: '', message: '', type: 'admin', icon: 'Bell', link: '', userId: 'all' });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error('[AdminNotifications] markRead error:', err);
    }
  };

  const filteredNotifications = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return notifications.filter(
      (n) =>
        (n.title || '').toLowerCase().includes(term) ||
        (n.message || '').toLowerCase().includes(term),
    );
  }, [notifications, searchTerm]);

  const formatNotifDate = (raw: any): string => {
    if (!raw) return '';
    try {
      if (typeof raw === 'object' && 'toDate' in raw && typeof raw.toDate === 'function') {
        return raw.toDate().toLocaleString('hu-HU');
      }
      if (typeof raw === 'string') return new Date(raw).toLocaleString('hu-HU');
      if (typeof raw === 'number') return new Date(raw).toLocaleString('hu-HU');
      if (typeof raw === 'object' && raw !== null && 'seconds' in raw) {
        return new Date(raw.seconds * 1000).toLocaleString('hu-HU');
      }
    } catch {
      /* ignore */
    }
    return '';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news':
        return <Megaphone className="w-4 h-4 text-orange-400" />;
      case 'course':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'comment':
      case 'reaction':
        return <Bell className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-muted" />;
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
            <h1 className="text-lg sm:text-xl font-bold text-title truncate">Értesítések</h1>
            <span className="hidden sm:flex items-center gap-2 text-xs text-muted">
              <Database className="w-3.5 h-3.5" /> Firestore: {notifications.length} értesítés
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Keresés..."
                className="bg-card border border-main rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 w-64 text-title placeholder:text-muted"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Új értesítés</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {actionError && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 text-sm">
              Hiba: {actionError}
            </div>
          )}

          <div className="bg-card rounded-3xl overflow-hidden shadow-xl border-none">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-500">Hiba: {error.message}</div>
            ) : filteredNotifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title={searchTerm ? 'Nincs találat' : 'Még nincsenek értesítések'}
                description={
                  searchTerm
                    ? 'Próbálj más keresési feltételt.'
                    : 'Hozz létre az első rendszerértesítést vagy várd meg, amíg a rendszer generál egyet.'
                }
                cta={
                  searchTerm
                    ? undefined
                    : { label: 'Új értesítés küldése', onClick: () => setIsModalOpen(true), icon: Plus }
                }
              />
            ) : (
              <div className="divide-y divide-main">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 sm:p-6 hover:bg-hover transition-all flex items-start gap-4 sm:gap-6 ${
                      !notif.read ? 'bg-blue-500/[0.03] border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl bg-hover border border-main flex items-center justify-center shrink-0 cursor-pointer"
                      onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                    >
                      <div className="relative">
                        {getTypeIcon(notif.type || 'admin')}
                        {!notif.read && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-sm truncate ${!notif.read ? 'text-title' : 'text-muted'}`}
                          >
                            {notif.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-[10px] text-muted">
                              <Clock className="w-3 h-3" />
                              {formatNotifDate(notif.createdAt)}
                            </span>
                            {notif.read && (
                              <span className="flex items-center gap-1 text-[10px] text-green-500 font-medium">
                                <CheckCircle2 className="w-3 h-3" /> Olvasott
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {notif.link && (
                            <button
                              onClick={() => handleNotificationClick(notif.link)}
                              className="p-2 hover:bg-hover rounded-lg text-muted hover:text-title transition-colors"
                              title="Megnyitás"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(notif.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-500 transition-colors"
                            title="Törlés"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Notification Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-main rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-main bg-hover flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-title">
                  <Bell className="text-blue-600" /> Értesítés Küldése
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-card rounded-full text-muted hover:text-title">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Ikon Kiválasztása</label>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {[
                      { id: 'Bell', icon: Bell },
                      { id: 'Megaphone', icon: Megaphone },
                      { id: 'BookOpen', icon: BookOpen },
                      { id: 'Zap', icon: Zap },
                      { id: 'ShieldCheck', icon: ShieldCheck },
                      { id: 'AlertCircle', icon: AlertCircle },
                      { id: 'CheckCircle2', icon: CheckCircle2 },
                      { id: 'Clock', icon: Clock },
                      { id: 'Plus', icon: Plus },
                      { id: 'ExternalLink', icon: ExternalLink },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setFormData({ ...formData, icon: item.id })}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                          formData.icon === item.id
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                            : 'bg-hover border-main text-muted hover:bg-hover/80'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Cím</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Pl: Karbantartás várható..."
                    className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Üzenet</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Az értesítés részletes tartalma..."
                    className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 min-h-[100px] resize-none text-title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Típus</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full bg-hover border border-main rounded-xl px-4 py-3 text-title"
                    >
                      <option value="admin">Admin</option>
                      <option value="news">Hír</option>
                      <option value="course">Kurzus</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Célcsoport</label>
                    <select
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      className="w-full bg-hover border border-main rounded-xl px-4 py-3 text-title"
                    >
                      <option value="all">Mindenki</option>
                      <option value="premium">Csak prémium</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Link (opcionális)</label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="Pl: /news/1"
                    className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-title"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    onClick={handleSendNotification}
                    disabled={!formData.title || !formData.message}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    <Zap className="w-5 h-5" /> Értesítés mentése Firestore-ba
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-card border border-main rounded-xl p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="text-red-500 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-center mb-2 text-title">Biztosan törölni szeretnéd?</h2>
              <p className="text-muted text-center mb-8">Az értesítés véglegesen törlődik a Firestore-ból.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 bg-hover hover:bg-hover/80 text-title py-4 rounded-2xl font-bold transition-all border border-main"
                >
                  Mégse
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20"
                >
                  Törlés
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
