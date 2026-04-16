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
  CheckCircle2, 
  ArrowRight,
  Zap,
  Crown,
  Sparkles,
  Wrench
} from 'lucide-react';
import { COURSES } from '../constants/courses';
import PurchaseModal from '../components/PurchaseModal';
import { useEffect } from 'react';

const CATEGORIES = ['Összes', 'Akadémia', 'Eszköztár'];

const MODULE_INFO = [
  {
    id: 'ai-szotar',
    title: 'AI Szótár',
    description: 'Írd be az AI szakzsargont, és mesterséges intelligenciánk azonnal elmagyarázza neked.',
    icon: Sparkles,
    color: 'from-orange-600/20 to-orange-400/5',
    link: '/tudastar/szotar'
  },
  {
    id: 'Akadémia',
    title: 'Akadémia',
    description: 'Strukturált oktatási modulok az alapoktól a haladó üzleti alkalmazásokig.',
    icon: BookOpen,
    color: 'from-blue-600/20 to-blue-400/5'
  },
  {
    id: 'eszköztar',
    title: 'Eszköztár',
    description: 'A legjobb AI eszközök és szoftverek gyűjteménye, amiket mi is ajánlunk.',
    icon: Wrench,
    color: 'from-emerald-600/20 to-emerald-400/5',
    link: '/tudastar/eszkoztar'
  }
];

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
    <div className="min-h-screen bg-transparent text-body font-sans selection:bg-blue-500/30 transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 text-title"
            >
              Tanulj az <span className="text-blue-500">AI Jövőjéről</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-body max-w-2xl"
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
                  <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Minden kurzus egyetlen előfizetéssel?</h2>
                  <p className="text-gray-600 dark:text-gray-100 text-sm max-w-md">Válts Prémiumra és férj hozzá az összes jelenlegi és jövőbeli kurzusunkhoz korlátozások nélkül.</p>
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

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 items-stretch">
            {MODULE_INFO.map((module) => {
              const isLink = (module as any).link;
              const CardContent = (
                <div className="flex flex-col items-center text-center h-full relative z-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 shadow-lg mb-6 ${
                    selectedCategory === module.id ? 'bg-blue-600 text-white scale-110 shadow-blue-600/20' : 'bg-hover text-muted group-hover:scale-110 group-hover:bg-hover'
                  }`}>
                    <module.icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-title">{module.title}</h3>
                    <p className="text-body leading-relaxed text-xs sm:text-sm">
                      {module.description}
                    </p>
                  </div>
                  {/* Arrow indicator at the bottom center instead of absolute corner */}
                  <div className={`mt-6 transition-all duration-300 ${
                    selectedCategory === module.id ? 'text-blue-500 opacity-100' : 'text-muted opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                  }`}>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              );

              const className = `p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group flex flex-col h-full ${
                selectedCategory === module.id 
                  ? 'bg-gradient-to-br border-blue-500/50 ring-2 ring-blue-500/10' 
                  : 'bg-card border-none shadow-lg hover:shadow-2xl transition-all duration-300'
              } ${module.color}`;

              const GlowEffect = (
                <div className={`absolute top-0 right-0 w-40 h-40 blur-[70px] -translate-y-1/2 translate-x-1/2 transition-opacity duration-500 pointer-events-none ${
                  selectedCategory === module.id ? 'opacity-30' : 'opacity-0 group-hover:opacity-10'
                } ${module.color.split(' ')[0].replace('from-', 'bg-')}`} />
              );

              if (isLink) {
                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-full"
                  >
                    <Link to={(module as any).link} className={className}>
                      {GlowEffect}
                      {CardContent}
                    </Link>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full"
                >
                  <button
                    onClick={() => setSelectedCategory(selectedCategory === module.id ? 'Összes' : module.id)}
                    className={`${className} w-full`}
                  >
                    {GlowEffect}
                    {CardContent}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                {selectedCategory === 'Összes' ? 'Minden kurzus' : `${selectedCategory} kurzusok`}
              </h2>
              {selectedCategory !== 'Összes' && (
                <button 
                  onClick={() => setSelectedCategory('Összes')}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Összes mutatása
                </button>
              )}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input 
                type="text" 
                placeholder="Keresés a tudástárban..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => { setSearchTerm(''); e.target.select(); }}
                onClick={(e) => e.currentTarget.select()}
                className="w-full bg-card border border-main rounded-full pl-11 pr-6 py-3 focus:outline-none focus:border-blue-500 transition-colors text-sm text-title"
              />
            </div>
          </div>

          {/* Modules Sections */}
          <div className="space-y-24">
            {MODULE_INFO.filter(module => !module.link && (selectedCategory === 'Összes' || selectedCategory === module.id)).map((module) => {
              const moduleCourses = filteredCourses.filter(c => c.category === module.id);
              if (moduleCourses.length === 0 && selectedCategory !== 'Összes') return null;
              if (moduleCourses.length === 0 && searchTerm) return null;

              return (
                <div key={module.id} className="space-y-8">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold tracking-tight text-title">{module.title}</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {moduleCourses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                      >
                        <Link 
                          to={`/tudastar/${course.id}`}
                          className="flex flex-col bg-card border-none rounded-[2.5rem] overflow-hidden transition-all shadow-lg hover:shadow-2xl h-full group"
                        >
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <img 
                              src={course.imageUrl} 
                              alt={course.title} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-[#0f0f0f] via-transparent to-transparent opacity-60" />
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                              <span className="bg-black/60 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10">
                                {course.level}
                              </span>
                              {course.accessType === 'premium' && (
                                <span className="bg-orange-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/20 flex items-center gap-1.5">
                                  <Zap className="w-3 h-3 fill-current" /> Prémium
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="p-8 flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">{course.category}</span>
                              <div className="flex items-center gap-1.5 text-orange-500 dark:text-orange-400 text-sm font-bold">
                                <Star className="w-4 h-4 fill-current" /> {course.rating}
                              </div>
                            </div>
                            
                            <h3 className="text-xl font-bold mb-4 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-title">
                              {course.title}
                            </h3>
                            
                            <p className="text-body text-sm mb-8 line-clamp-2 leading-relaxed">
                              {course.description}
                            </p>
                            
                            <div className="mt-auto">
                              <div className="flex items-center justify-between mb-6 pt-6 border-t border-main">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1.5 text-[11px] text-body">
                                    <Clock className="w-3.5 h-3.5" /> {course.duration}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-body">
                                    <BarChart className="w-3.5 h-3.5" /> {course.students}
                                  </div>
                                </div>
                                <span className="text-lg font-bold text-title">{course.price}</span>
                              </div>
                              
                              <div className="w-full py-4 rounded-2xl bg-hover group-hover:bg-blue-600 group-hover:text-white text-center text-sm font-bold transition-all flex items-center justify-center gap-2 text-title">
                                Megtekintés <ArrowRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
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
