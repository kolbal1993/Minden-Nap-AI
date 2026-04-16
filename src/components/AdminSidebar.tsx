/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Bell, 
  Megaphone, 
  FileText, 
  BookOpen, 
  Users, 
  MessageSquare,
  Contact2, 
  Settings, 
  LogOut, 
  Cpu 
} from 'lucide-react';

export default function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    if (onClose) onClose();
  };

  const navItems = [
    { to: '/admin/analytics', icon: BarChart3, label: 'Analitika', active: location.pathname === '/admin/analytics' || location.pathname === '/admin' },
    { to: '/admin/notifications', icon: Bell, label: 'Értesítések', active: location.pathname === '/admin/notifications' },
    { to: '/admin/campaigns', icon: Megaphone, label: 'Kampányok', active: location.pathname === '/admin/campaigns' },
    { to: '/admin/posts', icon: FileText, label: 'Posztok', active: location.pathname === '/admin/posts' },
    { to: '/admin/tudastar', icon: BookOpen, label: 'Tudástár', active: location.pathname === '/admin/tudastar' },
    { to: '/admin/users', icon: Users, label: 'Felhasználók', active: location.pathname === '/admin/users' },
    { to: '/messages', icon: MessageSquare, label: 'Üzenetek', active: location.pathname === '/messages' },
    { to: '/admin/contacts', icon: Contact2, label: 'Kapcsolatok', active: location.pathname === '/admin/contacts' },
    { to: '/admin/settings', icon: Settings, label: 'Beállítások', active: location.pathname === '/admin/settings' },
  ];

  return (
    <aside className="w-64 border-r border-main bg-card hidden md:flex flex-col shrink-0 transition-colors duration-300">
      <Link to="/" className="p-6 flex items-center gap-3 border-b border-main group cursor-pointer">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
          <Cpu className="text-white w-5 h-5" />
        </div>
        <span className="font-bold tracking-tight text-title">Minden Nap AI</span>
      </Link>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <Link 
            key={item.to}
            to={item.to} 
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              item.active 
                ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold shadow-sm' 
                : 'hover:bg-hover text-muted hover:text-title'
            }`}
          >
            <item.icon className={`w-5 h-5 ${item.active ? 'text-blue-600 dark:text-blue-400' : ''}`} /> 
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-main">
        <Link 
          to="/" 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Kilépés
        </Link>
      </div>
    </aside>
  );
}
