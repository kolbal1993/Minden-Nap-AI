/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AdminUsers — backed by Firestore `users/{uid}` collection.
 * Realtime onSnapshot, search/filter, block/unblock, premium extension,
 * billing history, bulk actions. EmptyState + Skeleton.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Users,
  Crown,
  User as UserIcon,
  Ban,
  Unlock,
  ShieldAlert,
  X as CloseIcon,
  Download,
  Mail,
  Calendar,
  CreditCard,
  Trash2,
  MessageSquare,
  CheckSquare,
  Square,
  Send,
  AlertOctagon,
  Menu,
} from 'lucide-react';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import AdminSidebar from '../components/AdminSidebar';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useFirestoreCollection, FirestoreDoc } from '../hooks/useFirestoreCollection';

interface BillingRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed';
  method: string;
}

interface UserDataDoc extends FirestoreDoc {
  uid?: string;
  name?: string;
  displayName?: string;
  email?: string;
  role?: 'admin' | 'moderator' | 'user';
  isPremium?: boolean;
  premiumSince?: string;
  premiumUntil?: string;
  totalPremiumMonths?: number;
  registrationDate?: string;
  createdAt?: { seconds: number; nanoseconds: number } | string;
  lastLogin?: string;
  lastActive?: string;
  lastSeen?: { seconds: number; nanoseconds: number } | string;
  avatar?: string;
  photoURL?: string;
  isBlocked?: boolean;
  blockedUntil?: string;
  billingHistory?: BillingRecord[];
}

type FilterType = 'all' | 'premium' | 'free';
type BlockDuration = '1h' | '24h' | '7d' | '30d' | 'permanent';

const formatTimestamp = (val: unknown): string | null => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && 'seconds' in val) {
    const ts = val as { seconds: number; nanoseconds: number };
    return new Date(ts.seconds * 1000).toISOString();
  }
  return null;
};

const dateFromAny = (val: unknown): Date | null => {
  if (!val) return null;
  if (typeof val === 'string') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'object' && val !== null && 'seconds' in val) {
    const ts = val as { seconds: number; nanoseconds: number };
    return new Date(ts.seconds * 1000);
  }
  return null;
};

