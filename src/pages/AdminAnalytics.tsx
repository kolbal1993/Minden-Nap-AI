/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Bookmark, 
  TrendingUp, 
  Eye, 
  Crown, 
  Clock, 
  User, 
  Smile, 
  Zap, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Plus, 
  Send, 
  X, 
  Save, 
  Image as ImageIcon, 
  Calendar, 
  Bold, 
  Italic, 
  List, 
  Link as LinkIcon, 
  Heading1, 
  Heading2, 
  Code, 
  Quote, 
  ListOrdered, 
  MessageSquare, 
  Edit2, 
  Trash2, 
  Search, 
  Lock, 
  CreditCard, 
  Target, 
  EyeOff, 
  Type, 
  ChevronRight, 
  ChevronLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Download, 
  MoreVertical, 
  Activity,
  Bell,
  Menu,
  BarChart3,
  Users,
  BookOpen,
  Megaphone
} from 'lucide-react';
import { NEWS_ITEMS } from '../constants/news';
import EmojiPickerButton from '../components/EmojiPickerButton';
import AdminSidebar from '../components/AdminSidebar';
import { addNotification } from '../utils/notifications';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal States
  const [activeModal, setActiveModal] = useState<'campaign' | 'post' | 'course' | 'notification' | null>(null);

  // Form States
  const [campaignForm, setCampaignForm] = useState<any>({
    name: '',
    description: '',
    type: 'all',
    discountType: 'percentage',
    discountValue: undefined,
    startDate: '',
    endDate: '',
    status: 'scheduled'
  });

  const [postForm, setPostForm] = useState<any>({
    title: '',
    type: 'Generatív AI',
    status: 'active',
    publishDate: '',
    expiryDate: '',
    imageUrl: '',
    content: ''
  });

  const [courseForm, setCourseForm] = useState<any>({
    title: '',
    description: '',
    category: 'AI Alapok',
    level: 'Kezdő',
    status: 'active',
    accessType: 'free',
    price: 0,
    publishDate: '',
    expiryDate: '',
    imageUrl: '',
    content: ''
  });

  const [notificationForm, setNotificationForm] = useState<any>({
    title: '',
    message: '',
    type: 'admin',
    icon: 'Bell',
    target: 'all',
    link: ''
  });

  const insertText = (before: string, after: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = postForm.content;
    const beforeText = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const afterText = text.substring(end);
    const newContent = beforeText + before + selectedText + after + afterText;
    setPostForm({ ...postForm, content: newContent });
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + before.length,
          end + before.length
        );
      }
    }, 0);
  };

  useEffect(() => {
    const globalStats = JSON.parse(localStorage.getItem('news_global_stats') || '{}');
    setStats(globalStats);

    const newsWithStats = NEWS_ITEMS.map(item => {
      const reactions = globalStats[item.id]?.reactions || {};
      const reactionCount = Object.values(reactions).reduce((a: any, b: any) => a + b, 0) as number;
      return {
        ...item,
        reactions: reactionCount,
        saves: globalStats[item.id]?.saves || 0,
        totalInteractions: reactionCount + (globalStats[item.id]?.saves || 0)
      };
    }).sort((a, b) => b.totalInteractions - a.totalInteractions);

    setSortedNews(newsWithStats);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  };

  const totalReactions: number = Object.values(stats).reduce((acc: number, curr: any) => {
    const reactions = curr.reactions || {};
    const count = Object.values(reactions).reduce((a: any, b: any) => a + b, 0) as number;
    return acc + count;
  }, 0) as number;
  const totalSaves: number = Object.values(stats).reduce((acc: number, curr: any) => acc + (curr.saves || 0), 0) as number;

  return (
    <div className="min-h-screen bg-main text-body flex font-sans transition-colors duration-300 relative">
      <div className={`fixed inset-0 z-[100] md:relative md:z-0 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-main bg-glass backdrop-blur-md flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-hover rounded-xl md:hidden text-title"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-title">Analitika</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => setActiveModal('campaign')}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] md:text-[11px] font-bold transition-all shadow-lg shadow-blue-600/20 text-white"
            >
              <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Új Kampány</span>
            </button>
            <button 
              onClick={() => setActiveModal('post')}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-hover hover:bg-hover/80 border border-main rounded-xl text-[10px] md:text-[11px] font-bold transition-all text-title"
            >
              <FileText className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Új Poszt</span>
            </button>
            <button 
              onClick={() => setActiveModal('course')}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-hover hover:bg-hover/80 border border-main rounded-xl text-[10px] md:text-[11px] font-bold transition-all text-title"
            >
              <BookOpen className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Új Kurzus</span>
            </button>
            <button 
              onClick={() => setActiveModal('notification')}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-orange-600/10 hover:bg-orange-600/20 text-orange-500 border border-orange-500/20 rounded-xl text-[10px] md:text-[11px] font-bold transition-all"
            >
              <Bell className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Értesítés</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 space-y-8">
          {/* User Distribution Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-3xl relative overflow-hidden group shadow-xl border-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                  <Users className="text-blue-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-muted text-sm font-bold uppercase tracking-wider">Összes Felhasználó</p>
                  <h3 className="text-3xl font-bold text-title">2,284</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted text-xs font-medium relative z-10">
                <TrendingUp className="w-3 h-3 text-green-500" /> <span className="text-green-500">+156</span> az elmúlt 30 napban
              </div>
            </div>

            <div className="bg-card p-6 rounded-3xl relative overflow-hidden group shadow-xl border-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center">
                  <Crown className="text-orange-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-muted text-sm font-bold uppercase tracking-wider">Prémium Tagok</p>
                  <h3 className="text-3xl font-bold text-orange-500">428</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted text-xs font-medium relative z-10">
                <div className="w-full bg-hover h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-[18.7%]" />
                </div>
                <span className="shrink-0">18.7% arány</span>
              </div>
            </div>

            <div className="bg-card p-6 rounded-3xl relative overflow-hidden group shadow-xl border-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-600/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-hover rounded-2xl flex items-center justify-center">
                  <User className="text-muted w-6 h-6" />
                </div>
                <div>
                  <p className="text-muted text-sm font-bold uppercase tracking-wider">Ingyenes Felhasználók</p>
                  <h3 className="text-3xl font-bold text-title">1,856</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted text-xs font-medium relative z-10">
                <div className="w-full bg-hover h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gray-500 h-full w-[81.3%]" />
                </div>
                <span className="shrink-0">81.3% arány</span>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-3xl shadow-xl border-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                  <Smile className="text-blue-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-muted text-sm font-bold uppercase tracking-wider">Összes Reakció</p>
                  <h3 className="text-3xl font-bold text-title">{totalReactions}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-500 text-sm font-bold">
                <TrendingUp className="w-4 h-4" /> +12% a múlt héthez képest
              </div>
            </div>

            <div className="bg-card p-6 rounded-3xl shadow-xl border-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center">
                  <Bookmark className="text-orange-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-muted text-sm font-bold uppercase tracking-wider">Összes Mentés</p>
                  <h3 className="text-3xl font-bold text-title">{totalSaves}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-500 text-sm font-bold">
                <TrendingUp className="w-4 h-4" /> +8% a múlt héthez képest
              </div>
            </div>

            <div className="bg-card p-6 rounded-3xl shadow-xl border-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center">
                  <Users className="text-purple-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-muted text-sm font-bold uppercase tracking-wider">Aktív Olvasók</p>
                  <h3 className="text-3xl font-bold text-title">1,284</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-500 text-sm font-bold">
                <Eye className="w-4 h-4" /> Valós idejű adat
              </div>
            </div>
          </div>

          {/* Premium Subscription Analytics */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-card border border-main rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold mb-1 text-title">Prémium Előfizetés Időtartama</h2>
                  <p className="text-sm text-muted">Felhasználók száma az előfizetés hossza alapján</p>
                </div>
                <div className="bg-orange-500/10 text-orange-500 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-orange-500/20">
                  <TrendingUp className="w-4 h-4" /> +12% növekedés
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PREMIUM_DURATION_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" vertical={false} />
                    <XAxis 
                      dataKey="months" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'var(--bg-hover)' }}
                      contentStyle={{ 
                        backgroundColor: 'var(--bg-card)', 
                        border: '1px solid var(--border-main)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: 'var(--text-title)'
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
              <div className="bg-card border border-main rounded-3xl p-8 flex flex-col justify-center shadow-sm">
                <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <Clock className="text-orange-500 w-6 h-6" />
                </div>
                <h3 className="text-muted text-sm font-bold uppercase tracking-widest mb-2">Átlagos Előfizetési Idő</h3>
                <div className="text-4xl font-bold text-title mb-2">5.4 hónap</div>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> 0.8 hónap javulás
                </p>
              </div>

              <div className="bg-card border border-main rounded-3xl p-8 flex flex-col justify-center shadow-sm">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <Crown className="text-blue-500 w-6 h-6" />
                </div>
                <h3 className="text-muted text-sm font-bold uppercase tracking-widest mb-2">Megtartási Arány</h3>
                <div className="text-4xl font-bold text-title mb-2">82%</div>
                <p className="text-xs text-muted">Legalább 3 hónapig maradók</p>
              </div>
            </div>
          </div>

          {/* Most Saved News */}
          <div className="bg-card rounded-3xl overflow-hidden shadow-xl border-none">
            <div className="p-6 border-b border-main bg-hover">
              <h2 className="text-lg font-bold flex items-center gap-3 text-title">
                <Bookmark className="text-orange-500 w-5 h-5" /> Legtöbbször Mentett Hírek
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-hover border-b border-main">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Hír</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-center">Mentések</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-center">Reakciók</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-center">Arány</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-main">
                  {sortedNews.map((news) => (
                    <tr key={news.id} className="hover:bg-hover transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-hover shrink-0">
                            <img src={news.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <span className="font-medium text-title line-clamp-1">{news.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-orange-500">{news.saves}</td>
                      <td className="px-6 py-4 text-center font-bold text-blue-500">{news.reactions}</td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-hover h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full" 
                            style={{ width: `${Math.min(100, (Number(news.totalInteractions) / (Number(totalReactions) + Number(totalSaves) || 1)) * 100)}%` }}
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

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'campaign' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-main rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <Megaphone className="text-blue-500 w-6 h-6" />
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 hover:bg-hover rounded-xl transition-colors text-muted hover:text-title"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-2xl font-bold mb-2 text-title">Új kampány létrehozása</h2>
              <p className="text-muted text-sm mb-8">Állíts be kedvezményeket egy meghatározott időszakra.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-muted uppercase tracking-widest mb-2 block">Kampány neve</label>
                    <input 
                      type="text" 
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.currentTarget.select()}
                      placeholder="Pl. Nyári Akció"
                      className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted uppercase tracking-widest mb-2 block">Típus</label>
                    <div className="relative">
                      <select 
                        value={campaignForm.type}
                        onChange={(e) => setCampaignForm({...campaignForm, type: e.target.value as any})}
                        className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 appearance-none transition-colors text-title"
                      >
                        <option value="all">Teljes oldal</option>
                        <option value="course">Egyes tananyag</option>
                        <option value="premium">Prémium tagság</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                        <Plus className="w-4 h-4 rotate-45" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted uppercase tracking-widest mb-2 block">Leírás</label>
                    <textarea 
                      value={campaignForm.description}
                      onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.currentTarget.select()}
                      placeholder="Rövid leírás a kampányról..."
                      className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none text-title placeholder:text-muted"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_0.6fr] gap-4">
                    <div>
                      <label className="text-xs font-bold text-muted uppercase tracking-widest mb-2 block">Kedvezmény típusa</label>
                      <div className="relative">
                        <select 
                          value={campaignForm.discountType}
                          onChange={(e) => setCampaignForm({...campaignForm, discountType: e.target.value as any})}
                          className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 appearance-none transition-colors text-title"
                        >
                          <option value="percentage">Százalék (%)</option>
                          <option value="fixed">Fix összeg (Ft)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                          <Plus className="w-4 h-4 rotate-45" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted uppercase tracking-widest mb-2 block">Érték</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        value={campaignForm.discountValue ?? ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setCampaignForm({...campaignForm, discountValue: val === '' ? undefined : parseInt(val)});
                        }}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.currentTarget.select()}
                        placeholder="0"
                        className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-muted uppercase tracking-widest mb-2 block">Kezdés</label>
                      <input 
                        type="date" 
                        value={campaignForm.startDate}
                        onChange={(e) => setCampaignForm({...campaignForm, startDate: e.target.value})}
                        className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors text-title"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted uppercase tracking-widest mb-2 block">Vége</label>
                      <input 
                        type="date" 
                        value={campaignForm.endDate}
                        onChange={(e) => setCampaignForm({...campaignForm, endDate: e.target.value})}
                        className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors text-title"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="flex-1 bg-hover hover:bg-hover/80 text-title py-4 rounded-2xl font-bold transition-all border border-main"
                >
                  Mégse
                </button>
                <button 
                  onClick={() => {
                    addNotification({
                      userId: 'all',
                      type: 'admin',
                      title: 'Új kampány létrehozva!',
                      message: `A(z) "${campaignForm.name}" kampány sikeresen létrehozva.`
                    });
                    setActiveModal(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                  Kampány létrehozása
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeModal === 'post' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
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
                  <Plus className="text-blue-500" /> Új Poszt Létrehozása
                </h2>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-hover rounded-full transition-colors text-muted">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                    <Type className="w-4 h-4" /> Cím
                  </label>
                  <input 
                    type="text" 
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="A bejegyzés címe..."
                    className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Típus
                    </label>
                    <select 
                      value={postForm.type}
                      onChange={(e) => setPostForm({ ...postForm, type: e.target.value as any })}
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none text-title"
                    >
                      <option value="Generatív AI">Generatív AI</option>
                      <option value="Üzleti Automatizáció">Üzleti Automatizáció</option>
                      <option value="AI eszközök">AI eszközök</option>
                      <option value="Szabályozás">Szabályozás</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Státusz
                    </label>
                    <div className="flex items-center gap-4 h-[58px]">
                      <button
                        onClick={() => setPostForm({ ...postForm, status: 'active' })}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border transition-all ${
                          postForm.status === 'active' 
                            ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                            : 'bg-hover border-main text-muted'
                        }`}
                      >
                        <Eye className="w-4 h-4" /> Aktív
                      </button>
                      <button
                        onClick={() => setPostForm({ ...postForm, status: 'inactive' })}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border transition-all ${
                          postForm.status === 'inactive' 
                            ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                            : 'bg-hover border-main text-muted'
                        }`}
                      >
                        <EyeOff className="w-4 h-4" /> Inaktív
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Kép feltöltése
                  </label>
                  <div className="relative group/upload">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPostForm({ ...postForm, imageUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full bg-hover border border-main rounded-2xl px-5 py-4 flex items-center gap-3 group-hover/upload:border-blue-500/50 transition-colors overflow-hidden">
                      {postForm.imageUrl ? (
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-hover shrink-0">
                            <img src={postForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-sm text-muted truncate flex-1">Kép kiválasztva</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setPostForm({ ...postForm, imageUrl: '' });
                            }}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 text-muted" />
                          <span className="text-sm text-muted">Kattints a feltöltéshez</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Tartalom
                  </label>
                  <div className="bg-hover border border-main rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-1 p-2 border-b border-main bg-hover flex-wrap">
                      <button onClick={() => insertText('# ', '')} className="p-2 hover:bg-hover rounded-lg text-muted transition-colors"><Heading1 className="w-4 h-4" /></button>
                      <button onClick={() => insertText('## ', '')} className="p-2 hover:bg-hover rounded-lg text-muted transition-colors"><Heading2 className="w-4 h-4" /></button>
                      <button onClick={() => insertText('**', '**')} className="p-2 hover:bg-hover rounded-lg text-muted transition-colors"><Bold className="w-4 h-4" /></button>
                      <button onClick={() => insertText('*', '*')} className="p-2 hover:bg-hover rounded-lg text-muted transition-colors"><Italic className="w-4 h-4" /></button>
                      <button onClick={() => insertText('- ', '')} className="p-2 hover:bg-hover rounded-lg text-muted transition-colors"><List className="w-4 h-4" /></button>
                      <button onClick={() => insertText('> ', '')} className="p-2 hover:bg-hover rounded-lg text-muted transition-colors"><Quote className="w-4 h-4" /></button>
                      <EmojiPickerButton onEmojiSelect={(emoji) => insertText(emoji, '')} />
                    </div>
                    <textarea 
                      ref={textareaRef}
                      value={postForm.content}
                      onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.currentTarget.select()}
                      placeholder="Írd ide a bejegyzés tartalmát..."
                      className="w-full bg-transparent px-5 py-4 focus:outline-none min-h-[200px] resize-none text-body leading-relaxed font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => {
                      addNotification({
                        userId: 'all',
                        type: 'news',
                        title: 'Új poszt közzétéve!',
                        message: `A(z) "${postForm.title}" bejegyzés sikeresen közzétéve.`
                      });
                      setActiveModal(null);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                  >
                    <Save className="w-5 h-5" /> Poszt közzététele
                  </button>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="px-8 bg-hover hover:bg-hover/80 border border-main text-title py-4 rounded-2xl font-bold transition-all"
                  >
                    Mégse
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeModal === 'course' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
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
                  <Plus className="text-blue-500" /> Új Kurzus Létrehozása
                </h2>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Type className="w-4 h-4" /> Cím
                  </label>
                  <input 
                    type="text" 
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="A kurzus címe..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Kategória
                    </label>
                    <select 
                      value={courseForm.category}
                      onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option value="AI Alapok">AI Alapok</option>
                      <option value="Prompt Engineering">Prompt Engineering</option>
                      <option value="AI Üzleti Alkalmazása">AI Üzleti Alkalmazása</option>
                      <option value="Képalkotás">Képalkotás</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Szint
                    </label>
                    <select 
                      value={courseForm.level}
                      onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option value="Kezdő">Kezdő</option>
                      <option value="Haladó">Haladó</option>
                      <option value="Profi">Profi</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Hozzáférés
                    </label>
                    <select 
                      value={courseForm.accessType}
                      onChange={(e) => setCourseForm({ ...courseForm, accessType: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option value="free">Ingyenes</option>
                      <option value="premium">Prémium</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Ár (Ft)
                    </label>
                    <input 
                      type="number" 
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({ ...courseForm, price: parseInt(e.target.value) || 0 })}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.currentTarget.select()}
                      placeholder="0"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => {
                      addNotification({
                        userId: 'all',
                        type: 'course',
                        title: 'Új kurzus létrehozva!',
                        message: `A(z) "${courseForm.title}" kurzus sikeresen létrehozva.`
                      });
                      setActiveModal(null);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                  >
                    <Save className="w-5 h-5" /> Kurzus mentése
                  </button>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="px-8 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-2xl font-bold transition-all"
                  >
                    Mégse
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeModal === 'notification' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
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
                  <Bell className="text-orange-500" /> Értesítés Küldése
                </h2>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Célcsoport</label>
                    <select 
                      value={notificationForm.target}
                      onChange={(e) => setNotificationForm({ ...notificationForm, target: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors appearance-none text-sm"
                    >
                      <option value="all">Mindenki</option>
                      <option value="premium">Csak Prémium</option>
                      <option value="free">Csak Ingyenes</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Típus</label>
                    <select 
                      value={notificationForm.type}
                      onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors appearance-none text-sm"
                    >
                      <option value="admin">Rendszerüzenet</option>
                      <option value="news">Hír</option>
                      <option value="course">Kurzus</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ikon Kiválasztása</label>
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
                      { id: 'ExternalLink', icon: ExternalLink }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setNotificationForm({ ...notificationForm, icon: item.id })}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-center ${
                          notificationForm.icon === item.id 
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
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Cím</label>
                  <input 
                    type="text" 
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="Értesítés címe..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Üzenet</label>
                  <textarea 
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="Írd ide az üzenetet..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors min-h-[120px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Link (opcionális)</label>
                  <input 
                    type="text" 
                    value={notificationForm.link}
                    onChange={(e) => setNotificationForm({ ...notificationForm, link: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="Pl: /news/1"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => {
                      addNotification({
                        userId: notificationForm.target === 'all' ? 'all' : 'premium', // Simplified for demo
                        type: notificationForm.type,
                        title: notificationForm.title,
                        message: notificationForm.message,
                        icon: notificationForm.icon,
                        link: notificationForm.link || undefined
                      } as any);
                      setActiveModal(null);
                      setNotificationForm({
                        title: '',
                        message: '',
                        type: 'admin',
                        icon: 'Bell',
                        target: 'all',
                        link: ''
                      });
                    }}
                    className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-600/20"
                  >
                    <Send className="w-5 h-5" /> Küldés most
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
