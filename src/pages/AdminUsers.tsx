/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Search, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut,
  Cpu,
  BookOpen,
  Contact2,
  BarChart3,
  Users,
  Crown,
  User,
  Filter,
  ArrowUpDown
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  premiumSince?: string;
  totalPremiumMonths: number;
  registrationDate: string;
  lastLogin: string;
  avatar?: string;
}

const MOCK_USERS: UserData[] = [
  {
    id: '1',
    name: 'Kovács János',
    email: 'janos.kovacs@example.com',
    isPremium: true,
    premiumSince: '2026-01-15',
    totalPremiumMonths: 3,
    registrationDate: '2026-01-15',
    lastLogin: '2026-04-04',
    avatar: 'https://picsum.photos/seed/user1/200/200'
  },
  {
    id: '2',
    name: 'Szabó Anna',
    email: 'anna.szabo@example.com',
    isPremium: false,
    totalPremiumMonths: 0,
    registrationDate: '2026-02-10',
    lastLogin: '2026-04-03',
    avatar: 'https://picsum.photos/seed/user2/200/200'
  },
  {
    id: '3',
    name: 'Nagy Péter',
    email: 'peter.nagy@example.com',
    isPremium: true,
    premiumSince: '2026-03-05',
    totalPremiumMonths: 1,
    registrationDate: '2026-03-05',
    lastLogin: '2026-04-04',
    avatar: 'https://picsum.photos/seed/user3/200/200'
  },
  {
    id: '4',
    name: 'Kiss Eszter',
    email: 'eszter.kiss@example.com',
    isPremium: false,
    totalPremiumMonths: 2,
    registrationDate: '2026-01-20',
    lastLogin: '2026-04-01',
    avatar: 'https://picsum.photos/seed/user4/200/200'
  },
  {
    id: '5',
    name: 'Tóth Gábor',
    email: 'gabor.toth@example.com',
    isPremium: false,
    totalPremiumMonths: 0,
    registrationDate: '2026-03-25',
    lastLogin: '2026-04-04',
    avatar: 'https://picsum.photos/seed/user5/200/200'
  }
];

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'premium' | 'free'>('all');
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
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
    <div className="min-h-screen bg-transparent text-gray-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl hidden md:flex flex-col">
        <Link to="/" className="p-6 flex items-center gap-3 border-b border-white/5 group cursor-pointer">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Cpu className="text-white w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight">Minden Nap AI</span>
        </Link>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin' ? 'bg-blue-600/10 text-blue-400 font-medium' : 'hover:bg-white/5 text-gray-400'}`}>
            <FileText className="w-5 h-5" /> Posztok
          </Link>
          <Link to="/admin/tudastar" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin/tudastar' ? 'bg-blue-600/10 text-blue-400 font-medium' : 'hover:bg-white/5 text-gray-400'}`}>
            <BookOpen className="w-5 h-5" /> Tudástár
          </Link>
          <Link to="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin/users' ? 'bg-blue-600/10 text-blue-400 font-medium' : 'hover:bg-white/5 text-gray-400'}`}>
            <Users className="w-5 h-5" /> Felhasználók
          </Link>
          <Link to="/admin/contacts" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin/contacts' ? 'bg-blue-600/10 text-blue-400 font-medium' : 'hover:bg-white/5 text-gray-400'}`}>
            <Contact2 className="w-5 h-5" /> Kapcsolatok
          </Link>
          <Link to="/admin/analytics" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin/analytics' ? 'bg-blue-600/10 text-blue-400 font-medium' : 'hover:bg-white/5 text-gray-400'}`}>
            <BarChart3 className="w-5 h-5" /> Analitika
          </Link>
          <Link to="/admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin/settings' ? 'bg-blue-600/10 text-blue-400 font-medium' : 'hover:bg-white/5 text-gray-400'}`}>
            <Settings className="w-5 h-5" /> Beállítások
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link 
            to="/" 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Kilépés
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md flex items-center justify-between px-8">
          <h1 className="text-xl font-bold">Felhasználók Kezelése</h1>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Keresés név vagy email alapján..." 
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
              <button 
                onClick={() => setFilterType('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Összes
              </button>
              <button 
                onClick={() => setFilterType('premium')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'premium' ? 'bg-orange-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Prémium
              </button>
              <button 
                onClick={() => setFilterType('free')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'free' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Ingyenes
              </button>
            </div>
          </div>
        </header>

        {/* Table Container */}
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Felhasználó</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Tagság</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Prémium időtartam</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Regisztráció</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Műveletek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 shrink-0 border border-white/10">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-600/20 text-blue-400">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-200">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                    <td className="px-6 py-4">
                      {user.isPremium ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-400/10 px-2 py-1 rounded-md border border-orange-400/20 w-fit">
                          <Crown className="w-3 h-3 fill-current" /> Prémium
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/10 w-fit">
                          Ingyenes
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {user.isPremium ? (
                          <div className="flex flex-col">
                            <span className="text-orange-400 font-medium">{user.totalPremiumMonths} hónapja</span>
                            <span className="text-[10px] text-gray-500">Mióta: {user.premiumSince}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-gray-400">{user.totalPremiumMonths > 0 ? `${user.totalPremiumMonths} hónap összesen` : 'Nincs előzmény'}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{user.registrationDate}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                        Részletek
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-gray-600 w-8 h-8" />
                </div>
                <p className="text-gray-500">Nem található a keresésnek megfelelő felhasználó.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
