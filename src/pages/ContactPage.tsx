/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EmojiPickerButton from '../components/EmojiPickerButton';
import { 
  Cpu, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare,
  Globe,
  Github,
  Twitter,
  Linkedin,
  ChevronRight
} from 'lucide-react';

// Mock contact data (this would come from a database/state in a real app)
const contactInfo = {
  email: "info@mindennapai.hu",
  phone: "+36 30 123 4567",
  address: "1051 Budapest, Szent István tér 1.",
  socials: [
    { name: 'LinkedIn', icon: Linkedin, url: '#' },
    { name: 'Twitter', icon: Twitter, url: '#' },
    { name: 'GitHub', icon: Github, url: '#' }
  ]
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock send logic
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSent(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6"
            >
              <MessageSquare className="w-3 h-3" /> Kapcsolat
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-gray-900 dark:text-white"
            >
              Kérdésed van? <br />
              <span className="text-gray-400 dark:text-gray-100">Itt vagyunk, hogy segítsünk.</span>
            </motion.h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-12"
            >
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors group">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Mail className="text-blue-500 w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">E-mail</h3>
                  <p className="text-gray-700 dark:text-gray-100 text-sm mb-4">Írj nekünk bármikor, 24 órán belül válaszolunk.</p>
                  <a href={`mailto:${contactInfo.email}`} className="text-blue-400 font-medium hover:underline">{contactInfo.email}</a>
                </div>

                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors group">
                  <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Phone className="text-purple-500 w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Telefon</h3>
                  <p className="text-gray-700 dark:text-gray-100 text-sm mb-4">Hívj minket munkaidőben (H-P 9:00 - 17:00).</p>
                  <a href={`tel:${contactInfo.phone}`} className="text-purple-400 font-medium hover:underline">{contactInfo.phone}</a>
                </div>

                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors group sm:col-span-2">
                  <div className="w-12 h-12 bg-green-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <MapPin className="text-green-500 w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Iroda</h3>
                  <p className="text-gray-700 dark:text-gray-100 text-sm mb-4">Látogass el hozzánk egy kávéra és beszélgessünk az AI jövőjéről.</p>
                  <p className="text-gray-900 dark:text-white font-medium">{contactInfo.address}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Kövess minket</h4>
                <div className="flex gap-4">
                  {contactInfo.socials.map((social) => (
                    <a 
                      key={social.name}
                      href={social.url}
                      className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 hover:border-blue-500/50 transition-all group"
                    >
                      <social.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative"
            >
              {isSent ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <Send className="text-green-500 w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Üzenet elküldve!</h2>
                  <p className="text-gray-300 max-w-xs mx-auto">Köszönjük a megkeresést. Hamarosan felvesszük veled a kapcsolatot.</p>
                  <button 
                    onClick={() => setIsSent(false)}
                    className="mt-8 text-blue-400 font-bold hover:text-blue-300 transition-colors"
                  >
                    Új üzenet küldése
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Név</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.currentTarget.select()}
                        placeholder="Kovács János"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.currentTarget.select()}
                        placeholder="pelda@email.hu"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tárgy</label>
                    <input 
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.currentTarget.select()}
                      placeholder="Miben segíthetünk?"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Üzenet</label>
                    <div className="relative">
                      <textarea 
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.currentTarget.select()}
                        placeholder="Írd le részletesen a kérdésedet..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-12 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        required
                      />
                      <div className="absolute right-3 bottom-3">
                        <EmojiPickerButton 
                          onEmojiSelect={(emoji) => setFormData({ ...formData, message: formData.message + emoji })} 
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 group"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Küldés <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
