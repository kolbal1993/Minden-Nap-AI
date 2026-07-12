/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AdminDashboard — `/admin/posts` route.
 * Backed by Firestore `posts/{auto-id}`.
 * Realtime onSnapshot, full CRUD with EmptyState and Skeleton.
 */
import { useState, FormEvent, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  FileText,
  X,
  Save,
  Image as ImageIcon,
  Type,
  Clock,
  Eye,
  EyeOff,
  Heading1,
  Heading2,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Code,
  Quote,
  ListOrdered,
  Smile,
  Bell,
  Megaphone,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Menu,
  AlertOctagon,
  Newspaper,
  Bookmark,
} from 'lucide-react';
import EmojiPickerButton from '../components/EmojiPickerButton';
import AdminSidebar from '../components/AdminSidebar';
import { addDoc, updateDoc, deleteDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useFirestoreCollection, FirestoreDoc } from '../hooks/useFirestoreCollection';

type PostType = 'Generatív AI' | 'Üzleti Automatizáció' | 'AI eszközök' | 'Szabályozás';
type PostStatus = 'active' | 'inactive';

interface PostDoc extends FirestoreDoc {
  title: string;
  type: PostType;
  date: string;
  content: string;
  imageUrl?: string;
  reactions?: { [emoji: string]: number };
  saves?: number;
  status: PostStatus;
  publishDate: string;
  expiryDate: string;
  createdAt?: { seconds: number; nanoseconds: number } | string;
}

const EMPTY_POST: Partial<PostDoc> = {
  title: '',
  type: 'Generatív AI',
  content: '',
  imageUrl: '',
  status: 'active',
  publishDate: '',
  expiryDate: '',
};

