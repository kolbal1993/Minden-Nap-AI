/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Users, 
  Crown, 
  User, 
  Filter, 
  ArrowUpDown, 
  Ban, 
  Unlock, 
  Clock, 
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
  ChevronRight, 
  Send, 
  AlertTriangle, 
  Megaphone,
  Bell,
  Menu,
  X
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

interface BillingRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed';
  method: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  isPremium: boolean;
  premiumSince?: string;
  premiumUntil?: string;
  totalPremiumMonths: number;
  registrationDate: string;
  lastLogin: string;
  lastActive: string;
  avatar?: string;
  isBlocked?: boolean;
  blockedUntil?: string; // ISO string or 'permanent'
  billingHistory: BillingRecord[];
}

const MOCK_USERS: UserData[] = [
  {
    id: '1',
    name: 'Kovács János',
    email: 'janos.kovacs@example.com',
    role: 'admin',
    isPremium: true,
    premiumSince: '2026-01-15',
    premiumUntil: '2026-05-15',
    totalPremiumMonths: 3,
    registrationDate: '2026-01-15',
    lastLogin: '2026-04-04',
    lastActive: '2026-04-05T08:00:00Z',
    avatar: 'https://picsum.photos/seed/user1/200/200',
    billingHistory: [
      { id: 'inv_1', date: '2026-01-15', amount: 2990, currency: 'Ft', status: 'success', method: 'Card' },
      { id: 'inv_2', date: '2026-02-15', amount: 2990, currency: 'Ft', status: 'success', method: 'Card' },
      { id: 'inv_3', date: '2026-03-15', amount: 2990, currency: 'Ft', status: 'success', method: 'Card' },
    ]
  },
  {
    id: '2',
    name: 'Szabó Anna',
    email: 'anna.szabo@example.com',
    role: 'user',
    isPremium: false,
    totalPremiumMonths: 0,
    registrationDate: '2026-02-10',
    lastLogin: '2026-04-03',
    lastActive: '2026-04-03T14:20:00Z',
    avatar: 'https://picsum.photos/seed/user2/200/200',
    billingHistory: []
  },
  {
    id: '3',
    name: 'Nagy Péter',
    email: 'peter.nagy@example.com',
    role: 'moderator',
    isPremium: true,
    premiumSince: '2026-03-05',
    premiumUntil: '2026-04-05',
    totalPremiumMonths: 1,
    registrationDate: '2026-03-05',
    lastLogin: '2026-04-04',
    lastActive: '2026-04-04T22:10:00Z',
    avatar: 'https://picsum.photos/seed/user3/200/200',
    billingHistory: [
      { id: 'inv_4', date: '2026-03-05', amount: 2990, currency: 'Ft', status: 'success', method: 'PayPal' },
    ]
  },
  {
    id: '4',
    name: 'Kiss Eszter',
    email: 'eszter.kiss@example.com',
    role: 'user',
    isPremium: false,
    totalPremiumMonths: 2,
    registrationDate: '2026-01-20',
    lastLogin: '2026-04-01',
    lastActive: '2026-04-01T09:45:00Z',
    avatar: 'https://picsum.photos/seed/user4/200/200',
    billingHistory: [
      { id: 'inv_5', date: '2026-01-20', amount: 2990, currency: 'Ft', status: 'success', method: 'Card' },
      { id: 'inv_6', date: '2026-02-20', amount: 2990, currency: 'Ft', status: 'failed', method: 'Card' },
    ]
  },
  {
    id: '5',
    name: 'Tóth Gábor',
    email: 'gabor.toth@example.com',
    role: 'user',
    isPremium: false,
    totalPremiumMonths: 0,
    registrationDate: '2026-03-25',
    lastLogin: '2026-04-04',
    lastActive: '2026-04-05T07:30:00Z',
    avatar: 'https://picsum.photos/seed/user5/200/200',
    billingHistory: []
  }
];

