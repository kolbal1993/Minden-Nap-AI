/**
 * Admin News Page — Hírek kezelése
 * JAVÍTÁS (2026-07-14, Balázs "új hír felrakásakor TÖKÉLETESEN jelenjen meg"):
 * Ahol Balázs (és a jövőbeli adminok) új híreket tudnak felrakni a Firestore-ba.
 * - Form: title, excerpt, content, category, author, image URL, readTime
 * - Firestore POST: 'posts' collection, numeric ID auto-generálás
 * - Auto-publish date: ISO 8601 (YYYY-MM-DD)
 * - Státusz: 'active' (látható) VAGY 'inactive' (rejtett)
 * - A Vercel deployment után azonnal megjelenik a /hirek és /news oldalon
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit, Eye, EyeOff, Save, X, Calendar, User, Tag, FileText, Image as ImageIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

interface NewsFormData {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  imageUrl: string;
  readTime: string;
  status: 'active' | 'inactive';
}

const CATEGORIES = ['Generatív AI', 'Üzleti Automatizáció', 'AI eszközök', 'Szabályozás'];

const EMPTY_FORM: NewsFormData = {
  title: '',
  excerpt: '',
  content: '',
  category: 'Generatív AI',
  author: 'Admin',
  imageUrl: '',
  readTime: '5 perc',
  status: 'active',
};

export default function AdminNewsPage() {
  const { data: postsData, loading } = useFirestoreCollection('posts', {
    realtime: true,
    orderBy: 'publishDate',
    max: 500,
  });

  // Deduplikáció (slug + numeric alias)
  const dedup = <T extends { title: string; publishDate?: string }>(items: T[]): T[] => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = `${item.title}|${item.publishDate || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const POSTS = dedup((postsData ?? []).map((p: any) => ({
    ...p,
    id: String(p.id || ''),
  }))).sort((a, b) => {
    const da = a.publishDate || '';
    const db_ = b.publishDate || '';
    return db_.localeCompare(da); // descending
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewsFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEdit = (post: any) => {
    setFormData({
      id: post.id,
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || 'Generatív AI',
      author: post.author || 'Admin',
      imageUrl: post.imageUrl || '',
      readTime: post.readTime || '5 perc',
      status: post.status || 'active',
    });
    setEditingId(post.id);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      setMessage({ type: 'error', text: 'Cím, kivonat és tartalom KÖTELEZŐ!' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      // Auto-generate numeric ID
      const numericId = String(Date.now()); // epoch ms as string
      const slugId = `post_${formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`;

      const payload = {
        id: numericId,
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category,
        author: formData.author.trim() || 'Admin',
        imageUrl: formData.imageUrl.trim() || `https://picsum.photos/seed/${slugId}/1200/600`,
        readTime: formData.readTime.trim() || '5 perc',
        status: formData.status,
        publishDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 1. Numeric ID doc (backward compat)
      await setDoc(doc(db, 'posts', numericId), payload);
      // 2. Slug ID alias (admin panelen a slug alapján)
      await setDoc(doc(db, 'posts', slugId), { ...payload, id: numericId });

      setMessage({ type: 'success', text: `✅ Hír sikeresen ${editingId ? 'frissítve' : 'létrehozva'}: ${formData.title.substring(0, 50)}` });
      closeForm();
    } catch (err: any) {
      console.error('[AdminNewsPage] Submit error:', err);
      setMessage({ type: 'error', text: `❌ Hiba: ${err.message || 'Ismeretlen hiba'}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Biztosan törlöd a(z) "${title}" hírt? (ID: ${id})`)) return;
    try {
      await deleteDoc(doc(db, 'posts', id));
      setMessage({ type: 'success', text: `✅ Hír törölve: ${title}` });
    } catch (err: any) {
      setMessage({ type: 'error', text: `❌ Törlési hiba: ${err.message}` });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, 'posts', id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setMessage({ type: 'success', text: `✅ Státusz: ${newStatus === 'active' ? '🟢 Aktív' : '⚪ Inaktív'}` });
    } catch (err: any) {
      setMessage({ type: 'error', text: `❌ Státusz hiba: ${err.message}` });
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-body font-sans">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tighter mb-2 text-title">
                Hírek <span className="text-blue-600">Kezelése</span>
              </h1>
              <p className="text-body">Új hír létrehozása, szerkesztése, törlése</p>
            </div>
            <button
              onClick={openCreate}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-5 h-5" /> Új Hír
            </button>
          </div>

          {/* Message banner */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mb-6 p-4 rounded-2xl border ${
                  message.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Posts list */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-main rounded-2xl p-6 animate-pulse">
                  <div className="h-6 bg-hover rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-hover rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : POSTS.length === 0 ? (
            <div className="bg-card border border-main rounded-2xl p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted" />
              <h3 className="text-2xl font-bold mb-2 text-title">Még nincsenek hírek</h3>
              <p className="text-body mb-6">Kattints az "Új Hír" gombra az első hír létrehozásához</p>
              <button
                onClick={openCreate}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Új Hír
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {POSTS.map((post) => (
                <div
                  key={post.id}
                  className="bg-card border border-main rounded-2xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-24 h-24 object-cover rounded-xl shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-600">
                          {post.category || 'N/A'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          post.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-600'
                            : 'bg-gray-500/20 text-gray-600'
                        }`}>
                          {post.status === 'active' ? '🟢 Aktív' : '⚪ Inaktív'}
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {post.publishDate || 'N/A'}
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1">
                          <User className="w-3 h-3" /> {post.author || 'N/A'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-title mb-1 line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-body line-clamp-2">{post.excerpt}</p>
                      <p className="text-xs text-muted mt-1">ID: {post.id}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(post)}
                        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 transition-colors"
                        title="Szerkesztés"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(post.id, post.status)}
                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition-colors"
                        title={post.status === 'active' ? 'Inaktívvá tesz' : 'Aktívvá tesz'}
                      >
                        {post.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors"
                        title="Törlés"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form modal */}
          <AnimatePresence>
            {isFormOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                onClick={closeForm}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-card border border-main rounded-2xl p-8 max-w-3xl w-full my-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-title">
                      {editingId ? 'Hír szerkesztése' : 'Új hír létrehozása'}
                    </h2>
                    <button onClick={closeForm} className="p-2 rounded-lg hover:bg-hover">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-1 text-title">Cím *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-input border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        placeholder="Pl. A GPT-5 fejlesztése új mérföldkőhöz érkezett"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-1 text-title">Kivonat *</label>
                      <textarea
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        className="w-full bg-input border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        placeholder="Rövid összefoglaló (2-3 mondat)"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-1 text-title">Tartalom *</label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full bg-input border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-mono text-sm"
                        placeholder="A teljes cikk tartalma (markdown támogatott)"
                        rows={10}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold mb-1 text-title">Kategória</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full bg-input border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1 text-title">Szerző</label>
                        <input
                          type="text"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          className="w-full bg-input border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                          placeholder="Pl. Kovács János"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold mb-1 text-title">Kép URL (opcionális)</label>
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="w-full bg-input border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                          placeholder="https://... (üresen hagyva random kép generálódik)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1 text-title">Olvasási idő</label>
                        <input
                          type="text"
                          value={formData.readTime}
                          onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                          className="w-full bg-input border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                          placeholder="Pl. 5 perc"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-1 text-title">Státusz</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                        className="w-full bg-input border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                      >
                        <option value="active">🟢 Aktív (megjelenik a /hirek oldalon)</option>
                        <option value="inactive">⚪ Inaktív (rejtett, csak itt látszik)</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Mentés...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {editingId ? 'Frissítés' : 'Létrehozás'}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={closeForm}
                        className="px-6 py-3 rounded-2xl font-bold bg-hover hover:bg-input border border-main"
                      >
                        Mégse
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Helper: setDoc import
import { setDoc } from 'firebase/firestore';
