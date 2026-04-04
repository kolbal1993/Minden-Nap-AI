/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut,
  Cpu,
  BookOpen,
  Contact2,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  TrendingUp,
  Users,
  Eye,
  Crown,
  Clock,
  User
} from 'lucide-react';
import { NEWS_ITEMS } from '../constants/news';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const PREMIUM_DURATION_DATA = [
  { months: '1 hó', count: 45, color: '#f97316' },
  { months: '2 hó', count: 32, color: '#fb923c' },
  { months: '3 hó', count: 58, color: '#fdba74' },
  { months: '4-6 hó', count: 84, color: '#fbbf24' },
  { months: '6-12 hó', count: 42, count2: 12, color: '#f59e0b' },
  { months: '12+ hó', count: 25, color: '#d97706' },
];

export default function AdminAnalytics() {
  const location = useLocation();
  const [stats, setStats] = useState<any>({});
  const [sortedNews, setSortedNews] = useState<any[]>([]);

  useEffect(() => {
    const globalStats = JSON.parse(localStorage.getItem('news_global_stats') || '{}');
    setStats(globalStats);

    const newsWithStats = NEWS_ITEMS.map(item => ({
      ...item,
      likes: globalStats[item.id]?.likes || 0,
      dislikes: globalStats[item.id]?.dislikes || 0,
      saves: globalStats[item.id]?.saves || 0,
      totalInteractions: (globalStats[item.id]?.likes || 0) + (globalStats[item.id]?.saves || 0)
    })).sort((a, b) => b.totalInteractions - a.totalInteractions);

    setSortedNews(newsWithStats);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  };

  const totalLikes: number = Object.values(stats).reduce((acc: number, curr: any) => acc + (curr.likes || 0), 0) as number;
  const totalSaves: number = Object.values(stats).reduce((acc: number, curr: any) => acc + (curr.saves || 0), 0) as number;

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
        <header className="h-20 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md flex items-center justify-between px-8">
          <h1 className="text-xl font-bold">Analitika</h1>
        </header>

        <div className="flex-1 overflow-auto p-8 space-y-8">
          {/* User Distribution Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0d0d0d] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                  <Users className="text-blue-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Összes Felhasználó</p>
                  <h3 className="text-3xl font-bold">2,284</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs font-medium relative z-10">
                <TrendingUp className="w-3 h-3 text-green-500" /> <span className="text-green-500">+156</span> az elmúlt 30 napban
              </div>
            </div>

            <div className="bg-[#0d0d0d] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center">
                  <Crown className="text-orange-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Prémium Tagok</p>
                  <h3 className="text-3xl font-bold text-orange-400">428</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs font-medium relative z-10">
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-[18.7%]" />
                </div>
                <span className="shrink-0">18.7% arány</span>
              </div>
            </div>

            <div className="bg-[#0d0d0d] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-600/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                  <User className="text-gray-400 w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Ingyenes Felhasználók</p>
                  <h3 className="text-3xl font-bold">1,856</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs font-medium relative z-10">
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gray-500 h-full w-[81.3%]" />
                </div>
                <span className="shrink-0">81.3% arány</span>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0d0d0d] border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                  <ThumbsUp className="text-blue-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Összes Kedvelés</p>
                  <h3 className="text-3xl font-bold">{totalLikes}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-500 text-sm font-bold">
                <TrendingUp className="w-4 h-4" /> +12% a múlt héthez képest
              </div>
            </div>

            <div className="bg-[#0d0d0d] border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center">
                  <Bookmark className="text-orange-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Összes Mentés</p>
                  <h3 className="text-3xl font-bold">{totalSaves}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-500 text-sm font-bold">
                <TrendingUp className="w-4 h-4" /> +8% a múlt héthez képest
              </div>
            </div>

            <div className="bg-[#0d0d0d] border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center">
                  <Users className="text-purple-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Aktív Olvasók</p>
                  <h3 className="text-3xl font-bold">1,284</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-500 text-sm font-bold">
                <Eye className="w-4 h-4" /> Valós idejű adat
              </div>
            </div>
          </div>

          {/* Premium Subscription Analytics */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-[#0d0d0d] border border-white/5 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold mb-1">Prémium Előfizetés Időtartama</h2>
                  <p className="text-sm text-gray-500">Felhasználók száma az előfizetés hossza alapján</p>
                </div>
                <div className="bg-orange-500/10 text-orange-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> +12% növekedés
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PREMIUM_DURATION_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis 
                      dataKey="months" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ 
                        backgroundColor: '#111', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {PREMIUM_DURATION_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#0d0d0d] border border-white/5 rounded-3xl p-8 flex flex-col justify-center">
                <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <Clock className="text-orange-500 w-6 h-6" />
                </div>
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Átlagos Előfizetési Idő</h3>
                <div className="text-4xl font-bold text-white mb-2">5.4 hónap</div>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> 0.8 hónap javulás
                </p>
              </div>

              <div className="bg-[#0d0d0d] border border-white/5 rounded-3xl p-8 flex flex-col justify-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <Crown className="text-blue-500 w-6 h-6" />
                </div>
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Megtartási Arány</h3>
                <div className="text-4xl font-bold text-white mb-2">82%</div>
                <p className="text-xs text-gray-500">Legalább 3 hónapig maradók</p>
              </div>
            </div>
          </div>

          {/* Most Saved News */}
          <div className="bg-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5">
              <h2 className="text-lg font-bold flex items-center gap-3">
                <Bookmark className="text-orange-500 w-5 h-5" /> Legtöbbször Mentett Hírek
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Hír</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Mentések</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Kedvelések</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Arány</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedNews.map((news) => (
                    <tr key={news.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 shrink-0">
                            <img src={news.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <span className="font-medium text-gray-200 line-clamp-1">{news.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-orange-400">{news.saves}</td>
                      <td className="px-6 py-4 text-center font-bold text-blue-400">{news.likes}</td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full" 
                            style={{ width: `${Math.min(100, (Number(news.totalInteractions) / (Number(totalLikes) + Number(totalSaves) || 1)) * 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
