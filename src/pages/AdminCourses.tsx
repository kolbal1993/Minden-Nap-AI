/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AdminCourses — Real Firestore `courses` collection CRUD.
 * No localStorage, no INITIAL_COURSES mock.
 */

import { useState, FormEvent, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  LayoutDashboard,
  FileText,
  X,
  Save,
  Image as ImageIcon,
  Type,
  Eye,
  EyeOff,
  Clock,
  Heading1,
  Heading2,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Quote,
  Code,
  ListOrdered,
  BookOpen,
  Lock,
  CreditCard,
  Menu,
  Database,
} from 'lucide-react';
import EmojiPickerButton from '../components/EmojiPickerButton';
import AdminSidebar from '../components/AdminSidebar';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// --- Types ---
interface Course {
  id: string;
  title: string;
  level: 'Kezdő' | 'Haladó' | 'Profi';
  category: 'Alapismeretek' | 'Applikáció bemutatók' | 'Üzlet Automatizációk';
  accessType: 'free' | 'premium';
  price?: number;
  description: string;
  imageUrl?: string;
  status: 'active' | 'inactive';
  publishDate?: string;
  expiryDate?: string;
  createdAt?: any;
}

export default function AdminCourses() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    data: coursesRaw,
    loading,
    error,
  } = useFirestoreCollection('courses', { orderBy: 'createdAt', max: 500 });

  const courses: Course[] = useMemo(() => coursesRaw as unknown as Course[], [coursesRaw]);

  const getLocalISOString = (date: Date = new Date()) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    level: 'Kezdő',
    category: 'Alapismeretek',
    accessType: 'free',
    price: 0,
    description: '',
    imageUrl: '',
    status: 'active',
    publishDate: getLocalISOString(),
    expiryDate: '',
  });

  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    setFormData({ ...formData, description: newText });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleOpenModal = (course?: Course) => {
    setActionError(null);
    if (course) {
      setEditingCourse(course);
      setFormData(course);
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        level: 'Kezdő',
        category: 'Alapismeretek',
        accessType: 'free',
        description: '',
        imageUrl: '',
        status: 'active',
        publishDate: getLocalISOString(),
        expiryDate: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'courses'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      handleCloseModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setActionError(message);
    }
  };

  const handleDeleteClick = (id: string) => {
    setCourseToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    setActionError(null);
    try {
      await deleteDoc(doc(db, 'courses', courseToDelete));
      setIsDeleteConfirmOpen(false);
      setCourseToDelete(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  const filteredCourses = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return courses.filter(
      (c) =>
        (c.title || '').toLowerCase().includes(term) ||
        (c.level || '').toLowerCase().includes(term) ||
        (c.category || '').toLowerCase().includes(term),
    );
  }, [courses, searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  };

  return (
    <div className="min-h-screen bg-main text-body flex font-sans transition-colors duration-300">
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

      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-20 border-b border-main bg-glass backdrop-blur-md flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-hover rounded-xl transition-colors md:hidden text-muted hover:text-title"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-title truncate">Tudástár</h1>
            <span className="hidden sm:flex items-center gap-2 text-xs text-muted">
              <Database className="w-3.5 h-3.5" /> Firestore: {courses.length} kurzus
            </span>
            <button
              onClick={() => handleOpenModal()}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" /> Új elem
            </button>
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
                onFocus={(e) => {
                  setSearchTerm('');
                  e.target.select();
                }}
                onClick={(e) => e.currentTarget.select()}
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="sm:hidden bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {actionError && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 text-sm">
              Hiba: {actionError}
            </div>
          )}

          <div className="bg-card rounded-3xl overflow-hidden shadow-xl border-none">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-500">Hiba: {error.message}</div>
            ) : filteredCourses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title={searchTerm ? 'Nincs találat' : 'Még nincsenek kurzusok'}
                description={
                  searchTerm
                    ? 'Próbálj más keresési feltételt.'
                    : 'Hozd létre az első kurzust a Tudástár feltöltéséhez.'
                }
                cta={
                  searchTerm
                    ? undefined
                    : { label: 'Új kurzus', onClick: () => handleOpenModal(), icon: Plus }
                }
              />
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-hover border-b border-main">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Cím</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Modul</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Szint</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Ár</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Státusz</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-right">Műveletek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-main">
                  {filteredCourses.map((course) => (
                    <tr
                      key={course.id}
                      onClick={() => handleOpenModal(course)}
                      className="hover:bg-hover transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-hover shrink-0">
                            {course.imageUrl ? (
                              <img src={course.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted">
                                <BookOpen className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-title line-clamp-1">{course.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-blue-600 font-medium">{course.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            course.level === 'Kezdő'
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                              : course.level === 'Haladó'
                                ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                                : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                          }`}
                        >
                          {course.level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-title">
                          {course.price && course.price > 0
                            ? `${course.price.toLocaleString()} Ft`
                            : 'Ingyenes'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {course.status === 'active' ? (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20 w-fit">
                            <Eye className="w-3 h-3" /> Aktív
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted bg-hover px-2 py-1 rounded-md border border-main w-fit">
                            <EyeOff className="w-3 h-3" /> Inaktív
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(course);
                            }}
                            className="p-2 rounded-lg hover:bg-blue-500/10 text-muted hover:text-blue-600 transition-all"
                            title="Szerkesztés"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(course.id);
                            }}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-all"
                            title="Törlés"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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
              onClick={handleCloseModal}
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
                  {editingCourse ? <Edit2 className="text-blue-600" /> : <Plus className="text-blue-600" />}
                  {editingCourse ? 'Kurzus Szerkesztése' : 'Új Kurzus Létrehozása'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-card rounded-full transition-colors text-muted hover:text-title"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-8 space-y-6 max-h-[70vh] overflow-auto custom-scrollbar"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                    <Type className="w-4 h-4" /> Cím
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    onFocus={(e) => {
                      const t = e.target;
                      setTimeout(() => t.select(), 0);
                    }}
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="A kurzus címe..."
                    className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Modul
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none text-title"
                    >
                      <option value="Alapismeretek">Alapismeretek</option>
                      <option value="Applikáció bemutatók">Applikáció bemutatók</option>
                      <option value="Üzlet Automatizációk">Üzlet Automatizációk</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Szint
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none text-title"
                    >
                      <option value="Kezdő">Kezdő</option>
                      <option value="Haladó">Haladó</option>
                      <option value="Profi">Profi</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Hozzáférés
                    </label>
                    <select
                      value={formData.accessType}
                      onChange={(e) => {
                        const newAccessType = e.target.value as any;
                        setFormData({
                          ...formData,
                          accessType: newAccessType,
                          price: newAccessType === 'free' ? 0 : formData.price || 0,
                        });
                      }}
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none text-title"
                    >
                      <option value="free">Ingyenes</option>
                      <option value="premium">Prémium</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Ár (Ft)
                    </label>
                    <input
                      type="number"
                      value={formData.price || 0}
                      onChange={(e) => {
                        const newPrice = parseInt(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          price: newPrice,
                          accessType: newPrice > 0 ? 'premium' : formData.accessType,
                        });
                      }}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.currentTarget.select()}
                      placeholder="0"
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Kép URL (opcionális)
                  </label>
                  <input
                    type="text"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="https://..."
                    className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Leírás
                  </label>
                  <div className="bg-hover border border-main rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-1 p-2 border-b border-main bg-card flex-wrap">
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
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.currentTarget.select()}
                      placeholder="Írd ide a kurzus leírását (Markdown támogatott)..."
                      className="w-full bg-transparent px-5 py-4 focus:outline-none min-h-[250px] resize-none text-body leading-relaxed font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                  >
                    <Save className="w-5 h-5" /> {editingCourse ? 'Módosítások mentése' : 'Kurzus közzététele'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-8 bg-hover hover:bg-hover/80 border border-main text-title py-4 rounded-2xl font-bold transition-all"
                  >
                    Mégse
                  </button>
                </div>
              </form>
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
              <p className="text-muted text-center mb-8">Ez a művelet nem vonható vissza. A kurzus véglegesen törlődik.</p>
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
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}