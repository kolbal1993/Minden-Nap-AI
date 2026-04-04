/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Menu, 
  X, 
  User, 
  LogOut,
  Zap
} from 'lucide-react';

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    
    const updateAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const role = localStorage.getItem('userRole');
      setIsLoggedIn(loggedIn);
      setUserRole(role);

      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setUserAvatar(profile.avatar);
        setIsPremium(profile.isPremium || false);
      }
    };

    updateAuth();
    window.addEventListener('storage', updateAuth);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', updateAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/');
  };

  const navBg = transparent 
    ? (scrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent')
    : 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-blue-600/20">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tighter">Minden Nap AI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link to="/tudastar" className="hover:text-white transition-colors">Tudástár</Link>
          <Link to="/news" className="hover:text-white transition-colors">Hírek</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Kapcsolat</Link>
          
          {!isLoggedIn ? (
            <>
              <Link to="/admin" className="bg-white/5 border border-white/10 text-white px-5 py-2 rounded-full hover:bg-white/10 transition-colors">
                Admin
              </Link>
              <Link to="/login" className="bg-white text-black px-5 py-2 rounded-full hover:bg-blue-50 transition-colors">
                Belépés
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {userRole === 'admin' && (
                <Link to="/admin" className="text-blue-400 hover:text-blue-300 transition-colors font-bold">
                  Admin Panel
                </Link>
              )}
              <Link 
                to="/profile"
                className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-all group"
              >
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden border border-white/10 relative">
                  {userAvatar ? (
                    <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="text-white w-3.5 h-3.5" />
                  )}
                  {isPremium && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-orange-500 p-0.5 rounded-full border border-[#0a0a0a] z-10">
                      <Zap className="w-1.5 h-1.5 text-white fill-current" />
                    </div>
                  )}
                </div>
                <span className="text-white text-xs group-hover:text-blue-400 transition-colors">Profilom</span>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  className="ml-2 text-gray-500 hover:text-red-400 transition-colors"
                  title="Kijelentkezés"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-[#0a0a0a] border-b border-white/10 p-6 flex flex-col gap-4 md:hidden"
          >
            <Link to="/tudastar" className="text-lg font-medium">Tudástár</Link>
            <Link to="/news" className="text-lg font-medium">Hírek</Link>
            <Link to="/contact" className="text-lg font-medium">Kapcsolat</Link>
            
            {!isLoggedIn ? (
              <>
                <Link to="/admin" className="text-lg font-medium">Admin</Link>
                <Link to="/login" className="bg-blue-600 text-white py-3 rounded-xl font-bold text-center">Belépés</Link>
              </>
            ) : (
              <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
                <Link to="/profile" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden border border-white/10 relative">
                    {userAvatar ? (
                      <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="text-white w-5 h-5" />
                    )}
                    {isPremium && (
                      <div className="absolute bottom-0 right-0 bg-orange-500 p-1.5 rounded-full border-2 border-[#0a0a0a] z-10">
                        <Zap className="w-2 h-2 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <span className="font-bold group-hover:text-blue-400 transition-colors">Saját Profil</span>
                </Link>
                {userRole === 'admin' && (
                  <Link to="/admin" className="text-blue-400 font-bold">Admin Vezérlőpult</Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-400 font-bold"
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
