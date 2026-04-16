/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut,
  X,
  Save,
  Image as ImageIcon,
  Type,
  Calendar,
  Cpu,
  BookOpen,
  Contact2,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Clock,
  Heading1,
  Heading2,
  Code,
  Quote,
  ListOrdered,
  BarChart3,
  Users,
  Lock,
  Smile,
  Bell,
  Megaphone,
  CreditCard,
  Menu
} from 'lucide-react';
import EmojiPickerButton from '../components/EmojiPickerButton';
import AdminSidebar from '../components/AdminSidebar';
import { addNotification } from '../utils/notifications';

// --- Types ---
interface Course {
  id: string;
  title: string;
  level: 'Kezdő' | 'Haladó' | 'Profi';
  category: 'Alapismeretek' | 'Applikáció bemutatók' | 'Üzlet Automatizációk';
  accessType: 'free' | 'premium';
  price?: number;
  date: string;
  description: string;
  imageUrl: string;
  status: 'active' | 'inactive';
  publishDate: string;
  expiryDate: string;
}

// --- Mock Data ---
const INITIAL_COURSES: Course[] = [
  {
    id: '1',
    title: 'Bevezetés a Prompt Engineering világába',
    level: 'Kezdő',
    category: 'Alapismeretek',
    accessType: 'free',
    price: 0,
    date: '2026-04-01',
    description: 'Tanuld meg a leghatékonyabb technikákat a nagy nyelvi modellek irányításához.',
    imageUrl: 'https://picsum.photos/seed/course1/800/600',
    status: 'active',
    publishDate: '2026-04-01',
    expiryDate: ''
  },
  {
    id: '2',
    title: 'AI Üzleti Alkalmazások',
    level: 'Haladó',
    category: 'Üzlet Automatizációk',
    accessType: 'premium',
    price: 14900,
    date: '2026-03-28',
    description: 'Hogyan integráld a mesterséges intelligenciát a vállalati munkafolyamatokba?',
    imageUrl: 'https://picsum.photos/seed/course2/800/600',
    status: 'active',
    publishDate: '2026-03-28',
    expiryDate: ''
  }
];

export default function AdminCourses() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to get current local ISO string for datetime-local
  const getLocalISOString = (date: Date = new Date()) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16);
  };

  // Form State
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
    expiryDate: ''
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
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleOpenModal = (course?: Course) => {
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
        expiryDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...formData } as Course : c));
    } else {
      const maxId = courses.reduce((max, c) => {
        const idNum = parseInt(c.id);
        return isNaN(idNum) ? max : Math.max(max, idNum);
      }, 0);
      
      const newCourse: Course = {
        ...formData,
        id: (maxId + 1).toString(),
        date: new Date().toISOString().split('T')[0]
      } as Course;
      setCourses([newCourse, ...courses]);

      // Trigger notification
      addNotification({
        userId: 'all',
        type: 'course',
        title: 'Új kurzus elérhető!',
        message: newCourse.title,
        link: `/tudastar/${newCourse.id}`
      });
    }
    handleCloseModal();
  };

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setCourseToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      setCourses(courses.filter(c => c.id !== courseToDelete));
      setIsDeleteConfirmOpen(false);
      setCourseToDelete(null);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  };

  return (
    <div className="min-h-screen bg-main text-body flex font-sans transition-colors duration-300">
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
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-20 border-b border-main bg-glass backdrop-blur-md flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-hover rounded-xl transition-colors md:hidden text-muted hover:text-title"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-title truncate">Tudástár</h1>
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
                onFocus={(e) => { setSearchTerm(''); e.target.select(); }}
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

        {/* Table Container */}
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-card rounded-3xl overflow-hidden shadow-xl border-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-hover border-b border-main">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Cím</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Modul</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Szint</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Ár</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Státusz</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Időzítés</th>
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
                    <td className="px-6 py-4 text-sm text-muted font-mono">{course.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-hover shrink-0">
                          <img src={course.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="font-medium text-title">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-blue-500 font-medium">{course.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        course.level === 'Kezdő' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                        course.level === 'Haladó' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                        'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                      }`}>
                        {course.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-title">
                        {course.price ? `${course.price.toLocaleString()} Ft` : 'Ingyenes'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {course.status === 'active' ? (
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
                          <span>Publikálás: {course.publishDate}</span>
                        </div>
                        {course.expiryDate && (
                          <div className="flex items-center gap-1.5 text-[10px] text-muted">
                            <X className="w-3 h-3 text-red-500" />
                            <span>Lejárat: {course.expiryDate}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(course)}
                          className="p-2 rounded-lg hover:bg-blue-500/10 text-muted hover:text-blue-500 transition-all"
                          title="Szerkesztés"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(course.id)}
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
            {filteredCourses.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-hover rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-muted w-8 h-8" />
                </div>
                <p className="text-muted">Nem található a keresésnek megfelelő kurzus.</p>
              </div>
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
              className="relative w-full max-w-2xl bg-card border border-main rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-main flex justify-between items-center bg-hover">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-title">
                  {editingCourse ? <Edit2 className="text-blue-500" /> : <Plus className="text-blue-500" />}
                  {editingCourse ? 'Kurzus Szerkesztése' : 'Új Kurzus Létrehozása'}
                </h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-card rounded-full transition-colors text-muted hover:text-title">
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
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    onFocus={(e) => { const t = e.target; setTimeout(() => t.select(), 0); }}
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
                          price: newAccessType === 'free' ? 0 : (formData.price || 0)
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
                      value={formData.price}
                      onChange={(e) => {
                        const newPrice = parseInt(e.target.value) || 0;
                        setFormData({ 
                          ...formData, 
                          price: newPrice,
                          accessType: newPrice > 0 ? 'premium' : formData.accessType
                        });
                      }}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.currentTarget.select()}
                      placeholder="0"
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Publikálás dátuma és ideje
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.publishDate}
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
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-card shrink-0">
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
                          <div className="flex items-center gap-3 text-muted">
                            <ImageIcon className="w-5 h-5" />
                            <span>Kattints a kép feltöltéséhez</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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
                      value={formData.description}
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
              className="relative w-full max-w-md bg-card border border-main rounded-[2rem] p-8 shadow-2xl"
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