export default function AdminUsers() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [users, setUsers] = useState<UserData[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'premium' | 'free'>('all');
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [blockDuration, setBlockDuration] = useState<'1h' | '24h' | '7d' | '30d' | 'permanent'>('24h');
  
  // New states
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isExpirationModalOpen, setIsExpirationModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageType, setMessageType] = useState<'system' | 'email'>('system');
  const [messageContent, setMessageContent] = useState('');
  const [extensionDays, setExtensionDays] = useState<number | 'forever'>(30);

  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  };

  const handleBlockAction = (user: UserData) => {
    if (user.isBlocked) {
      setUsers(users.map(u => u.id === user.id ? { ...u, isBlocked: false, blockedUntil: undefined } : u));
    } else {
      setSelectedUser(user);
      setIsBlockModalOpen(true);
    }
  };

  const confirmBlock = () => {
    if (!selectedUser) return;
    let until = '';
    const now = new Date();
    if (blockDuration === '1h') until = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    else if (blockDuration === '24h') until = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    else if (blockDuration === '7d') until = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    else if (blockDuration === '30d') until = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    else until = 'permanent';

    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, isBlocked: true, blockedUntil: until } : u));
    setIsBlockModalOpen(false);
    setSelectedUser(null);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) return;
    setIsDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = () => {
    setUsers(users.filter(u => !selectedUserIds.includes(u.id)));
    setSelectedUserIds([]);
    setIsDeleteConfirmOpen(false);
  };

  const handleDownloadInvoice = (billId: string) => {
    const bill = selectedUser?.billingHistory.find(b => b.id === billId);
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
    const rows = users.map(u => [
      u.id, u.name, u.email, u.role, u.isPremium ? 'Igen' : 'Nem', u.registrationDate, u.lastActive
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "felhasznalok_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExtendPremium = () => {
    if (!selectedUser) return;
    
    let newUntil = '';
    if (extensionDays === 'forever') {
      newUntil = 'Végtelen';
    } else {
      const currentUntil = selectedUser.premiumUntil && selectedUser.premiumUntil !== 'Végtelen' 
        ? new Date(selectedUser.premiumUntil) 
        : new Date();
      const date = new Date(currentUntil.getTime() + (extensionDays as number) * 24 * 60 * 60 * 1000);
      newUntil = date.toISOString().split('T')[0];
    }
    
    setUsers(users.map(u => u.id === selectedUser.id ? { 
      ...u, 
      isPremium: true, 
      premiumUntil: newUntil 
    } : u));
    setIsExpirationModalOpen(false);
  };

  const handleSendMessage = () => {
    alert(`Üzenet elküldve (${messageType}): ${messageContent}`);
    setIsMessageModalOpen(false);
    setMessageContent('');
  };

  const getChurnStatus = (lastActive: string) => {
    const last = new Date(lastActive);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 3) return { label: 'Aktív', color: 'text-green-400 bg-green-400/10 border-green-400/20' };
    if (diffDays < 7) return { label: 'Inaktív', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' };
    return { label: 'Churn veszély', color: 'text-red-400 bg-red-400/10 border-red-400/20' };
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'premium' && user.isPremium) || 
                         (filterType === 'free' && !user.isPremium);
    return matchesSearch && matchesFilter;
  });

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
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'premium' ? 'bg-orange-600 text-white' : 'text-muted hover:text-title'}`}
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
                <button 
                  className="flex items-center gap-2 text-xs font-bold hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors text-white"
                >
                  <Crown className="w-4 h-4" /> Tagság módosítása
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

          <div className="bg-card rounded-3xl overflow-hidden shadow-xl border-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-hover border-b border-main">
                  <th className="px-6 py-4 w-12">
                    <button 
                      onClick={toggleAllSelection}
                      className="text-muted hover:text-title transition-colors"
                    >
                      {selectedUserIds.length === filteredUsers.length ? <CheckSquare className="w-5 h-5 text-blue-500" /> : <Square className="w-5 h-5" />}
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
                {filteredUsers.map((user) => {
                  const churn = getChurnStatus(user.lastActive);
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
                          {selectedUserIds.includes(user.id) ? <CheckSquare className="w-5 h-5 text-blue-500" /> : <Square className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-hover shrink-0 border border-main">
                            {user.avatar ? (
                              <img src={user.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-blue-600/20 text-blue-500">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-title">{user.name}</span>
                            <span className="text-xs text-muted">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border w-fit ${
                          user.role === 'admin' ? 'text-purple-500 bg-purple-500/10 border-purple-500/20' :
                          user.role === 'moderator' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' :
                          'text-muted bg-hover border-main'
                        }`}>
                          {user.role}
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
                          {user.isPremium && (
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
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border w-fit ${churn.color.replace('text-green-400', 'text-green-500').replace('text-yellow-400', 'text-yellow-500').replace('text-red-400', 'text-red-500')}`}>
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
                            className={`p-2 rounded-xl transition-all border ${user.isBlocked ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}
                            title={user.isBlocked ? "Feloldás" : "Blokkolás"}
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
            {filteredUsers.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-hover rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-muted w-8 h-8" />
                </div>
                <p className="text-muted">Nem található a keresésnek megfelelő felhasználó.</p>
              </div>
            )}
          </div>
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
              className="relative w-full max-w-md bg-card border border-main rounded-[2rem] p-8 shadow-2xl overflow-hidden"
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
                Biztosan blokkolni szeretnéd <span className="text-title font-medium">{selectedUser?.name}</span> felhasználót? Válaszd ki az időtartamot.
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
                    onClick={() => setBlockDuration(option.id as any)}
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-card border border-main rounded-[2rem] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <CreditCard className="text-blue-500 w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-title">Számlázási előzmények</h2>
                    <p className="text-muted text-sm">{selectedUser.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsBillingModalOpen(false)} className="p-2 hover:bg-hover rounded-xl transition-colors text-muted hover:text-title"><CloseIcon className="w-5 h-5" /></button>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                {selectedUser.billingHistory.length > 0 ? selectedUser.billingHistory.map(bill => (
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-card border border-main rounded-[2rem] p-8 shadow-2xl">
              <h2 className="text-xl font-bold mb-2 text-title">Lejárat kezelése</h2>
              <p className="text-muted text-sm mb-6">Manuális hosszabbítás vagy kedvezményes időszak hozzáadása.</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-widest mb-2 block">Hosszabbítás (nap)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[7, 30, 90].map(days => (
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
                      className={`py-3 rounded-xl border transition-all font-bold text-sm ${extensionDays === 'forever' ? 'bg-orange-600 border-orange-500 text-white' : 'bg-hover border-main text-muted hover:bg-hover/80'}`}
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-card border border-main rounded-[2rem] p-8 shadow-2xl">
              <h2 className="text-xl font-bold mb-2 text-title">Üzenet küldése</h2>
              <p className="text-muted text-sm mb-6">
                {selectedUserIds.length > 0 
                  ? `Üzenet küldése ${selectedUserIds.length} kijelölt felhasználónak.` 
                  : `Üzenet küldése: ${selectedUser?.name}`}
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
              className="relative w-full max-w-md bg-card border border-main rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="text-red-500 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-center mb-2 text-title">Biztosan törölni szeretnéd?</h2>
              <p className="text-muted text-center mb-8">
                {selectedUserIds.length > 0 
                  ? `Biztosan törölni szeretnél ${selectedUserIds.length} kijelölt felhasználót? Ez a művelet nem vonható vissza.`
                  : "Ez a művelet nem vonható vissza. A kijelölt adatok véglegesen törlődik."}
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
