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
  ShieldCheck
} from 'lucide-react';
import { Notification, addNotification, deleteNotification } from '../utils/notifications';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminNotifications() {
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
    <div className="min-h-screen bg-transparent text-gray-100 flex font-sans">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md flex items-center justify-between px-8">
          <h1 className="text-xl font-bold">Értesítések Kezelése</h1>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Keresés az értesítések között..." 
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsNotificationModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" /> Új Értesítés
            </button>
          </div>
        </header>

        {/* Table Container */}
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Típus</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Cím / Üzenet</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Címzett</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Dátum</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Státusz</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Műveletek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredNotifications.map((n) => (
                  <tr 
                    key={n.id} 
                    className={`hover:bg-white/[0.02] transition-colors group ${n.link ? 'cursor-pointer' : ''}`}
                    onClick={() => handleNotificationClick(n.link)}
                  >
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        {getTypeIcon(n.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-200">{n.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{n.message}</div>
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
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
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
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
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
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="text-gray-600 w-8 h-8" />
                </div>
                <p className="text-gray-500">Nem található értesítés.</p>
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
              className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#151515]">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Bell className="text-blue-500" /> Új Értesítés Küldése
                </h2>
                <button onClick={() => setIsNotificationModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Címzett</label>
                    <select 
                      value={notificationData.userId}
                      onChange={(e) => setNotificationData({ ...notificationData, userId: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option value="all">Minden felhasználó</option>
                      <option value="user_id_1">Egyedi felhasználó (ID alapján)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Értesítés Típusa</label>
                    <select 
                      value={notificationData.type}
                      onChange={(e) => setNotificationData({ ...notificationData, type: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option value="admin">Rendszerüzenet</option>
                      <option value="news">Hír</option>
                      <option value="course">Kurzus</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ikon Kiválasztása</label>
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
                            : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Értesítés Címe</label>
                  <input 
                    type="text" 
                    value={notificationData.title}
                    onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                    placeholder="Pl: Karbantartás várható..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Üzenet</label>
                  <textarea 
                    value={notificationData.message}
                    onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                    placeholder="Az értesítés részletes tartalma..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors min-h-[120px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Link (opcionális)</label>
                  <input 
                    type="text" 
                    value={notificationData.link}
                    onChange={(e) => setNotificationData({ ...notificationData, link: e.target.value })}
                    placeholder="Pl: /news/1"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
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
              className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="text-red-500 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-center mb-2">Biztosan törölni szeretnéd?</h2>
              <p className="text-gray-400 text-center mb-8">Ez a művelet nem vonható vissza. Az értesítés véglegesen törlődik a rendszerből.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all"
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
