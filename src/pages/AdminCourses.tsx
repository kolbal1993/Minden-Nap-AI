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
  Lock
} from 'lucide-react';

// --- Types ---
interface Course {
  id: string;
  title: string;
  level: 'Kezdő' | 'Haladó' | 'Profi';
  accessType: 'free' | 'premium';
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
    accessType: 'free',
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
    accessType: 'premium',
    date: '2026-03-28',
    description: 'Hogyan integráld a mesterséges intelligenciát a vállalati munkafolyamatokba?',
    imageUrl: 'https://picsum.photos/seed/course2/800/600',
    status: 'active',
    publishDate: '2026-03-28',
    expiryDate: ''
  }
];

export default function AdminCourses() {
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
    accessType: 'free',
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
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  };

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
          <h1 className="text-xl font-bold">Tudástár Kezelése</h1>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Keresés..." 
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Új elem
            </button>
          </div>
        </header>

        {/* Table Container */}
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Cím</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Szint</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Státusz</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Időzítés</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Műveletek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCourses.map((course) => (
                  <tr 
                    key={course.id} 
                    onClick={() => handleOpenModal(course)}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{course.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 shrink-0">
                          <img src={course.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="font-medium text-gray-200">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        course.level === 'Kezdő' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        course.level === 'Haladó' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                        'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {course.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {course.status === 'active' ? (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-400/10 px-2 py-1 rounded-md border border-green-400/20">
                            <Eye className="w-3 h-3" /> Aktív
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                            <EyeOff className="w-3 h-3" /> Inaktív
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                          <Clock className="w-3 h-3 text-blue-400" />
                          <span>Publikálás: {course.publishDate}</span>
                        </div>
                        {course.expiryDate && (
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                            <X className="w-3 h-3 text-red-400" />
                            <span>Lejárat: {course.expiryDate}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(course)}
                          className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition-all"
                          title="Szerkesztés"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
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
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-600 w-8 h-8" />
                </div>
                <p className="text-gray-500">Nem található a keresésnek megfelelő kurzus.</p>
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
              className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#151515]">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  {editingCourse ? <Edit2 className="text-blue-500" /> : <Plus className="text-blue-500" />}
                  {editingCourse ? 'Kurzus Szerkesztése' : 'Új Kurzus Létrehozása'}
                </h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Type className="w-4 h-4" /> Cím
                  </label>
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="A kurzus címe..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Szint
                    </label>
                    <select 
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option value="Kezdő">Kezdő</option>
                      <option value="Haladó">Haladó</option>
                      <option value="Profi">Profi</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Státusz
                    </label>
                    <div className="flex items-center gap-4 h-[58px]">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'active' })}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border transition-all ${
                          formData.status === 'active' 
                            ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                            : 'bg-white/5 border-white/10 text-gray-500'
                        }`}
                      >
                        <Eye className="w-4 h-4" /> Aktív
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'inactive' })}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border transition-all ${
                          formData.status === 'inactive' 
                            ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                            : 'bg-white/5 border-white/10 text-gray-500'
                        }`}
                      >
                        <EyeOff className="w-4 h-4" /> Inaktív
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Publikálás dátuma és ideje
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.publishDate}
                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <X className="w-4 h-4" /> Lejárat dátuma és ideje
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
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
                      <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 group-hover/upload:border-blue-500/50 transition-colors overflow-hidden">
                        {formData.imageUrl ? (
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 shrink-0">
                              <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm text-gray-400 truncate flex-1">Kép kiválasztva</span>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData({ ...formData, imageUrl: '' });
                              }}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-gray-500">
                            <ImageIcon className="w-5 h-5" />
                            <span>Kattints a kép feltöltéséhez</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Hozzáférés
                    </label>
                    <select 
                      value={formData.accessType}
                      onChange={(e) => setFormData({ ...formData, accessType: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option value="free">Ingyenes</option>
                      <option value="premium">Prémium</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Leírás
                  </label>
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-white/5 flex-wrap">
                      <button type="button" onClick={() => insertText('# ', '')} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title="Címsor 1"><Heading1 className="w-4 h-4" /></button>
                      <button type="button" onClick={() => insertText('## ', '')} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title="Címsor 2"><Heading2 className="w-4 h-4" /></button>
                      <div className="w-px h-5 bg-white/10 mx-1" />
                      <button type="button" onClick={() => insertText('**', '**')} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title="Félkövér"><Bold className="w-4 h-4" /></button>
                      <button type="button" onClick={() => insertText('*', '*')} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title="Dőlt"><Italic className="w-4 h-4" /></button>
                      <div className="w-px h-5 bg-white/10 mx-1" />
                      <button type="button" onClick={() => insertText('- ', '')} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title="Lista"><List className="w-4 h-4" /></button>
                      <button type="button" onClick={() => insertText('1. ', '')} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title="Számozott lista"><ListOrdered className="w-4 h-4" /></button>
                      <div className="w-px h-5 bg-white/10 mx-1" />
                      <button type="button" onClick={() => insertText('> ', '')} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title="Idézet"><Quote className="w-4 h-4" /></button>
                      <button type="button" onClick={() => insertText('`', '`')} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title="Kód"><Code className="w-4 h-4" /></button>
                      <button type="button" onClick={() => insertText('[', '](url)')} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title="Link"><LinkIcon className="w-4 h-4" /></button>
                    </div>
                    <textarea 
                      ref={textareaRef}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Írd ide a kurzus leírását (Markdown támogatott)..."
                      className="w-full bg-transparent px-5 py-4 focus:outline-none min-h-[250px] resize-none text-gray-300 leading-relaxed font-mono text-sm"
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
                    className="px-8 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-2xl font-bold transition-all"
                  >
                    Mégse
                  </button>
                </div>
              </form>
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
