/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Search, 
  BookOpen, 
  Clock, 
  Star, 
  BarChart, 
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Zap,
  Crown
} from 'lucide-react';
import { COURSES } from '../constants/courses';
import PurchaseModal from '../components/PurchaseModal';
import { useEffect } from 'react';

const CATEGORIES = ['Összes', 'Alapok', 'Technológia', 'Üzlet', 'Fejlesztés'];

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Összes');
  const [isPremium, setIsPremium] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const updatePremiumStatus = () => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setIsPremium(profile.isPremium || false);
      }
    };

    updatePremiumStatus();
    
    const handleStorageChange = () => {
      updatePremiumStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handlePurchaseSuccess = (premiumPurchased: boolean) => {
    if (premiumPurchased) {
      setIsPremium(true);
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const filteredCourses = COURSES.filter(course => {
    const now = new Date();
    const publishDate = (course as any).publishDate ? new Date((course as any).publishDate) : null;
    const expiryDate = (course as any).expiryDate ? new Date((course as any).expiryDate) : null;

    // Status check
    if ((course as any).status === 'inactive') return false;

    // Scheduling check
    if (publishDate && publishDate > now) return false;
    if (expiryDate && expiryDate < now) return false;

    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Összes' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-transparent text-gray-100 font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold tracking-tighter mb-6"
            >
              Tanulj az <span className="text-blue-500">AI Jövőjéről</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 max-w-2xl"
            >
              Válogass szakértők által összeállított kurzusaink közül, és szerezz piacképes tudást a mesterséges intelligenciát területén.
            </motion.p>
          </div>

          {/* Premium Banner for non-premium users */}
          {!isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12 p-8 rounded-[2.5rem] bg-gradient-to-r from-orange-600/20 via-orange-500/10 to-transparent border border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-orange-600/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Crown className="text-orange-500 w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Minden kurzus egyetlen előfizetéssel?</h2>
                  <p className="text-gray-400 text-sm max-w-md">Válts Prémiumra és férj hozzá az összes jelenlegi és jövőbeli kurzusunkhoz korlátozások nélkül.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPurchaseModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 group/btn shadow-xl shadow-orange-600/20 relative z-10"
              >
                <Zap className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" /> 
                Prémium Előfizetés
              </button>
            </motion.div>
          )}

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Keresés a tudástárban..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-6 py-3 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/30 transition-all shadow-2xl flex flex-col md:flex-row"
              >
                <div className="md:w-2/5 relative overflow-hidden">
                  <img 
                    src={course.imageUrl} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10">
                      {course.level}
                    </span>
                    {course.accessType === 'premium' && (
                      <span className="bg-orange-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/20 flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-current" /> Prémium
                      </span>
                    )}
                  </div>
                </div>
                <div className="md:w-3/5 p-8 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">{course.category}</span>
                    <div className="flex items-center gap-1 text-orange-400 text-sm font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" /> {course.rating}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 leading-tight group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" /> {course.duration}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <BarChart className="w-3.5 h-3.5" /> {course.students} tanuló
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-bold">{course.price}</span>
                    <Link to={`/tudastar/${course.id}`} className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 group/btn">
                      Megnézem <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Nincs a keresésnek megfelelő tartalom.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <PurchaseModal 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={handlePurchaseSuccess}
      />

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] bg-green-600 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6" />
            Sikeres előfizetés! Mostantól minden kurzus elérhető számodra.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
