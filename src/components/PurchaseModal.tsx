/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Zap, Crown, CreditCard, ShieldCheck } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
  coursePrice?: string;
  onSuccess: (isPremium: boolean) => void;
}

export default function PurchaseModal({ isOpen, onClose, courseTitle, coursePrice, onSuccess }: PurchaseModalProps) {
  const handlePurchase = (type: 'premium' | 'course') => {
    // Mock purchase logic
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      if (type === 'premium') {
        profile.isPremium = true;
      } else {
        // In a real app, we'd add the courseId to a list of purchased courses
        // For now, let's just simulate success
      }
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }
    
    onSuccess(type === 'premium');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            {/* Left Side: Premium Subscription */}
            <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-br from-orange-600/5 to-transparent">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center">
                  <Crown className="text-orange-500 w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">Prémium Tagság</h3>
              </div>
              
              <p className="text-gray-400 text-sm mb-8">
                Válts Prémiumra és férj hozzá az összes jelenlegi és jövőbeli kurzusunkhoz korlátozások nélkül.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  'Összes kurzus elérése',
                  'Exkluzív tananyagok',
                  'Letölthető segédletek',
                  'Közösségi tagság',
                  'Havi új tartalmak'
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="text-green-500 w-4 h-4 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto">
                <div className="mb-6">
                  <span className="text-3xl font-bold">9.900 Ft</span>
                  <span className="text-gray-500 text-sm ml-2">/ hó</span>
                </div>
                <button 
                  onClick={() => handlePurchase('premium')}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-orange-600/20"
                >
                  <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" /> 
                  Előfizetés Most
                </button>
              </div>
            </div>

            {/* Right Side: Single Purchase */}
            <div className="flex-1 p-8 md:p-12 flex flex-col">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="text-blue-500 w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">Egyedi Vásárlás</h3>
              </div>
              
              <p className="text-gray-400 text-sm mb-8">
                Csak ezt a kurzust szeretnéd? Vásárold meg egyszeri díjjal és férj hozzá örökké.
              </p>

              <div className="bg-white/5 rounded-2xl p-6 mb-10 border border-white/5">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Kiválasztott kurzus:</p>
                <h4 className="font-bold text-lg text-blue-400 mb-1">{courseTitle || 'Kurzus'}</h4>
                <p className="text-sm text-gray-400">Örökös hozzáférés a tartalomhoz.</p>
              </div>
              
              <div className="mt-auto">
                <div className="mb-6">
                  <span className="text-3xl font-bold">{coursePrice || '24.900 Ft'}</span>
                  <span className="text-gray-500 text-sm ml-2">egyszeri díj</span>
                </div>
                <button 
                  onClick={() => handlePurchase('course')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-white/10"
                >
                  Vásárlás Befejezése
                </button>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Biztonságos Fizetés</span>
                <span className="flex items-center gap-1"><Check className="w-3 h-3" /> 14 napos pénzvisszafizetés</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
