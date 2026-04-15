/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Cpu, 
  Mail, 
  ArrowRight, 
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock password reset logic
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <Link to="/" className="flex items-center justify-center gap-3 group mb-10">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-blue-600/20">
            <Cpu className="text-white w-7 h-7" />
          </div>
          <span className="text-2xl font-bold tracking-tighter">Minden Nap AI</span>
        </Link>

        <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          {!isSubmitted ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Elfelejtett jelszó?</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Add meg az e-mail címedet, és küldünk egy linket, amivel visszaállíthatod a jelszavadat.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">E-mail cím</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.currentTarget.select()}
                      placeholder="pelda@email.hu"
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
                      Link küldése <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-green-500 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-4">E-mail elküldve!</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Ellenőrizd a <strong>{email}</strong> címet a jelszó-visszaállítási utasításokért.
              </p>
              <Link 
                to="/login"
                className="inline-flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors"
              >
                Vissza a bejelentkezéshez
              </Link>
            </motion.div>
          )}
        </div>

        {!isSubmitted && (
          <Link to="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-400 text-sm mt-8 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Vissza a bejelentkezéshez
          </Link>
        )}
      </motion.div>
    </div>
  );
}
