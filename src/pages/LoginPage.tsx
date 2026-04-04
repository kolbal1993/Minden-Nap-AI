/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Cpu, 
  Mail, 
  Lock, 
  ArrowRight, 
  Github, 
  Chrome,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`${provider} bejelentkezés szimulálva. Ez a funkció a végleges verzióban lesz elérhető.`);
    }, 800);
  };

  const handlePlaceholderAction = (e: MouseEvent, action: string) => {
    e.preventDefault();
    alert(`${action} funkció szimulálva. Ez a fejlesztés alatt álló részleghez tartozik.`);
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Mock login logic
    setTimeout(() => {
      if (email === 'admin@mindennapai.hu' && password === 'admin123') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'admin');
        navigate('/admin');
      } else if (email && password) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'user');
        navigate('/');
      } else {
        setError('Kérjük, töltsd ki az összes mezőt!');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-blue-600/20">
              <Cpu className="text-white w-7 h-7" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">Minden Nap AI</span>
          </Link>
          <p className="text-gray-500 text-sm">Üdvözlünk újra! Jelentkezz be a folytatáshoz.</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">E-mail cím</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pelda@email.hu"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Jelszó</label>
                <Link 
                  to="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Elfelejtetted?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Bejelentkezés <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-6">Vagy folytasd ezekkel</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl transition-all"
              >
                <Chrome className="w-5 h-5" /> <span className="text-sm font-medium">Google</span>
              </button>
              <button 
                type="button"
                onClick={() => handleSocialLogin('GitHub')}
                className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl transition-all"
              >
                <Github className="w-5 h-5" /> <span className="text-sm font-medium">GitHub</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Nincs még fiókod? <Link 
              to="/register"
              className="text-blue-400 font-bold hover:text-blue-300 transition-colors"
            >
              Regisztrálj ingyen
            </Link>
          </p>
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-400 text-sm mt-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Vissza a főoldalra
          </Link>
        </div>

        {/* Admin Hint */}
        <div className="mt-12 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Admin teszt adatok</p>
          <p className="text-xs text-blue-400/70 mt-1 font-mono">
            <a href="mailto:admin@mindennapai.hu" className="hover:underline">admin@mindennapai.hu</a> / admin123
          </p>
        </div>
      </motion.div>
    </div>
  );
}
