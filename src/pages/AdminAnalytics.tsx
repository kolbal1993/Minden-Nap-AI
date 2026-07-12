/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AdminAnalytics — `/admin` and `/admin/analytics` route.
 * Backed by Firestore:
 *   - `users/{uid}`              → user counts (total, premium, free)
 *   - `posts/{id}`               → post counts, "most saved" table
 *   - `courses/{id}`             → course counts
 *   - `analytics_events/{id}`    → last-7-days events, views
 *
 * No hardcoded numbers, no localStorage fallback.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Eye,
  Crown,
  User as UserIcon,
  Smile,
  Bookmark,
  Users,
  Plus,
  X,
  Image as ImageIcon,
  Type,
  Heading1,
  Heading2,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Code,
  Quote,
  ListOrdered,
  BookOpen,
  Lock,
  CreditCard,
  ArrowUpRight,
  Activity,
  Bell,
  Menu,
  BarChart3,
  Megaphone,
  Newspaper,
  Zap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Send,
  Target,
  Calendar,
  ExternalLink,
  Clock,
  MessageSquare,
  Edit2,
  Trash2,
  Save,
  Eye as EyeIcon,
  EyeOff,
  LayoutDashboard,
} from 'lucide-react';
import EmojiPickerButton from '../components/EmojiPickerButton';
import AdminSidebar from '../components/AdminSidebar';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useFirestoreCollection, FirestoreDoc } from '../hooks/useFirestoreCollection';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface UserDoc extends FirestoreDoc {
  isPremium?: boolean;
  isBlocked?: boolean;
  createdAt?: { seconds: number; nanoseconds: number } | string;
}

interface PostDoc extends FirestoreDoc {
  title: string;
  imageUrl?: string;
  reactions?: { [emoji: string]: number };
  saves?: number;
  createdAt?: { seconds: number; nanoseconds: number } | string;
}

interface EventDoc extends FirestoreDoc {
  type?: string;
  name?: string;
  eventName?: string;
  timestamp?: { seconds: number; nanoseconds: number } | string;
  createdAt?: { seconds: number; nanoseconds: number } | string;
  path?: string;
  postId?: string;
  userId?: string;
}

const getEventTs = (e: EventDoc): number => {
  const v = e.timestamp || e.createdAt;
  if (!v) return 0;
  if (typeof v === 'string') return new Date(v).getTime();
  if (typeof v === 'object' && 'seconds' in v) return v.seconds * 1000;
  return 0;
};

const getPostTs = (p: PostDoc): number => {
  if (!p.createdAt) return 0;
  if (typeof p.createdAt === 'string') return new Date(p.createdAt).getTime();
  if (typeof p.createdAt === 'object' && 'seconds' in p.createdAt) return p.createdAt.seconds * 1000;
  return 0;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const LAST_7_DAYS_BUCKETS = Array.from({ length: 7 }).map((_, i) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (6 - i));
  return {
    key: date.toISOString().slice(0, 10),
    label: `${date.getMonth() + 1}.${date.getDate()}.`,
    start: date.getTime(),
    end: date.getTime() + DAY_MS,
  };
});

const formatDate = (val: unknown): string => {
  if (!val) return '—';
  if (typeof val === 'string') return new Date(val).toLocaleString('hu-HU');
  if (typeof val === 'object' && val !== null && 'seconds' in val) {
    return new Date(((val as any).seconds as number) * 1000).toLocaleString('hu-HU');
  }
  return '—';
};