const getLocalISOString = (date: Date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

export default function AdminDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    data: posts,
    loading,
    error,
  } = useFirestoreCollection('posts', {
    orderBy: 'createdAt',
    orderDirection: 'desc',
    realtime: true,
    max: 200,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostDoc | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<PostDoc>>(EMPTY_POST);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Notification modal
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    type: 'admin' as 'admin' | 'news' | 'course',
    icon: 'Bell',
    link: '',
  });
  const [sendingNotification, setSendingNotification] = useState(false);

  useEffect(() => {
    if (isModalOpen && !editingPost) {
      setFormData({ ...EMPTY_POST, publishDate: getLocalISOString() });
    }
  }, [isModalOpen, editingPost]);

  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);

    setFormData({ ...formData, content: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleOpenModal = (post?: PostDoc) => {
    if (post) {
      setEditingPost(post);
      setFormData({ ...post });
    } else {
      setEditingPost(null);
      setFormData({ ...EMPTY_POST, publishDate: getLocalISOString() });
    }
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      setFormError('A poszt címének megadása kötelező.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        title: formData.title,
        type: (formData.type as PostType) || 'Generatív AI',
        content: formData.content || '',
        imageUrl: formData.imageUrl || '',
        status: (formData.status as PostStatus) || 'active',
        publishDate: formData.publishDate || getLocalISOString(),
        expiryDate: formData.expiryDate || '',
        updatedAt: serverTimestamp(),
      };
      if (editingPost) {
        await updateDoc(doc(db, 'posts', editingPost.id), payload);
      } else {
        const newDocRef = await addDoc(collection(db, 'posts'), {
          ...payload,
          date: new Date().toISOString().split('T')[0],
          reactions: {},
          saves: 0,
          createdAt: serverTimestamp(),
        });
        // Trigger a Firestore notification so users see the new post
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: 'all',
            type: 'news',
            title: 'Új hír érhető el!',
            message: formData.title,
            link: `/news/${newDocRef.id}`,
            icon: 'Newspaper',
            read: false,
            createdAt: serverTimestamp(),
          });
        } catch (notifErr) {
          console.warn('[AdminDashboard] notification write failed (non-fatal):', notifErr);
        }
      }
      handleCloseModal();
    } catch (err) {
      console.error('[AdminDashboard] save error:', err);
      setFormError(err instanceof Error ? err.message : 'Mentési hiba.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setPostToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await deleteDoc(doc(db, 'posts', postToDelete));
      setIsDeleteConfirmOpen(false);
      setPostToDelete(null);
    } catch (err) {
      console.error('[AdminDashboard] delete error:', err);
    }
  };

  const handleSendSystemNotification = async () => {
    if (!notificationData.title || !notificationData.message) return;
    setSendingNotification(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: 'all',
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        icon: notificationData.icon,
        link: notificationData.link || null,
        read: false,
        createdAt: serverTimestamp(),
      });
      setIsNotificationModalOpen(false);
      setNotificationData({ title: '', message: '', type: 'admin', icon: 'Bell', link: '' });
    } catch (err) {
      console.error('[AdminDashboard] notification error:', err);
    } finally {
      setSendingNotification(false);
    }
  };

  const filteredPosts = (posts as PostDoc[]).filter(
    (p) =>
      (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((p.type || '').toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="min-h-screen bg-main text-body flex font-sans transition-colors duration-300 relative">
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
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-main bg-glass backdrop-blur-md flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-hover rounded-xl md:hidden text-title"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-title">Posztok</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Keresés..."
                className="bg-card border border-main rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 w-64 text-title placeholder:text-muted"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => { setSearchTerm(''); e.target.select(); }}
                onClick={(e) => e.currentTarget.select()}
              />
            </div>
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="bg-hover hover:bg-hover/80 text-title px-3 md:px-4 py-2 rounded-xl text-[11px] md:text-sm font-bold flex items-center gap-2 transition-all border border-main"
            >
              <Bell className="w-4 h-4" /> <span className="hidden sm:inline">Értesítés</span>
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 md:px-4 py-2 rounded-xl text-[11px] md:text-sm font-bold flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Új poszt</span>
            </button>
          </div>
        </header>

        {/* Table Container */}
        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="bg-card rounded-3xl overflow-hidden shadow-xl border-none p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              icon={AlertOctagon}
              title="Nem sikerült betölteni a posztokat"
              description={error.message}
              cta={{ label: 'Új poszt létrehozása', onClick: () => handleOpenModal(), icon: Plus }}
            />
          ) : filteredPosts.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title={searchTerm ? 'Nincs találat' : 'Még nincsenek posztok'}
              description={
                searchTerm
                  ? 'A keresésedre nincs találat. Próbálj más kulcsszót.'
                  : 'Hozd létre az első posztodat, hogy a felhasználók friss híreket olvashassanak.'
              }
              cta={!searchTerm ? { label: 'Új poszt létrehozása', onClick: () => handleOpenModal(), icon: Plus } : undefined}
            />
          ) : (
            <div className="bg-card rounded-3xl overflow-hidden shadow-xl border-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-hover border-b border-main">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Cím</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Típus</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Státusz</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Időzítés</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Statisztika</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Dátum</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-right">Műveletek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-main">
                  {filteredPosts.map((rawPost) => {
                    const post = rawPost as PostDoc;
                    const reactionCount = post.reactions
                      ? Object.values(post.reactions).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0)
                      : 0;
                    return (
                      <tr
                        key={post.id}
                        onClick={() => handleOpenModal(post)}
                        className="hover:bg-hover transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-hover shrink-0">
                              {post.imageUrl ? (
                                <img src={post.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-500/10 text-blue-500">
                                  <Newspaper className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-title">{post.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            {post.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {post.status === 'active' ? (
                              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                                <Eye className="w-3 h-3" /> Aktív
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted bg-hover px-2 py-1 rounded-md border border-main">
                                <EyeOff className="w-3 h-3" /> Inaktív
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-muted">
                              <Clock className="w-3 h-3 text-blue-500" />
                              <span>Publikálás: {post.publishDate || '—'}</span>
                            </div>
                            {post.expiryDate && (
                              <div className="flex items-center gap-1.5 text-[10px] text-muted">
                                <X className="w-3 h-3 text-red-500" />
                                <span>Lejárat: {post.expiryDate}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-blue-500" title="Reakciók">
                              <Smile className="w-3.5 h-3.5" />
                              <span className="text-xs font-bold">{reactionCount}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-orange-500" title="Mentések">
                              <Bookmark className="w-3.5 h-3.5" />
                              <span className="text-xs font-bold">{post.saves ?? 0}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted">{post.date || '—'}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(post);
                              }}
                              className="p-2 rounded-lg hover:bg-blue-500/10 text-muted hover:text-blue-500 transition-all"
                              title="Szerkesztés"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(post.id);
                              }}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-all"
                              title="Törlés"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Modal / Form Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && handleCloseModal()}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-main rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-main flex justify-between items-center bg-hover">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-title">
                  {editingPost ? <Edit2 className="text-blue-500" /> : <Plus className="text-blue-500" />}
                  {editingPost ? 'Poszt Szerkesztése' : 'Új Poszt Létrehozása'}
                </h2>
                <button onClick={handleCloseModal} disabled={saving} className="p-2 hover:bg-hover rounded-full transition-colors text-muted disabled:opacity-50">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                    <Type className="w-4 h-4" /> Cím
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="A bejegyzés címe..."
                    className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                      <Type className="w-4 h-4" /> Típus
                    </label>
                    <select
                      value={formData.type || 'Generatív AI'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as PostType })}
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
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'active' })}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border transition-all ${
                          formData.status === 'active'
                            ? 'bg-green-500/10 border-green-500/50 text-green-500'
                            : 'bg-hover border-main text-muted'
                        }`}
                      >
                        <Eye className="w-4 h-4" /> Aktív
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'inactive' })}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border transition-all ${
                          formData.status === 'inactive'
                            ? 'bg-red-500/10 border-red-500/50 text-red-500'
                            : 'bg-hover border-main text-muted'
                        }`}
                      >
                        <EyeOff className="w-4 h-4" /> Inaktív
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Publikálás dátuma és ideje
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.publishDate || ''}
                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                      <X className="w-4 h-4" /> Lejárat dátuma és ideje
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.expiryDate || ''}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title"
                    />
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
                            setFormData({ ...formData, imageUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full bg-hover border border-main rounded-2xl px-5 py-4 flex items-center gap-3 group-hover/upload:border-blue-500/50 transition-colors overflow-hidden">
                      {formData.imageUrl ? (
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-hover shrink-0">
                            <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-sm text-muted truncate flex-1">Kép kiválasztva</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({ ...formData, imageUrl: '' });
                            }}
                            className="text-red-500 hover:text-red-400 p-1"
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
                      <button type="button" onClick={() => insertText('# ', '')} className="p-2 hover:bg-hover rounded-lg text-muted transition-colors" title="Címsor 1"><Heading1 className="w-4 h-4" /></button>
                      <button type="button" onClick={() => insertText('## ', '')} className="p-2 hover:bg-hover rounded-lg text-muted transition-colors" title="Címsor 2"><Heading2 className="w-4 h-4" /></button>
                      <div className="w-px h-5 bg-main mx-1" />
                      <button type="button" onClick={() => insertText('**', '**')} className="p-2 hover:bg-hover rounded-lg text-muted transition-colors" title="Félkövér"><Bold className="w-4 h-4" /></button>
                      <button type="button" onClick={() => insertText('*', '*')} className="p-2 hover:bg-hover rounded-lg text-muted transition-colors" title="Dőlt"><Italic className="w-4 h-4" /></button>
                      <div className="w-px h-5 bg-main mx-1" />
                      <button type="button" onClick={() => insertText('- ', '')} className="p-2 hover:bg-hover rounded-lg text-muted transition-colors" title="Lista"><List className="w-4 h-4" /></button>
                      <button type="button" onClick={() => insertText('1. ', '')} className="p-2 hover:bg-hover rounded-lg text-muted transition-colors" title="Számozott lista"><ListOrdered className="w-4 h-4" /></button>
                      <div className="w-px h-5 bg-main mx-1" />
                      <button type="button" onClick={() => insertText('> ', '')} className="p-2 hover:bg-hover rounded-lg text-muted transition-colors" title="Idézet"><Quote className="w-4 h-4" /></button>
                      <button type="button" onClick={() => insertText('`', '`')} className="p-2 hover:bg-hover rounded-lg text-muted transition-colors" title="Kód"><Code className="w-4 h-4" /></button>
                      <button type="button" onClick={() => insertText('[', '](url)')} className="p-2 hover:bg-hover rounded-lg text-muted transition-colors" title="Link"><LinkIcon className="w-4 h-4" /></button>
                      <div className="w-px h-5 bg-main mx-1" />
                      <EmojiPickerButton onEmojiSelect={(emoji) => insertText(emoji, '')} />
                    </div>
                    <textarea
                      ref={textareaRef}
                      required
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.currentTarget.select()}
                      placeholder="Írd ide a bejegyzés tartalmát (Markdown támogatott)..."
                      className="w-full bg-transparent px-5 py-4 focus:outline-none min-h-[300px] resize-none text-body leading-relaxed font-mono text-sm"
                    />
                  </div>
                </div>

                {formError && (
                  <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                    {formError}
                  </div>
                )}

                <div className="pt-4 flex gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" /> {saving ? 'Mentés...' : editingPost ? 'Módosítások mentése' : 'Poszt közzététele'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={saving}
                    className="px-8 bg-hover hover:bg-hover/80 border border-main text-title py-4 rounded-2xl font-bold transition-all disabled:opacity-50"
                  >
                    Mégse
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Notification Modal */}
      <AnimatePresence>
        {isNotificationModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !sendingNotification && setIsNotificationModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-main rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-main flex justify-between items-center bg-hover">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-title">
                  <Bell className="text-blue-500" /> Rendszerértesítés Küldése
                </h2>
                <button onClick={() => setIsNotificationModalOpen(false)} disabled={sendingNotification} className="p-2 hover:bg-hover rounded-full transition-colors text-muted disabled:opacity-50">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Típus</label>
                    <select
                      value={notificationData.type}
                      onChange={(e) => setNotificationData({ ...notificationData, type: e.target.value as 'admin' | 'news' | 'course' })}
                      className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors appearance-none text-sm text-title"
                    >
                      <option value="admin">Rendszerüzenet</option>
                      <option value="news">Hír</option>
                      <option value="course">Kurzus</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Ikon Kiválasztása</label>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {[
                      { id: 'Bell', icon: Bell },
                      { id: 'Megaphone', icon: Megaphone },
                      { id: 'BookOpen', icon: BookOpen },
                      { id: 'Zap', icon: BookOpen },
                      { id: 'ShieldCheck', icon: ShieldCheck },
                      { id: 'AlertCircle', icon: AlertCircle },
                      { id: 'CheckCircle2', icon: CheckCircle2 },
                      { id: 'Clock', icon: BookOpen },
                      { id: 'Plus', icon: Plus },
                      { id: 'ExternalLink', icon: ExternalLink },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setNotificationData({ ...notificationData, icon: item.id })}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                          notificationData.icon === item.id
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                            : 'bg-hover border-main text-muted hover:bg-hover/80'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Értesítés Címe</label>
                  <input
                    type="text"
                    value={notificationData.title}
                    onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="Pl: Karbantartás várható..."
                    className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors text-sm text-title placeholder:text-muted"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Üzenet</label>
                  <textarea
                    value={notificationData.message}
                    onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="Az értesítés részletes tartalma..."
                    className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors min-h-[100px] resize-none text-sm text-title placeholder:text-muted"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Link (opcionális)</label>
                  <input
                    type="text"
                    value={notificationData.link}
                    onChange={(e) => setNotificationData({ ...notificationData, link: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="Pl: /news/1"
                    className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors text-sm text-title placeholder:text-muted"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    onClick={handleSendSystemNotification}
                    disabled={sendingNotification || !notificationData.title || !notificationData.message}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BookOpen className="w-5 h-5" /> {sendingNotification ? 'Küldés...' : 'Értesítés Kiküldése Mindenkinek'}
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
              className="relative w-full max-w-md bg-card border border-main rounded-xl p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="text-red-500 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-center mb-2 text-title">Biztosan törölni szeretnéd?</h2>
              <p className="text-muted text-center mb-8">Ez a művelet nem vonható vissza. A poszt véglegesen törlődik.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 bg-hover hover:bg-hover/80 text-title py-4 rounded-2xl font-bold transition-all"
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
