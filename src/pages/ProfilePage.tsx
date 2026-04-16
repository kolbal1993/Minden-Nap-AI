/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EmojiPickerButton from '../components/EmojiPickerButton';
import { 
  User, 
  Mail, 
  Building2, 
  Briefcase, 
  FileText, 
  Camera, 
  Save, 
  CheckCircle2,
  Bookmark,
  ArrowRight,
  Clock,
  Calendar,
  Zap,
  Crown,
  Edit3,
  X,
  PlayCircle,
  BookOpen
} from 'lucide-react';
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { NEWS_ITEMS } from '../constants/news';
import { COURSES } from '../constants/courses';
import { AnimatePresence } from 'motion/react';
import SecuritySettings from '../components/SecuritySettings';

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: 'Kovács János',
    email: 'admin@mindennapai.hu', // Fixed
    company: 'AI Solutions Kft.',
    profession: 'AI Tanácsadó',
    bio: 'Szenvedélyem a mesterséges intelligencia és annak gyakorlati alkalmazása a mindennapi üzleti folyamatokban.',
    avatar: 'https://picsum.photos/seed/user123/200/200',
    isPremium: true,
    is2FAEnabled: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedNews, setSavedNews] = useState<any[]>([]);
  const [startedCourses, setStartedCourses] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempFormData, setTempFormData] = useState(formData);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Load profile from Firestore
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          const profile = {
            name: data.displayName || user.displayName || 'Anonymous',
            email: user.email || '',
            company: data.company || '',
            profession: data.profession || '',
            bio: data.bio || '',
            avatar: data.photoURL || user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
            isPremium: data.isPremium || false,
            is2FAEnabled: data.is2FAEnabled || false
          };
          setFormData(profile);
          setTempFormData(profile);
        } else {
          // Fallback to auth data
          const profile = {
            name: user.displayName || 'Anonymous',
            email: user.email || '',
            company: '',
            profession: '',
            bio: '',
            avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
            isPremium: false,
            is2FAEnabled: false
          };
          setFormData(profile);
          setTempFormData(profile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    });

    // Load saved news
    const savedNewsIds = JSON.parse(localStorage.getItem('user_saved_news') || '[]');
    const filteredSavedNews = NEWS_ITEMS.filter(item => savedNewsIds.includes(item.id));
    setSavedNews(filteredSavedNews);

    // Mock started courses
    const mockStartedCourses = [
      {
        courseId: '1',
        progress: 65,
        completedModules: 5,
        totalModules: 8,
        lastAccessed: '2026-04-03'
      },
      {
        courseId: '2',
        progress: 25,
        completedModules: 3,
        totalModules: 12,
        lastAccessed: '2026-04-04'
      }
    ];
    
    const enrichedCourses = mockStartedCourses.map(sc => {
      const courseInfo = COURSES.find(c => c.id === sc.courseId);
      return { ...sc, ...courseInfo };
    });
    setStartedCourses(enrichedCourses);

    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setIsSaving(true);

    try {
      // Update Auth Profile
      await updateProfile(auth.currentUser, {
        displayName: tempFormData.name,
        photoURL: tempFormData.avatar
      });

      // Update Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        displayName: tempFormData.name,
        photoURL: tempFormData.avatar,
        company: tempFormData.company,
        profession: tempFormData.profession,
        bio: tempFormData.bio,
        isPremium: tempFormData.isPremium,
        is2FAEnabled: tempFormData.is2FAEnabled,
        lastSeen: serverTimestamp()
      }, { merge: true });

      setFormData(tempFormData);
      localStorage.setItem('userProfile', JSON.stringify(tempFormData));
      setIsSaving(false);
      setShowSuccess(true);
      setIsEditing(false);
      
      window.dispatchEvent(new Event('storage'));
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempFormData({ ...tempFormData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-body font-sans selection:bg-blue-500/30 transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <h1 className="text-4xl font-bold tracking-tighter mb-2 text-title">Saját Profil</h1>
              <p className="text-body">Tekintsd meg adataidat és elmentett híreidet.</p>
            </div>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Sikeresen mentve!
              </motion.div>
            )}
          </motion.div>

          <div className="space-y-8">
            {/* Profile Header Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border-none rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-2xl transition-colors duration-300"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -z-10" />
              
              <div className="relative shrink-0">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-main shadow-2xl relative">
                  <img 
                    src={formData.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {formData.isPremium && (
                    <div className="absolute bottom-1 right-1 bg-gradient-to-br from-orange-400 to-orange-600 p-2.5 rounded-full border-4 border-card shadow-lg z-10">
                      <Zap className="w-5 h-5 text-white fill-current" />
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center md:text-left flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h2 className="text-3xl font-bold tracking-tight text-title">{formData.name}</h2>
                  {formData.isPremium && (
                    <div className="flex justify-center md:justify-start">
                      <span className="bg-orange-600/20 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-500/20 flex items-center gap-1.5">
                        <Zap className="w-3 h-3 fill-current" /> Prémium Tag
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-6 text-body">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{formData.email}</span>
                  </div>
                  {formData.company && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">{formData.company}</span>
                    </div>
                  )}
                  {formData.profession && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">{formData.profession}</span>
                    </div>
                  )}
                </div>

                <p className="text-body leading-relaxed max-w-xl mx-auto md:mx-0">
                  {formData.bio || 'Nincs megadott bemutatkozás.'}
                </p>

                <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <button 
                    onClick={() => {
                      setTempFormData(formData);
                      setIsEditing(true);
                    }}
                    className="bg-title text-bg-main px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-hover transition-all shadow-xl group"
                  >
                    <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Profil szerkesztése
                  </button>
                  
                  <button 
                    onClick={() => {
                      const newPremiumStatus = !formData.isPremium;
                      const newFormData = { ...formData, isPremium: newPremiumStatus };
                      setFormData(newFormData);
                      setTempFormData(newFormData);
                      localStorage.setItem('userProfile', JSON.stringify(newFormData));
                      window.dispatchEvent(new Event('storage'));
                    }}
                    className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all border ${
                      formData.isPremium 
                        ? 'border-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/5' 
                        : 'border-main text-muted hover:bg-hover'
                    }`}
                  >
                    <Crown className="w-4 h-4" /> {formData.isPremium ? 'Prémium lemondása' : 'Váltás Prémiumra'}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Security Settings Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <SecuritySettings />
            </motion.div>
          </div>

          {/* Edit Modal */}
          <AnimatePresence>
            {isEditing && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsEditing(false)}
                  className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                  <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <h2 className="text-2xl font-bold tracking-tight">Profil szerkesztése</h2>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSave} className="p-8 md:p-10 space-y-8 overflow-y-auto custom-scrollbar">
                    {/* Avatar Edit */}
                    <div className="flex flex-col items-center gap-6 pb-8 border-b border-white/5">
                      <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/30 group-hover:border-blue-500 transition-all relative shadow-2xl">
                          <img 
                            src={tempFormData.avatar} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white w-8 h-8" />
                          </div>
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          className="hidden" 
                          accept="image/*"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-400 dark:text-gray-200">Kattints a képre a feltöltéshez</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Ajánlott: 400x400px, JPG vagy PNG</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <User className="w-3 h-3" /> Teljes név
                        </label>
                        <input 
                          type="text" 
                          value={tempFormData.name}
                          onChange={(e) => setTempFormData({ ...tempFormData, name: e.target.value })}
                          onFocus={(e) => e.target.select()}
                          onClick={(e) => e.currentTarget.select()}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2 opacity-60">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Mail className="w-3 h-3" /> E-mail cím
                        </label>
                        <input 
                          type="email" 
                          value={tempFormData.email}
                          disabled
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Building2 className="w-3 h-3" /> Cégnév
                        </label>
                        <input 
                          type="text" 
                          value={tempFormData.company}
                          onChange={(e) => setTempFormData({ ...tempFormData, company: e.target.value })}
                          onFocus={(e) => e.target.select()}
                          onClick={(e) => e.currentTarget.select()}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Briefcase className="w-3 h-3" /> Foglalkozás
                        </label>
                        <input 
                          type="text" 
                          value={tempFormData.profession}
                          onChange={(e) => setTempFormData({ ...tempFormData, profession: e.target.value })}
                          onFocus={(e) => e.target.select()}
                          onClick={(e) => e.currentTarget.select()}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <FileText className="w-3 h-3" /> Rövid bemutatkozás
                        </label>
                        <div className="relative">
                          <textarea 
                            rows={4}
                            value={tempFormData.bio}
                            onChange={(e) => setTempFormData({ ...tempFormData, bio: e.target.value })}
                            onFocus={(e) => e.target.select()}
                            onClick={(e) => e.currentTarget.select()}
                            placeholder="Írj pár szót magadról..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-12 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                          />
                          <div className="absolute right-3 bottom-3">
                            <EmojiPickerButton 
                              onEmojiSelect={(emoji) => setTempFormData({ ...tempFormData, bio: tempFormData.bio + emoji })} 
                            />
                          </div>
                        </div>
                      </div>

                    <div className="pt-4 flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all"
                      >
                        Mégse
                      </button>
                      <button 
                        type="submit"
                        disabled={isSaving}
                        className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                      >
                        {isSaving ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Mentés <Save className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Started Courses Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <PlayCircle className="text-blue-500 w-6 h-6" /> Elkezdett Kurzusok
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-300 font-medium">{startedCourses.length} kurzus</span>
            </div>

            {startedCourses.length > 0 ? (
              <div className="grid gap-6">
                {startedCourses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/tudastar/${course.id}`}
                    className="block"
                  >
                    <motion.div
                      layout
                      className="group bg-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all flex flex-col sm:flex-row shadow-xl h-full"
                    >
                      <div className="w-full sm:w-48 h-48 sm:h-auto overflow-hidden shrink-0">
                        <img 
                          src={course.imageUrl} 
                          alt={course.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-6 flex flex-col justify-center flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-4 text-[10px] text-gray-700 dark:text-gray-100 uppercase tracking-widest font-bold">
                            <span className="text-blue-400">{course.category}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Utoljára: {course.lastAccessed}</span>
                          </div>
                          <span className="text-blue-400 font-bold text-sm">{course.progress}%</span>
                        </div>
                        
                        <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors mb-4">
                          {course.title}
                        </h3>

                        <div className="space-y-3">
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${course.progress}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-100">
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" /> {course.completedModules} / {course.totalModules} modul kész
                            </span>
                            <span className="flex items-center gap-1 group-hover:text-blue-400 transition-colors">
                              Folytatás <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayCircle className="text-gray-600 w-8 h-8" />
                </div>
                <p className="text-gray-500 dark:text-gray-300 mb-6">Még nem kezdtél el egy kurzust sem.</p>
                <Link to="/courses" className="text-blue-400 font-bold hover:underline">
                  Fedezd fel a Tudástárat
                </Link>
              </div>
            )}
          </motion.div>

          {/* Saved News Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Bookmark className="text-blue-500 w-6 h-6" /> Elmentett Hírek
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-300 font-medium">{savedNews.length} bejegyzés</span>
            </div>

            {savedNews.length > 0 ? (
              <div className="grid gap-6">
                {savedNews.map((news) => (
                  <Link
                    key={news.id}
                    to={`/news/${news.id}`}
                    className="block"
                  >
                    <motion.div
                      layout
                      className="group bg-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all flex flex-col sm:flex-row shadow-xl h-full"
                    >
                      <div className="w-full sm:w-48 h-48 sm:h-auto overflow-hidden shrink-0">
                        <img 
                          src={news.imageUrl} 
                          alt={news.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-6 flex flex-col justify-center flex-1">
                        <div className="flex items-center gap-4 text-[10px] text-gray-700 dark:text-gray-100 mb-3 uppercase tracking-widest font-bold">
                          <span className="text-blue-400">{news.category}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {news.date}</span>
                        </div>
                        <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors line-clamp-2">
                          {news.title}
                        </h3>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="text-gray-600 w-8 h-8" />
                </div>
                <p className="text-gray-500 dark:text-gray-300 mb-6">Még nincsenek elmentett híreid.</p>
                <Link to="/news" className="text-blue-400 font-bold hover:underline">
                  Böngéssz a hírek között
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
