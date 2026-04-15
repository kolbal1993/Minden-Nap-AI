/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Menu, 
  X, 
  User, 
  LogOut,
  Zap,
  Bell,
  MessageSquare,
  Sun,
  Moon
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import NotificationCenter from './NotificationCenter';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        // Admin check
        if (user.email === 'admin@mindennapai.hu' || user.email === 'kolesbalazs93@gmail.com') {
          setUserRole('admin');
        } else {
          setUserRole('user');
        }
        setUserAvatar(user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserAvatar(null);
      }
    });

    const updateProfile = () => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        if (profile.avatar) setUserAvatar(profile.avatar);
        setIsPremium(profile.isPremium || false);
      }
    };

    updateProfile();
    window.addEventListener('storage', updateProfile);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', updateProfile);
      unsubscribeAuth();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      setIsLoggedIn(false);
      setUserRole(null);
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const navBg = transparent 
    ? (scrolled ? 'bg-glass backdrop-blur-xl border-b border-main' : 'bg-transparent')
    : 'bg-glass backdrop-blur-xl border-b border-main';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-blue-600/20">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-title group-hover:text-blue-600 transition-colors">Minden Nap AI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
          {[
            { to: '/tudastar', label: 'Tudástár' },
            { to: '/news', label: 'Hírek' },
            { to: '/community', label: 'Közösség' },
            { to: '/messages', label: 'Üzenetek', icon: MessageSquare },
            { to: '/contact', label: 'Kapcsolat' }
          ].map((link) => (
            <Link 
              key={link.to}
              to={link.to} 
              className={`px-2 py-2 rounded-xl transition-all flex items-center gap-2 border-b-2 border-transparent hover:text-blue-600 ${
                location.pathname === link.to
                  ? 'text-blue-600 border-blue-600'
                  : 'text-[var(--text-body)] hover:text-[var(--text-title)]'
              }`}
            >
              {link.icon && <link.icon className={`w-4 h-4 ${location.pathname === link.to ? 'text-blue-600' : 'text-blue-500'}`} />}
              {link.label}
            </Link>
          ))}
          
          <div className="flex items-center gap-6 border-l border-[var(--border-main)] pl-8">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] transition-all flex items-center justify-center text-[var(--text-body)] hover:text-blue-600 border border-[var(--border-subtle)]"
              title={theme === 'light' ? 'Sötét mód' : 'Világos mód'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {!isLoggedIn ? (
              <div className="flex items-center gap-6">
                <Link to="/admin" className="text-[var(--text-muted)] hover:text-[var(--text-title)] text-[10px] font-black transition-colors uppercase tracking-[0.2em]">
                  Admin
                </Link>
                <Link to="/login" className="bg-blue-600 text-white px-8 py-3 rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95">
                  Belépés
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {userRole === 'admin' && (
                  <Link to="/admin" className="text-blue-500 hover:text-blue-400 transition-colors font-bold">
                    Admin Panel
                  </Link>
                )}
                <NotificationCenter />
                <Link 
                  to="/profile"
                  className="flex items-center gap-3 bg-surface border border-main px-4 py-2 rounded-xl hover:bg-hover transition-all group"
                >
                  <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden border border-white/10 relative group-hover:scale-110 transition-transform">
                    {userAvatar ? (
                      <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="text-white w-4 h-4" />
                    )}
                    {isPremium && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-orange-500 p-0.5 rounded-full border border-bg-main z-10">
                        <Zap className="w-1.5 h-1.5 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <span className="text-title text-xs font-bold uppercase tracking-widest group-hover:text-blue-600 transition-colors">Profilom</span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                    className="ml-2 text-muted hover:text-red-500 transition-colors"
                    title="Kijelentkezés"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl hover:bg-hover transition-all flex items-center justify-center text-body hover:text-blue-600"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button 
            className="w-10 h-10 rounded-xl hover:bg-hover transition-all flex items-center justify-center text-title hover:text-blue-600" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-main border-b border-main p-6 flex flex-col gap-2 md:hidden shadow-2xl"
          >
            {[
              { to: '/tudastar', label: 'Tudástár' },
              { to: '/news', label: 'Hírek' },
              { to: '/community', label: 'Közösség' },
              { to: '/messages', label: 'Üzenetek', icon: MessageSquare },
              { to: '/contact', label: 'Kapcsolat' }
            ].map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${
                  location.pathname === link.to
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-body hover:bg-hover hover:text-blue-600'
                }`}
              >
                {link.icon && <link.icon className={`w-5 h-5 ${location.pathname === link.to ? 'text-white' : 'text-blue-500'}`} />}
                {link.label}
              </Link>
            ))}
            
            {!isLoggedIn ? (
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-subtle">
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-4 rounded-2xl font-bold text-muted hover:bg-hover hover:text-title transition-all">Admin</Link>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Belépés</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-subtle">
                <Link 
                  to="/profile" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-hover transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 relative">
                    {userAvatar ? (
                      <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="text-white w-5 h-5" />
                    )}
                    {isPremium && (
                      <div className="absolute bottom-0 right-0 bg-orange-500 p-1 rounded-full border-2 border-bg-main z-10">
                        <Zap className="w-2 h-2 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-title group-hover:text-blue-600 transition-colors">Saját Profil</span>
                    <span className="text-[10px] text-muted uppercase tracking-widest">Fiókbeállítások</span>
                  </div>
                </Link>
                {userRole === 'admin' && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="p-4 text-blue-500 font-bold hover:bg-blue-500/5 rounded-xl transition-all">Admin Vezérlőpult</Link>
                )}
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 p-4 text-red-500 font-bold hover:bg-red-500/5 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" /> Kijelentkezés
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