export default function AdminAnalytics() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Realtime: users (counts), posts (table), analytics events (last 7 days)
  const { data: usersData, loading: usersLoading } = useFirestoreCollection('users', {
    realtime: true,
    max: 1000,
  });
  const { data: postsData, loading: postsLoading } = useFirestoreCollection('posts', {
    realtime: true,
    orderBy: 'createdAt',
    orderDirection: 'desc',
    max: 200,
  });
  const { data: eventsData, loading: eventsLoading, error: eventsError } = useFirestoreCollection('analytics_events', {
    realtime: true,
    max: 1000,
  });
  const { data: coursesData } = useFirestoreCollection('courses', {
    realtime: true,
    max: 500,
  });

  const users = usersData as UserDoc[];
  const posts = postsData as PostDoc[];
  const events = eventsData as EventDoc[];

  // ----- Aggregations -----
  const totalUsers = users.length;
  const premiumUsers = useMemo(() => users.filter((u) => u.isPremium).length, [users]);
  const freeUsers = Math.max(0, totalUsers - premiumUsers);
  const premiumRatio = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 1000) / 10 : 0;

  // Posts stats
  const sortedNews = useMemo(() => {
    return [...posts]
      .map((p) => {
        const reactionCount = p.reactions
          ? Object.values(p.reactions).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0)
          : 0;
        const saves = p.saves ?? 0;
        return { ...p, reactions: reactionCount, saves, totalInteractions: reactionCount + saves };
      })
      .sort((a, b) => b.totalInteractions - a.totalInteractions);
  }, [posts]);

  const totalReactions = useMemo(
    () => posts.reduce((acc, p) => acc + (p.reactions ? Object.values(p.reactions).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0) : 0), 0),
    [posts],
  );
  const totalSaves = useMemo(() => posts.reduce((acc, p) => acc + (p.saves ?? 0), 0), [posts]);
  const totalCourses = coursesData.length;

  // Last 7 days events bucketing
  const last7Days = useMemo(() => {
    const now = Date.now();
    const cutoff = now - 7 * DAY_MS;
    const recent = events.filter((e) => getEventTs(e) >= cutoff);
    return LAST_7_DAYS_BUCKETS.map((bucket) => ({
      label: bucket.label,
      count: recent.filter((e) => {
        const ts = getEventTs(e);
        return ts >= bucket.start && ts < bucket.end;
      }).length,
    }));
  }, [events]);

  // Active readers (last 7 days): unique userIds seen in events
  const activeReaders = useMemo(() => {
    const cutoff = Date.now() - 7 * DAY_MS;
    const uids = new Set<string>();
    for (const e of events) {
      if (getEventTs(e) >= cutoff && e.userId) uids.add(e.userId);
    }
    return uids.size;
  }, [events]);

  // ----- Modals (campaign / post / course / notification) -----
  const [activeModal, setActiveModal] = useState<'campaign' | 'post' | 'course' | 'notification' | null>(null);

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    type: 'all' as 'all' | 'course' | 'premium',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: undefined as number | undefined,
    startDate: '',
    endDate: '',
    status: 'scheduled' as 'active' | 'scheduled' | 'expired',
  });
  const [savingCampaign, setSavingCampaign] = useState(false);

  const [postForm, setPostForm] = useState({
    title: '',
    type: 'Generatív AI' as 'Generatív AI' | 'Üzleti Automatizáció' | 'AI eszközök' | 'Szabályozás',
    status: 'active' as 'active' | 'inactive',
    publishDate: '',
    expiryDate: '',
    imageUrl: '',
    content: '',
  });
  const [savingPost, setSavingPost] = useState(false);

  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'AI Alapok' as 'AI Alapok' | 'Prompt Engineering' | 'AI Üzleti Alkalmazása' | 'Képalkotás',
    level: 'Kezdő' as 'Kezdő' | 'Haladó' | 'Profi',
    status: 'active' as 'active' | 'inactive',
    accessType: 'free' as 'free' | 'premium',
    price: 0,
  });
  const [savingCourse, setSavingCourse] = useState(false);

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'admin' as 'admin' | 'news' | 'course',
    icon: 'Bell',
    link: '',
  });
  const [savingNotification, setSavingNotification] = useState(false);

  // ----- Submit handlers -----
  const saveCampaign = async () => {
    if (!campaignForm.name || campaignForm.discountValue === undefined) return;
    setSavingCampaign(true);
    try {
      await addDoc(collection(db, 'campaigns'), {
        ...campaignForm,
        usageCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setActiveModal(null);
      setCampaignForm({ name: '', description: '', type: 'all', discountType: 'percentage', discountValue: undefined, startDate: '', endDate: '', status: 'scheduled' });
    } catch (err) {
      console.error('[AdminAnalytics] campaign save error:', err);
    } finally {
      setSavingCampaign(false);
    }
  };

  const savePost = async () => {
    if (!postForm.title) return;
    setSavingPost(true);
    try {
      await addDoc(collection(db, 'posts'), {
        ...postForm,
        date: new Date().toISOString().split('T')[0],
        reactions: {},
        saves: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setActiveModal(null);
      setPostForm({ title: '', type: 'Generatív AI', status: 'active', publishDate: '', expiryDate: '', imageUrl: '', content: '' });
    } catch (err) {
      console.error('[AdminAnalytics] post save error:', err);
    } finally {
      setSavingPost(false);
    }
  };

  const saveCourse = async () => {
    if (!courseForm.title) return;
    setSavingCourse(true);
    try {
      await addDoc(collection(db, 'courses'), {
        ...courseForm,
        price: Number(courseForm.price) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setActiveModal(null);
      setCourseForm({ title: '', description: '', category: 'AI Alapok', level: 'Kezdő', status: 'active', accessType: 'free', price: 0 });
    } catch (err) {
      console.error('[AdminAnalytics] course save error:', err);
    } finally {
      setSavingCourse(false);
    }
  };

  const saveNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) return;
    setSavingNotification(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: 'all',
        type: notificationForm.type,
        title: notificationForm.title,
        message: notificationForm.message,
        icon: notificationForm.icon,
        link: notificationForm.link || null,
        read: false,
        createdAt: serverTimestamp(),
      });
      setActiveModal(null);
      setNotificationForm({ title: '', message: '', type: 'admin', icon: 'Bell', link: '' });
    } catch (err) {
      console.error('[AdminAnalytics] notification save error:', err);
    } finally {
      setSavingNotification(false);
    }
  };

  const loading = usersLoading || postsLoading;

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
              <Newspaper className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Új Poszt</span>
            </button>
            <button
              onClick={() => setActiveModal('course')}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-hover hover:bg-hover/80 border border-main rounded-xl text-[10px] md:text-[11px] font-bold transition-all text-title"
            >
              <BookOpen className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Új Kurzus</span>
            </button>
            <button
              onClick={() => setActiveModal('notification')}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 rounded-xl text-[10px] md:text-[11px] font-bold transition-all"
            >
              <Bell className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Értesítés</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 space-y-8">
          {eventsError && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl text-sm">
              ⚠️ Az analytics_events collection nem olvasható: {eventsError.message}. A toplista és a 7 napos diagram a posts/users adatokból dolgozik.
            </div>
          )}

          {/* User Distribution Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-3xl relative overflow-hidden group shadow-xl border-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <Users className="text-blue-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-muted text-sm font-bold uppercase tracking-wider">Összes Felhasználó</p>
                  {loading ? (
                    <Skeleton className="h-9 w-20 mt-1" />
                  ) : (
                    <h3 className="text-3xl font-bold text-title">{totalUsers.toLocaleString('hu-HU')}</h3>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted text-xs font-medium relative z-10">
                <TrendingUp className="w-3 h-3 text-green-500" /> Firestore `users` collection
              </div>
            </div>

            <div className="bg-card p-6 rounded-3xl relative overflow-hidden group shadow-xl border-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                  <Crown className="text-orange-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-muted text-sm font-bold uppercase tracking-wider">Prémium Tagok</p>
                  {loading ? (
                    <Skeleton className="h-9 w-20 mt-1" />
                  ) : (
                    <h3 className="text-3xl font-bold text-orange-500">{premiumUsers.toLocaleString('hu-HU')}</h3>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted text-xs font-medium relative z-10">
                <div className="w-full bg-hover h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full" style={{ width: `${premiumRatio}%` }} />
                </div>
                <span className="shrink-0">{premiumRatio}% arány</span>
              </div>
            </div>

            <div className="bg-card p-6 rounded-3xl relative overflow-hidden group shadow-xl border-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-500/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-hover rounded-2xl flex items-center justify-center">
                  <UserIcon className="text-muted w-6 h-6" />
                </div>
                <div>
                  <p className="text-muted text-sm font-bold uppercase tracking-wider">Ingyenes Felhasználók</p>
                  {loading ? (
                    <Skeleton className="h-9 w-20 mt-1" />
                  ) : (
                    <h3 className="text-3xl font-bold text-title">{freeUsers.toLocaleString('hu-HU')}</h3>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted text-xs font-medium relative z-10">
                <div className="w-full bg-hover h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gray-500 h-full" style={{ width: `${totalUsers > 0 ? 100 - premiumRatio : 0}%` }} />
                </div>
                <span className="shrink-0">{totalUsers > 0 ? (100 - premiumRatio).toFixed(1) : 0}% arány</span>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-3xl shadow-xl border-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <Smile className="text-blue-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-muted text-sm font-bold uppercase tracking-wider">Összes Reakció</p>
                  <h3 className="text-3xl font-bold text-title">{totalReactions.toLocaleString('hu-HU')}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted text-sm font-bold">
                A `posts.reactions` map összege
              </div>
            </div>

            <div className="bg-card p-6 rounded-3xl shadow-xl border-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                  <Bookmark className="text-orange-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-muted text-sm font-bold uppercase tracking-wider">Összes Mentés</p>
                  <h3 className="text-3xl font-bold text-title">{totalSaves.toLocaleString('hu-HU')}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted text-sm font-bold">
                A `posts.saves` összege
              </div>
            </div>

            <div className="bg-card p-6 rounded-3xl shadow-xl border-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                  <Activity className="text-purple-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-muted text-sm font-bold uppercase tracking-wider">Aktív Olvasók (7 nap)</p>
                  {eventsLoading ? (
                    <Skeleton className="h-9 w-20 mt-1" />
                  ) : (
                    <h3 className="text-3xl font-bold text-title">{activeReaders.toLocaleString('hu-HU')}</h3>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-500 text-sm font-bold">
                <Eye className="w-4 h-4" /> Egyedi userId-k az events-ben
              </div>
            </div>
          </div>

          {/* 7-day events chart */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-card border border-main rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold mb-1 text-title">Események az elmúlt 7 napban</h2>
                  <p className="text-sm text-muted">`analytics_events` collection — napi bontásban</p>
                </div>
                <div className="bg-blue-500/10 text-blue-500 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-blue-500/20">
                  <BarChart3 className="w-4 h-4" /> Összes: {last7Days.reduce((a, b) => a + b.count, 0)}
                </div>
              </div>

              {eventsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : last7Days.every((d) => d.count === 0) ? (
                <EmptyState
                  icon={BarChart3}
                  title="Még nincs elemzhető esemény"
                  description="Amint a felhasználók interakcióba lépnek a tartalommal, itt fognak megjelenni a napi bontású statisztikák."
                />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last7Days}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" vertical={false} />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                      <Tooltip
                        cursor={{ fill: 'var(--bg-hover)' }}
                        contentStyle={{
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-main)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: 'var(--text-title)',
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {last7Days.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#3b82f6" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-card border border-main rounded-3xl p-8 flex flex-col justify-center shadow-sm">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <Newspaper className="text-blue-500 w-6 h-6" />
                </div>
                <h3 className="text-muted text-sm font-bold uppercase tracking-widest mb-2">Posztok száma</h3>
                <h3 className="text-4xl font-bold text-title mb-2">{posts.length.toLocaleString('hu-HU')}</h3>
                <p className="text-xs text-muted">Firestore `posts` collection</p>
              </div>

              <div className="bg-card border border-main rounded-3xl p-8 flex flex-col justify-center shadow-sm">
                <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <BookOpen className="text-orange-500 w-6 h-6" />
                </div>
                <h3 className="text-muted text-sm font-bold uppercase tracking-widest mb-2">Kurzusok száma</h3>
                <h3 className="text-4xl font-bold text-title mb-2">{totalCourses.toLocaleString('hu-HU')}</h3>
                <p className="text-xs text-muted">Firestore `courses` collection</p>
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
            {postsLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : sortedNews.length === 0 ? (
              <EmptyState
                icon={Newspaper}
                title="Még nincsenek posztok"
                description="Hozz létre posztokat az Admin → Posztok oldalon, és itt fognak megjelenni a mentési/reakció statisztikák."
                cta={{ label: 'Új poszt létrehozása', onClick: () => setActiveModal('post'), icon: Plus }}
              />
            ) : (
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
                    {sortedNews.slice(0, 20).map((news) => {
                      const total = totalReactions + totalSaves || 1;
                      const ratio = Math.min(100, (news.totalInteractions / total) * 100);
                      return (
                        <tr key={news.id} className="hover:bg-hover transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-hover shrink-0">
                                {news.imageUrl ? (
                                  <img src={news.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted">
                                    <Newspaper className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <span className="font-medium text-title line-clamp-1">{news.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-orange-500">{news.saves}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-blue-600">{news.reactions}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-16 h-1 bg-hover rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${ratio}%` }} />
                              </div>
                              <span className="text-xs text-muted">{ratio.toFixed(0)}%</span>
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
        </div>
      </main>

      {/* Campaign Modal */}
      <AnimatePresence>
        {activeModal === 'campaign' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
              className="relative w-full max-w-2xl bg-card border border-main rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-main bg-hover flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-title">
                  <Target className="text-blue-600" /> Új Kampány
                </h2>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-card rounded-full text-muted">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-auto">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2"><Type className="w-4 h-4" /> Kampány neve</label>
                  <input type="text" value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-title" placeholder="Pl: Tavaszi Megújulás" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider">Leírás</label>
                  <textarea value={campaignForm.description} onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })} className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-title min-h-[80px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider">Kedvezmény típus</label>
                    <select value={campaignForm.discountType} onChange={(e) => setCampaignForm({ ...campaignForm, discountType: e.target.value as any })} className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-title">
                      <option value="percentage">Százalék</option>
                      <option value="fixed">Fix összeg</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider">Érték</label>
                    <input type="number" value={campaignForm.discountValue || ''} onChange={(e) => setCampaignForm({ ...campaignForm, discountValue: parseInt(e.target.value) || 0 })} className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-title" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider">Kezdés</label>
                    <input type="date" value={campaignForm.startDate} onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })} className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-title" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider">Vége</label>
                    <input type="date" value={campaignForm.endDate} onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })} className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-title" />
                  </div>
                </div>
                <button onClick={saveCampaign} disabled={savingCampaign || !campaignForm.name} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50">
                  {savingCampaign ? 'Mentés...' : 'Kampány mentése Firestore-ba'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Modal */}
      <AnimatePresence>
        {activeModal === 'post' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
              className="relative w-full max-w-2xl bg-card border border-main rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-main bg-hover flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-title">
                  <Newspaper className="text-blue-600" /> Új Poszt (gyors)
                </h2>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-card rounded-full text-muted">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-auto">
                <input type="text" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} placeholder="Poszt címe..." className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-title" />
                <textarea value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} placeholder="Tartalom..." className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-title min-h-[120px]" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={postForm.type} onChange={(e) => setPostForm({ ...postForm, type: e.target.value as any })} className="bg-hover border border-main rounded-2xl px-5 py-4 text-title">
                    <option value="Generatív AI">Generatív AI</option>
                    <option value="Üzleti Automatizáció">Üzleti Automatizáció</option>
                    <option value="AI eszközök">AI eszközök</option>
                    <option value="Szabályozás">Szabályozás</option>
                  </select>
                  <select value={postForm.status} onChange={(e) => setPostForm({ ...postForm, status: e.target.value as any })} className="bg-hover border border-main rounded-2xl px-5 py-4 text-title">
                    <option value="active">Aktív</option>
                    <option value="inactive">Inaktív</option>
                  </select>
                </div>
                <button onClick={savePost} disabled={savingPost || !postForm.title} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50">
                  {savingPost ? 'Mentés...' : 'Poszt mentése Firestore-ba'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Course Modal */}
      <AnimatePresence>
        {activeModal === 'course' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
              className="relative w-full max-w-2xl bg-card border border-main rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-main bg-hover flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-title">
                  <BookOpen className="text-blue-600" /> Új Kurzus (gyors)
                </h2>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-card rounded-full text-muted">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <input type="text" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="Kurzus címe..." className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-title" />
                <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Leírás..." className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-title min-h-[80px]" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value as any })} className="bg-hover border border-main rounded-2xl px-5 py-4 text-title">
                    <option value="AI Alapok">AI Alapok</option>
                    <option value="Prompt Engineering">Prompt Engineering</option>
                    <option value="AI Üzleti Alkalmazása">AI Üzleti Alkalmazása</option>
                    <option value="Képalkotás">Képalkotás</option>
                  </select>
                  <select value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as any })} className="bg-hover border border-main rounded-2xl px-5 py-4 text-title">
                    <option value="Kezdő">Kezdő</option>
                    <option value="Haladó">Haladó</option>
                    <option value="Profi">Profi</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select value={courseForm.accessType} onChange={(e) => setCourseForm({ ...courseForm, accessType: e.target.value as any })} className="bg-hover border border-main rounded-2xl px-5 py-4 text-title">
                    <option value="free">Ingyenes</option>
                    <option value="premium">Prémium</option>
                  </select>
                  <input type="number" value={courseForm.price || ''} onChange={(e) => setCourseForm({ ...courseForm, price: parseInt(e.target.value) || 0 })} placeholder="Ár (Ft)" className="bg-hover border border-main rounded-2xl px-5 py-4 text-title" />
                </div>
                <button onClick={saveCourse} disabled={savingCourse || !courseForm.title} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50">
                  {savingCourse ? 'Mentés...' : 'Kurzus mentése Firestore-ba'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Modal */}
      <AnimatePresence>
        {activeModal === 'notification' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
              className="relative w-full max-w-2xl bg-card border border-main rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-main bg-hover flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-title">
                  <Bell className="text-orange-500" /> Rendszerértesítés Küldése
                </h2>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-card rounded-full text-muted">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-auto">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Ikon</label>
                  <div className="grid grid-cols-5 gap-2">
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
                        onClick={() => setNotificationForm({ ...notificationForm, icon: item.id })}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-center ${notificationForm.icon === item.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-hover border-main text-muted hover:bg-hover/80'}`}
                      >
                        <item.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
                <input type="text" value={notificationForm.title} onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })} placeholder="Értesítés címe..." className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-title" />
                <textarea value={notificationForm.message} onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })} placeholder="Üzenet..." className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 min-h-[100px] text-title" />
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Link (opcionális)</label>
                  <input type="text" value={notificationForm.link} onChange={(e) => setNotificationForm({ ...notificationForm, link: e.target.value })} placeholder="Pl: /news/1" className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-title" />
                </div>
                <button
                  onClick={saveNotification}
                  disabled={savingNotification || !notificationForm.title || !notificationForm.message}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" /> {savingNotification ? 'Küldés...' : 'Értesítés kiküldése Firestore-ba'}
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
