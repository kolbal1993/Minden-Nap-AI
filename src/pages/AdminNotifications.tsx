/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Trash2, 
  Search, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut,
  X,
  Cpu,
  BookOpen,
  Contact2,
  BarChart3,
  Users,
  Megaphone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Plus,
  ExternalLink,
  ShieldCheck,
  Menu
} from 'lucide-react';
import { Notification, addNotification, deleteNotification } from '../utils/notifications';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminNotifications() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    type: 'admin' as any,
    icon: 'Bell',
    link: '',
    userId: 'all'
  });
  const location = useLocation();
  const navigate = useNavigate();

  const handleNotificationClick = (link?: string) => {
    if (!link) return;
    if (link.startsWith('http')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      navigate(link);
    }
  };

  useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    };

    loadNotifications();
    window.addEventListener('storage', loadNotifications);
    return () => window.removeEventListener('storage', loadNotifications);
  }, []);

  const handleDeleteClick = (id: string) => {
    setNotificationToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (notificationToDelete) {
      deleteNotification(notificationToDelete);
      setNotifications(notifications.filter(n => n.id !== notificationToDelete));
      setIsDeleteConfirmOpen(false);
      setNotificationToDelete(null);
    }
  };

  const handleSendNotification = () => {
    if (!notificationData.title || !notificationData.message) return;
    
    addNotification({
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      icon: notificationData.icon,
      link: notificationData.link || undefined
    } as any);
    
    setIsNotificationModalOpen(false);
    setNotificationData({ title: '', message: '', type: 'admin', icon: 'Bell', link: '', userId: 'all' });
  };

  const filteredNotifications = notifications.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news': return <Megaphone className="w-4 h-4 text-orange-400" />;
      case 'course': return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'admin': return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
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
            <h1 className="text-lg sm:text-xl font-bold text-title truncate">Értesítések</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input 
                type="text" 
                placeholder="Keresés..." 
                className="bg-card border border-main rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 w-48 text-title placeholder:text-muted"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => { setSearchTerm(''); e.target.select(); }}
                onClick={(e) => e.currentTarget.select()}
              />
            </div>
            <button 
              onClick={() => setIsNotificationModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" /> <span className="hidden xs:inline">Új Értesítés</span><span className="xs:hidden">Új</span>
            </button>
          </div>
        </header>

        {/* Table Container */}
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-card rounded-3xl overflow-hidden shadow-xl border-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-hover border-b border-main">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Típus</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Cím / Üzenet</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Címzett</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Dátum</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Státusz</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-right">Műveletek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-main">
                {filteredNotifications.map((n) => (
                  <tr 
                    key={n.id} 
                    className={`hover:bg-hover transition-colors group ${n.link ? 'cursor-pointer' : ''}`}
                    onClick={() => handleNotificationClick(n.link)}
                  >
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 rounded-lg bg-hover flex items-center justify-center">
                        {getTypeIcon(n.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="space-y-1">
                        <div className="font-medium text-title">{n.title}</div>
                        <div className="text-xs text-muted line-clamp-1">{n.message}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        n.userId === 'all' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>
                        {n.userId === 'all' ? 'Mindenki' : `ID: ${n.userId}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleString('hu-HU')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {n.read ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-400">
                          <CheckCircle2 className="w-3 h-3" /> Olvasott
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                          <AlertCircle className="w-3 h-3" /> Új
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(n.id);
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-all"
                        title="Visszavonás / Törlés"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredNotifications.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-hover rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="text-muted w-8 h-8" />
                </div>
                <p className="text-muted">Nem található értesítés.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Notification Modal */}
      <AnimatePresence>
        {isNotificationModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-main rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-main flex justify-between items-center bg-hover">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-title">
                  <Bell className="text-blue-500" /> Új Értesítés Küldése
                </h2>
                <button onClick={() => setIsNotificationModalOpen(false)} className="p-2 hover:bg-hover rounded-full transition-colors text-muted">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider">Címzett</label>
                    <select 
                      value={notificationData.userId}
                      onChange={(e) => setNotificationData({ ...notificationData, userId: e.target.value })}
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none text-title"
                    >
                      <option value="all">Minden felhasználó</option>
                      <option value="user_id_1">Egyedi felhasználó (ID alapján)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider">Értesítés Típusa</label>
                    <select 
                      value={notificationData.type}
                      onChange={(e) => setNotificationData({ ...notificationData, type: e.target.value as any })}
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none text-title"
                    >
                      <option value="admin">Rendszerüzenet</option>
                      <option value="news">Hír</option>
                      <option value="course">Kurzus</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider">Ikon Kiválasztása</label>
                  <div className="grid grid-cols-5 gap-3">
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
                      { id: 'ExternalLink', icon: ExternalLink }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setNotificationData({ ...notificationData, icon: item.id })}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-center ${
                          notificationData.icon === item.id 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                            : 'bg-hover border-main text-muted hover:bg-hover/80'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider">Értesítés Címe</label>
                  <input 
                    type="text" 
                    value={notificationData.title}
                    onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="Pl: Karbantartás várható..."
                    className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider">Üzenet</label>
                  <textarea 
                    value={notificationData.message}
                    onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="Az értesítés részletes tartalma..."
                    className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors min-h-[120px] resize-none text-body placeholder:text-muted"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider">Link (opcionális)</label>
                  <input 
                    type="text" 
                    value={notificationData.link}
                    onChange={(e) => setNotificationData({ ...notificationData, link: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="Pl: /news/1"
                    className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={handleSendNotification}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                  >
                    <Zap className="w-5 h-5" /> Értesítés Kiküldése
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
              className="relative w-full max-w-md bg-card border border-main rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="text-red-500 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-center mb-2 text-title">Biztosan törölni szeretnéd?</h2>
              <p className="text-muted text-center mb-8">Ez a művelet nem vonható vissza. Az értesítés véglegesen törlődik a rendszerből.</p>
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
