/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Clock, 
  Star, 
  CheckCircle2, 
  ChevronLeft,
  PlayCircle,
  Users,
  Award,
  BookOpen,
  Lock,
  Zap
} from 'lucide-react';
import { COURSES } from '../constants/courses';
import PurchaseModal from '../components/PurchaseModal';

export default function CourseDetailPage() {
  const { id } = useParams();
  const [isPremium, setIsPremium] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const course = COURSES.find(c => c.id === id);

  const refreshProfile = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setIsPremium(profile.isPremium || false);
    }
  };

  useEffect(() => {
    refreshProfile();
    
    const handleStorageChange = () => {
      refreshProfile();
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
    refreshProfile();
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-transparent text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">A tartalom nem található</h1>
          <Link to="/tudastar" className="text-blue-500 hover:underline">Vissza a tudástárhoz</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-500/30 transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Link */}
          <Link to="/tudastar" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors mb-12 group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Vissza a tudástárhoz
          </Link>

          <div className="grid lg:grid-cols-3 gap-16">
            {/* Left Column: Content */}
            <div className="lg:col-span-2 space-y-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-500/20">
                    {course.category}
                  </span>
                  <span className="text-gray-600 dark:text-gray-100 text-xs font-medium">• {course.level} szint</span>
                  {course.accessType === 'premium' && (
                    <span className="bg-orange-600/20 text-orange-400 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-orange-500/20 flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-current" /> Prémium
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 leading-tight text-gray-900 dark:text-white">
                  {course.title}
                </h1>
                <p className="text-xl text-gray-700 dark:text-gray-100 leading-relaxed max-w-2xl">
                  {course.description}
                </p>
              </motion.div>

              {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-black/5 dark:border-white/5 py-10">
                  <div className="text-center md:text-left">
                    <div className="text-gray-700 dark:text-gray-100 text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                      <Star className="w-3.5 h-3.5 text-orange-400 fill-current" /> Értékelés
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{course.rating} / 5.0</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-gray-700 dark:text-gray-100 text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                      <Users className="w-3.5 h-3.5 text-blue-400" /> Tanulók
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{course.students}+</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-gray-700 dark:text-gray-100 text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-purple-400" /> Időtartam
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{course.duration}</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-gray-700 dark:text-gray-100 text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                      <Award className="w-3.5 h-3.5 text-green-400" /> Tanúsítvány
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">Elérhető</div>
                  </div>
                </div>

              {/* What you will learn */}
              <div>
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <CheckCircle2 className="text-blue-500 w-6 h-6" /> Mit fogsz tanulni?
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {course.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-white/5 border border-black/[0.05] dark:border-white/5 shadow-sm dark:shadow-none">
                      <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="text-blue-500 w-3.5 h-3.5" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-100 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curriculum */}
              <div>
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <BookOpen className="text-blue-500 w-6 h-6" /> Tananyag felépítése
                </h2>
                <div className="space-y-4 relative">
                  {course.curriculum?.map((item, index) => {
                    const isLocked = course.accessType === 'premium' && !isPremium;
                    return (
                      <div key={item.title} className={`flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-[#0f0f0f] border border-black/[0.05] dark:border-white/5 transition-all group shadow-sm dark:shadow-none ${isLocked ? 'opacity-50 grayscale' : 'hover:border-blue-500/30'}`}>
                        <div className="flex items-center gap-6">
                          <div className="text-gray-400 dark:text-gray-600 font-bold text-lg">{String(index + 1).padStart(2, '0')}</div>
                          <div className="flex items-center gap-4">
                            {isLocked ? (
                              <Lock className="text-gray-400 dark:text-gray-600 w-5 h-5" />
                            ) : (
                              <PlayCircle className="text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors w-5 h-5" />
                            )}
                            <span className="text-gray-800 dark:text-gray-300 font-bold">{item.title}</span>
                          </div>
                        </div>
                        <div className="text-gray-700 dark:text-gray-100 text-sm font-medium">{item.duration}</div>
                      </div>
                    );
                  })}

                  {course.accessType === 'premium' && !isPremium && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-black/20 backdrop-blur-[2px] rounded-3xl">
                      <div className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 p-8 rounded-3xl text-center shadow-2xl max-w-sm">
                        <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Lock className="text-orange-500 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Prémium Tartalom</h3>
                        <p className="text-gray-600 dark:text-gray-200 text-sm mb-6 leading-relaxed">
                          Ez a kurzus kizárólag prémium előfizetőink számára elérhető, vagy egyedi vásárlással feloldható.
                        </p>
                        <button 
                          onClick={() => setIsPurchaseModalOpen(true)}
                          className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold transition-all"
                        >
                          Előfizetés vagy Vásárlás
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="space-y-8">
              <div className="sticky top-32">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-[#0f0f0f] border border-black/[0.08] dark:border-white/10 rounded-[3rem] p-8 md:p-10 shadow-xl dark:shadow-3xl overflow-hidden relative"
                >
                  {/* Image Preview */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 group">
                    <img 
                      src={course.imageUrl} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="text-white w-16 h-16" />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-end gap-3">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {course.accessType === 'premium' && isPremium ? 'Ingyenes' : course.price}
                      </span>
                      {course.price !== 'Ingyenes' && !(course.accessType === 'premium' && isPremium) && (
                        <span className="text-gray-600 dark:text-gray-500 line-through mb-1">49.900 Ft</span>
                      )}
                      {course.accessType === 'premium' && isPremium && (
                        <span className="text-orange-500 dark:text-orange-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-current" /> Prémiummal
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={() => {
                        if (course.accessType === 'premium' && !isPremium) {
                          setIsPurchaseModalOpen(true);
                        } else {
                          // Handle enrollment
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-600/20"
                    >
                      {course.accessType === 'premium' && isPremium ? 'Kurzus megnyitása' : 'Jelentkezés'}
                    </button>

                    <div className="space-y-4 pt-4">
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-100 uppercase tracking-widest text-center">A kurzus tartalmazza:</p>
                      <div className="space-y-3">
                        {[
                          { icon: PlayCircle, label: 'Örökös hozzáférés' },
                          { icon: Award, label: 'Hivatalos tanúsítvány' },
                          { icon: Users, label: 'Közösségi támogatás' },
                          { icon: Lock, label: 'Biztonságos fizetés' }
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-3 text-gray-600 dark:text-gray-100 text-sm">
                            <item.icon className="w-4 h-4 text-blue-500" />
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Promo Card */}
                <div className="mt-8 p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-black/10 dark:border-white/10 text-center shadow-lg dark:shadow-none">
                  <h4 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Csoportos kedvezmény?</h4>
                  <p className="text-gray-600 dark:text-gray-200 text-sm mb-6">Cégeknek és csapatoknak egyedi árajánlatot biztosítunk.</p>
                  <Link to="/contact" className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline">Vedd fel velünk a kapcsolatot</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <PurchaseModal 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        courseTitle={course.title}
        coursePrice={course.price}
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
            Sikeres vásárlás! Jó tanulást kívánunk.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
