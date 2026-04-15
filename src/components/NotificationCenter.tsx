/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Zap, 
  BookOpen, 
  MessageSquare, 
  Heart, 
  Info,
  X
} from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, Notification } from '../utils/notifications';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const updateNotifications = () => {
    const userId = localStorage.getItem('userId') || 'guest';
    const all = getNotifications(userId);
    setNotifications(all);
    setUnreadCount(all.filter(n => !n.read).length);
  };

  useEffect(() => {
    updateNotifications();
    window.addEventListener('storage', updateNotifications);
    
    // Also listen for custom events if needed
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('storage', updateNotifications);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAllRead = () => {
    const userId = localStorage.getItem('userId') || 'guest';
    markAllAsRead(userId);
    updateNotifications();
  };

  const handleMarkRead = (id: string) => {
    markAsRead(id);
    updateNotifications();
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkRead(notification.id);
    setIsOpen(false);
    if (notification.link) {
      if (notification.link.startsWith('http')) {
        window.open(notification.link, '_blank', 'noopener,noreferrer');
      } else {
        navigate(notification.link);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'reaction': return <Heart className="w-4 h-4 text-rose-400" />;
      case 'news': return <Zap className="w-4 h-4 text-orange-400" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all group"
      >
        <Bell className={`w-5 h-5 ${isOpen ? 'text-blue-600 dark:text-blue-400' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#050505]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 md:w-96 bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[100]"
          >
            <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/[0.02] dark:bg-white/5">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Értesítések</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-[10px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Összes olvasott
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="divide-y divide-black/5 dark:divide-white/5">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-black/[0.03] dark:hover:bg-white/5 transition-colors relative group/item cursor-pointer block ${!notification.read ? 'bg-blue-500/[0.03] dark:bg-blue-500/5' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 shrink-0">
                          <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                            {getIcon(notification.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`text-sm font-bold truncate ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-[10px] text-gray-600 dark:text-gray-500 whitespace-nowrap mt-0.5">
                              {new Date(notification.createdAt).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleMarkRead(notification.id);
                            }}
                            className="absolute right-4 bottom-4 opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-md z-10"
                            title="Megjelölés olvasottként"
                          >
                            <Check className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-500">Nincsenek értesítéseid.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
