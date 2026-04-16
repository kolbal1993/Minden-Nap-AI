/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, MouseEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Mail, 
  Lock, 
  ArrowRight, 
  Github, 
  Chrome,
  ChevronLeft,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [pendingUser, setPendingUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const completeLogin = (userEmail: string) => {
    localStorage.setItem('isLoggedIn', 'true');
    
    // Check for redirect parameter
    const params = new URLSearchParams(location.search);
    const redirectPath = params.get('redirect');

    if (redirectPath) {
      navigate(redirectPath);
      return;
    }
    
    // Check for admin
    if (userEmail === 'admin@mindennapai.hu' || userEmail === 'kolesbalazs93@gmail.com') {
      localStorage.setItem('userRole', 'admin');
      navigate('/admin');
    } else {
      localStorage.setItem('userRole', 'user');
      navigate('/');
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !show2FA) {
        // Check if 2FA is required even for auto-login
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists() && userDoc.data().is2FAEnabled) {
            setPendingUser(user);
            setShow2FA(true);
          } else {
            completeLogin(user.email || '');
          }
        } catch (err) {
          console.error('Error checking 2FA on mount:', err);
          completeLogin(user.email || '');
        }
      }
    });
    return () => unsubscribe();
  }, [show2FA]);

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    setError('');
    try {
      if (provider === 'Google') {
        const result = await signInWithPopup(auth, googleProvider);
        completeLogin(result.user.email || '');
      } else {
        alert(`${provider} bejelentkezés szimulálva. Ez a funkció a végleges verzióban lesz elérhető.`);
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('A Google bejelentkezés jelenleg nincs engedélyezve a Firebase konzolban. Kérjük, engedélyezd az Authentication -> Sign-in method menüpont alatt.');
      } else {
        setError(err.message || 'Hiba történt a bejelentkezés során.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if 2FA is enabled for this user
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists() && userDoc.data().is2FAEnabled) {
        // Store user and show 2FA screen
        setPendingUser(user);
        setShow2FA(true);
        setIsLoading(false);
        // We don't sign out yet, but we don't proceed to navigate
        return;
      }

      completeLogin(user.email || '');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Hibás e-mail cím vagy jelszó!');
      } else {
        setError(err.message || 'Hiba történt a bejelentkezés során.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // In a real app, this would verify a TOTP or SMS code
    // For this demo, we'll accept '123456' as the code
    if (twoFACode === '123456') {
      completeLogin(pendingUser.email || '');
    } else {
      setError('Hibás 2FA kód! Próbáld újra (Tipp: 123456)');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main text-body font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
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
            <span className="text-2xl font-bold tracking-tighter text-title">Minden Nap AI</span>
          </Link>
          <p className="text-muted text-sm">Üdvözlünk újra! Jelentkezz be a folytatáshoz.</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border-none">
          <AnimatePresence mode="wait">
            {!show2FA ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
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
                    <label className="text-xs font-bold text-muted uppercase tracking-widest ml-1">E-mail cím</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.currentTarget.select()}
                        placeholder="pelda@email.hu"
                        className="w-full bg-hover border border-main rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest">Jelszó</label>
                      <Link 
                        to="/forgot-password"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Elfelejtetted?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.currentTarget.select()}
                        placeholder="••••••••"
                        className="w-full bg-hover border border-main rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
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

                <div className="mt-8 pt-8 border-t border-main">
                  <p className="text-center text-xs text-muted uppercase tracking-widest mb-6">Vagy folytasd ezekkel</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => handleSocialLogin('Google')}
                      className="flex items-center justify-center gap-3 bg-hover hover:bg-hover/80 border border-main py-3 rounded-xl transition-all text-title"
                    >
                      <Chrome className="w-5 h-5" /> <span className="text-sm font-medium">Google</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSocialLogin('GitHub')}
                      className="flex items-center justify-center gap-3 bg-hover hover:bg-hover/80 border border-main py-3 rounded-xl transition-all text-title"
                    >
                      <Github className="w-5 h-5" /> <span className="text-sm font-medium">GitHub</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="2fa-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-title">2FA Hitelesítés</h2>
                  <p className="text-muted text-sm mt-2">Add meg a hitelesítő alkalmazásodban megjelenő 6 jegyű kódot.</p>
                </div>

                <form onSubmit={handleVerify2FA} className="space-y-6">
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
                    <label className="text-xs font-bold text-muted uppercase tracking-widest ml-1">Ellenőrző kód</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading || twoFACode.length !== 6}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 group"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Ellenőrzés <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setShow2FA(false);
                      setTwoFACode('');
                      signOut(auth);
                    }}
                    className="w-full text-muted hover:text-title text-sm font-medium transition-colors"
                  >
                    Vissza a bejelentkezéshez
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-muted text-sm">
            Nincs még fiókod? <Link 
              to="/register"
              className="text-blue-400 font-bold hover:text-blue-300 transition-colors"
            >
              Regisztrálj ingyen
            </Link>
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/" className="inline-flex items-center justify-center gap-2 text-muted hover:text-title text-sm transition-colors">
              <ChevronLeft className="w-4 h-4" /> Vissza a főoldalra
            </Link>
            <button 
              onClick={() => signOut(auth)}
              className="text-xs text-muted hover:text-title transition-colors"
            >
              Munkamenet törlése (Kijelentkezés)
            </button>
          </div>
        </div>

        {/* Admin Hint */}
        <div className="mt-12 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-center">
          <p className="text-[10px] text-muted uppercase tracking-[0.2em]">Admin teszt adatok</p>
          <p className="text-xs text-blue-400/70 mt-1 font-mono">
            <a href="mailto:admin@mindennapai.hu" className="hover:underline">admin@mindennapai.hu</a> / admin123
          </p>
        </div>
      </motion.div>
    </div>
  );
}