export default function AdminUsers() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDataDoc | null>(null);
  const [blockDuration, setBlockDuration] = useState<BlockDuration>('24h');

  // Bulk + secondary modals
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isExpirationModalOpen, setIsExpirationModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageType, setMessageType] = useState<'system' | 'email'>('system');
  const [messageContent, setMessageContent] = useState('');
  const [extensionDays, setExtensionDays] = useState<number | 'forever'>(30);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: users,
    loading,
    error,
  } = useFirestoreCollection('users', {
    orderBy: 'createdAt',
    orderDirection: 'desc',
    realtime: true,
    max: 500,
  });

  const handleBlockAction = (user: UserDataDoc) => {
    if (user.isBlocked) {
      // unblock immediately
      (async () => {
        try {
          await updateDoc(doc(db, 'users', user.id), {
            isBlocked: false,
            blockedUntil: null,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          console.error('[AdminUsers] unblock error:', err);
        }
      })();
    } else {
      setSelectedUser(user);
      setIsBlockModalOpen(true);
    }
  };

  const confirmBlock = async () => {
    if (!selectedUser) return;
    let until: string | null = null;
    const now = new Date();
    if (blockDuration === '1h') until = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    else if (blockDuration === '24h') until = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    else if (blockDuration === '7d') until = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    else if (blockDuration === '30d') until = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    else until = 'permanent';

    try {
      await updateDoc(doc(db, 'users', selectedUser.id), {
        isBlocked: true,
        blockedUntil: until,
        updatedAt: serverTimestamp(),
      });
      setIsBlockModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('[AdminUsers] block error:', err);
      setActionError(err instanceof Error ? err.message : 'Hiba a blokkolásnál.');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const filteredUsers = useMemo(() => {
    const list = users as UserDataDoc[];
    return list.filter((user) => {
      const name = (user.name || user.displayName || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'premium' && !!user.isPremium) ||
        (filterType === 'free' && !user.isPremium);
      return matchesSearch && matchesFilter;
    });
  }, [users, searchTerm, filterType]);

  const toggleAllSelection = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) return;
    setIsDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedUserIds.map((id) => deleteDoc(doc(db, 'users', id))));
      setSelectedUserIds([]);
      setIsDeleteConfirmOpen(false);
    } catch (err) {
      console.error('[AdminUsers] bulk delete error:', err);
      setActionError(err instanceof Error ? err.message : 'Hiba a törlésnél.');
    }
  };

  const handleDownloadInvoice = (billId: string) => {
    const bill = selectedUser?.billingHistory?.find((b) => b.id === billId);
    if (!bill) return;

    const content = `Számla: ${bill.id}\nDátum: ${bill.date}\nÖsszeg: ${bill.amount} ${bill.currency}\nStátusz: ${bill.status}\nMód: ${bill.method}\n\nKöszönjük a vásárlást!\nMinden Nap AI Csapata`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `szamla_${bill.id}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Név', 'Email', 'Szerepkör', 'Prémium', 'Regisztráció', 'Utoljára aktív'];
    const rows = filteredUsers.map((u) => {
      const name = u.name || u.displayName || '—';
      const reg = u.registrationDate || formatTimestamp(u.createdAt) || '—';
      const last = u.lastActive || formatTimestamp(u.lastSeen) || '—';
      return [
        u.id,
        name,
        u.email || '—',
        u.role || 'user',
        u.isPremium ? 'Igen' : 'Nem',
        reg,
        last,
      ];
    });

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'felhasznalok_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExtendPremium = async () => {
    if (!selectedUser) return;
    try {
      let newUntil: string;
      if (extensionDays === 'forever') {
        newUntil = '9999-12-31';
      } else {
        const currentUntil = selectedUser.premiumUntil && selectedUser.premiumUntil !== 'Végtelen'
          ? new Date(selectedUser.premiumUntil)
          : new Date();
        const date = new Date(currentUntil.getTime() + (extensionDays as number) * 24 * 60 * 60 * 1000);
        newUntil = date.toISOString().split('T')[0];
      }

      await updateDoc(doc(db, 'users', selectedUser.id), {
        isPremium: true,
        premiumUntil: newUntil,
        updatedAt: serverTimestamp(),
      });
      setIsExpirationModalOpen(false);
    } catch (err) {
      console.error('[AdminUsers] extend premium error:', err);
      setActionError(err instanceof Error ? err.message : 'Hiba a hosszabbításnál.');
    }
  };

  const handleSendMessage = () => {
    alert(`Üzenet elküldve (${messageType}): ${messageContent}`);
    setIsMessageModalOpen(false);
    setMessageContent('');
  };

  const getChurnStatus = (lastActive: string | null) => {
    if (!lastActive) return { label: 'Ismeretlen', color: 'text-muted bg-hover border-main' };
    const last = new Date(lastActive);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 3) return { label: 'Aktív', color: 'text-green-500 bg-green-500/10 border-green-500/20' };
    if (diffDays < 7) return { label: 'Inaktív', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' };
    return { label: 'Churn veszély', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
  };

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
            <h1 className="text-lg sm:text-xl font-bold text-title truncate">Felhasználók</h1>
            <button
              onClick={handleExportCSV}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-hover hover:bg-hover/80 border border-main rounded-xl text-xs font-bold transition-all text-title"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Keresés név vagy email alapján..."
                className="bg-card border border-main rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 w-80 text-title placeholder:text-muted"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchTerm('')}
              />
            </div>
            <div className="flex bg-hover border border-main rounded-xl p-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-blue-600 text-white' : 'text-muted hover:text-title'}`}
              >
                Összes
              </button>
              <button
                onClick={() => setFilterType('premium')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'premium' ? 'bg-orange-500 text-white' : 'text-muted hover:text-title'}`}
              >
                Prémium
              </button>
              <button
                onClick={() => setFilterType('free')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'free' ? 'bg-card text-title' : 'text-muted hover:text-title'}`}
              >
                Ingyenes
              </button>
            </div>
          </div>
        </header>

        {/* Table Container */}
        <div className="flex-1 overflow-auto p-8">
          {actionError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
              {actionError}
              <button onClick={() => setActionError(null)} className="float-right font-bold">×</button>
            </div>
          )}

          {selectedUserIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-blue-600 rounded-2xl flex items-center justify-between shadow-lg shadow-blue-600/20"
            >
              <div className="flex items-center gap-4">
                <span className="font-bold text-sm text-white">{selectedUserIds.length} felhasználó kijelölve</span>
                <div className="h-4 w-px bg-white/20" />
                <button
                  onClick={() => setIsMessageModalOpen(true)}
                  className="flex items-center gap-2 text-xs font-bold hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors text-white"
                >
                  <MessageSquare className="w-4 h-4" /> Csoportos üzenet
                </button>
              </div>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Törlés
              </button>
            </motion.div>
          )}

          {loading ? (
            <div className="bg-card rounded-3xl overflow-hidden shadow-xl border-none p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              icon={AlertOctagon}
              title="Nem sikerült betölteni a felhasználókat"
              description={error.message}
            />
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title={searchTerm ? 'Nincs találat' : 'Még nincsenek felhasználók'}
              description={
                searchTerm
                  ? 'A keresésedre nincs találat. Próbálj más kulcsszót.'
                  : 'Amikor valaki regisztrál a platformon, itt fog megjelenni.'
              }
            />
          ) : (
            <div className="bg-card rounded-3xl overflow-hidden shadow-xl border-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-hover border-b border-main">
                    <th className="px-6 py-4 w-12">
                      <button
                        onClick={toggleAllSelection}
                        className="text-muted hover:text-title transition-colors"
                      >
                        {selectedUserIds.length === filteredUsers.length ? (
                          <CheckSquare className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Felhasználó</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Szerepkör</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Tagság</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Lejárat / Churn</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-right">Műveletek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-main">
                  {filteredUsers.map((rawUser) => {
                    const user = rawUser as UserDataDoc;
                    const displayName = user.name || user.displayName || 'Ismeretlen';
                    const userAvatar = user.avatar || user.photoURL;
                    const lastActive =
                      user.lastActive ||
                      formatTimestamp(user.lastSeen) ||
                      formatTimestamp(user.createdAt) ||
                      formatTimestamp(user.lastLogin);
                    const churn = getChurnStatus(lastActive);
                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-hover transition-colors group ${selectedUserIds.includes(user.id) ? 'bg-blue-600/5' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleUserSelection(user.id)}
                            className="text-muted hover:text-title transition-colors"
                          >
                            {selectedUserIds.includes(user.id) ? (
                              <CheckSquare className="w-5 h-5 text-blue-500" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-hover shrink-0 border border-main">
                              {userAvatar ? (
                                <img src={userAvatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-600/20 text-blue-500">
                                  <UserIcon className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-title">{displayName}</span>
                              <span className="text-xs text-muted">{user.email || '—'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border w-fit ${
                            user.role === 'admin' ? 'text-purple-500 bg-purple-500/10 border-purple-500/20' :
                            user.role === 'moderator' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' :
                            'text-muted bg-hover border-main'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {user.isPremium ? (
                              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-500/10 px-2 py-1 rounded-md border border-orange-500/20 w-fit">
                                <Crown className="w-3 h-3 fill-current" /> Prémium
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted bg-hover px-2 py-1 rounded-md border border-main w-fit">
                                Ingyenes
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {user.isPremium && user.premiumUntil && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-body">Lejár: {user.premiumUntil}</span>
                                <button
                                  onClick={() => { setSelectedUser(user); setIsExpirationModalOpen(true); }}
                                  className="p-1 hover:bg-hover rounded transition-colors text-blue-500"
                                  title="Hosszabbítás"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border w-fit ${churn.color}`}>
                              {churn.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setSelectedUser(user); setIsBillingModalOpen(true); }}
                              className="p-2 bg-hover hover:bg-hover/80 text-muted hover:text-title rounded-xl transition-all border border-main"
                              title="Számlázási előzmények"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelectedUser(user); setIsMessageModalOpen(true); }}
                              className="p-2 bg-hover hover:bg-hover/80 text-muted hover:text-title rounded-xl transition-all border border-main"
                              title="Üzenet küldése"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleBlockAction(user)}
                              className={`p-2 rounded-xl transition-all border ${
                                user.isBlocked
                                  ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                                  : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                              }`}
                              title={user.isBlocked ? 'Feloldás' : 'Blokkolás'}
                            >
                              {user.isBlocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Block User Modal */}
      <AnimatePresence>
        {isBlockModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBlockModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-main rounded-xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-600" />

              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                  <ShieldAlert className="text-red-500 w-6 h-6" />
                </div>
                <button
                  onClick={() => setIsBlockModalOpen(false)}
                  className="p-2 hover:bg-hover rounded-xl transition-colors text-muted hover:text-title"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-xl font-bold mb-2 text-title">Felhasználó blokkolása</h2>
              <p className="text-muted text-sm mb-8">
                Biztosan blokkolni szeretnéd <span className="text-title font-medium">{selectedUser?.name || selectedUser?.displayName}</span> felhasználót? Válaszd ki az időtartamot.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { id: '1h', label: '1 óra' },
                  { id: '24h', label: '24 óra' },
                  { id: '7d', label: '1 hét' },
                  { id: '30d', label: '1 hónap' },
                  { id: 'permanent', label: 'Visszakapcsolásig (Végleges)' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setBlockDuration(option.id as BlockDuration)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
                      blockDuration === option.id
                        ? 'bg-red-500/10 border-red-500/50 text-title'
                        : 'bg-hover border-main text-muted hover:bg-hover/80'
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      blockDuration === option.id ? 'border-red-500' : 'border-main'
                    }`}>
                      {blockDuration === option.id && <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsBlockModalOpen(false)}
                  className="flex-1 bg-hover hover:bg-hover/80 text-title py-4 rounded-2xl font-bold transition-all border border-main"
                >
                  Mégse
                </button>
                <button
                  onClick={confirmBlock}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20"
                >
                  Blokkolás
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Billing History Modal */}
      <AnimatePresence>
        {isBillingModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBillingModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-card border border-main rounded-xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <CreditCard className="text-blue-500 w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-title">Számlázási előzmények</h2>
                    <p className="text-muted text-sm">{selectedUser.name || selectedUser.displayName || 'Ismeretlen'}</p>
                  </div>
                </div>
                <button onClick={() => setIsBillingModalOpen(false)} className="p-2 hover:bg-hover rounded-xl transition-colors text-muted hover:text-title"><CloseIcon className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                {selectedUser.billingHistory && selectedUser.billingHistory.length > 0 ? selectedUser.billingHistory.map((bill) => (
                  <div key={bill.id} className="bg-hover border border-main p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${bill.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-bold text-sm text-title">{bill.amount} {bill.currency}</p>
                        <p className="text-xs text-muted">{bill.date} • {bill.method}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadInvoice(bill.id)}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Számla letöltése
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-12 text-muted">Nincsenek korábbi befizetések.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expiration Management Modal */}
      <AnimatePresence>
        {isExpirationModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsExpirationModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-card border border-main rounded-xl p-8 shadow-2xl">
              <h2 className="text-xl font-bold mb-2 text-title">Lejárat kezelése</h2>
              <p className="text-muted text-sm mb-6">Manuális hosszabbítás vagy kedvezményes időszak hozzáadása.</p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-widest mb-2 block">Hosszabbítás (nap)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[7, 30, 90].map((days) => (
                      <button
                        key={days}
                        onClick={() => setExtensionDays(days)}
                        className={`py-3 rounded-xl border transition-all font-bold text-sm ${extensionDays === days ? 'bg-blue-600 border-blue-500 text-white' : 'bg-hover border-main text-muted hover:bg-hover/80'}`}
                      >
                        +{days} nap
                      </button>
                    ))}
                    <button
                      onClick={() => setExtensionDays('forever')}
                      className={`py-3 rounded-xl border transition-all font-bold text-sm ${extensionDays === 'forever' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-hover border-main text-muted hover:bg-hover/80'}`}
                    >
                      Örökre
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-widest mb-2 block">Egyedi érték</label>
                  <input
                    type="number"
                    value={extensionDays === 'forever' ? '' : extensionDays}
                    onChange={(e) => setExtensionDays(parseInt(e.target.value) || 0)}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    disabled={extensionDays === 'forever'}
                    className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 disabled:opacity-50 text-title"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsExpirationModalOpen(false)} className="flex-1 py-4 bg-hover rounded-2xl font-bold text-title border border-main transition-all">Mégse</button>
                <button onClick={handleExtendPremium} className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold text-white shadow-lg shadow-blue-600/20 transition-all">Hosszabbítás</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Message Modal */}
      <AnimatePresence>
        {isMessageModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMessageModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-card border border-main rounded-xl p-8 shadow-2xl">
              <h2 className="text-xl font-bold mb-2 text-title">Üzenet küldése</h2>
              <p className="text-muted text-sm mb-6">
                {selectedUserIds.length > 0
                  ? `Üzenet küldése ${selectedUserIds.length} kijelölt felhasználónak.`
                  : `Üzenet küldése: ${selectedUser?.name || selectedUser?.displayName || 'ismeretlen'}`}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex bg-hover p-1 rounded-xl border border-main">
                  <button onClick={() => setMessageType('system')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${messageType === 'system' ? 'bg-blue-600 text-white' : 'text-muted'}`}>Rendszer értesítés</button>
                  <button onClick={() => setMessageType('email')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${messageType === 'email' ? 'bg-blue-600 text-white' : 'text-muted'}`}>E-mail</button>
                </div>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => e.currentTarget.select()}
                  placeholder="Írd ide az üzenetet..."
                  className="w-full h-40 bg-hover border border-main rounded-2xl p-4 focus:outline-none focus:border-blue-500 resize-none text-body placeholder:text-muted"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsMessageModalOpen(false)} className="flex-1 py-4 bg-hover rounded-2xl font-bold text-title border border-main transition-all">Mégse</button>
                <button onClick={handleSendMessage} className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"><Send className="w-4 h-4" /> Küldés</button>
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
              <p className="text-muted text-center mb-8">
                {selectedUserIds.length > 0
                  ? `Biztosan törölni szeretnél ${selectedUserIds.length} kijelölt felhasználót? Ez a művelet nem vonható vissza.`
                  : 'Ez a művelet nem vonható vissza. A kijelölt adatok véglegesen törlődik.'}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 bg-hover hover:bg-hover/80 text-title py-4 rounded-2xl font-bold transition-all border border-main"
                >
                  Mégse
                </button>
                <button
                  onClick={confirmBulkDelete}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20"
                >
                  Törlés
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
