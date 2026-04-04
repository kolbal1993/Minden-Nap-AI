/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  ChevronRight, 
  Cpu, 
  BookOpen, 
  Zap, 
  ArrowRight,
  Newspaper,
  Mail,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

// --- Types ---
interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  imageUrl: string;
}

// --- Mock Data ---
const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'A GPT-5 fejlesztése új mérföldkőhöz érkezett',
    excerpt: 'A legfrissebb jelentések szerint az OpenAI új modellje minden eddiginél jobb érvelési képességekkel rendelkezik.',
    date: '2026. április 3.',
    category: 'Modellek',
    imageUrl: 'https://picsum.photos/seed/ai1/800/600'
  },
  {
    id: '2',
    title: 'Az AI szerepe a fenntartható energiagazdálkodásban',
    excerpt: 'Hogyan segítenek a gépi tanulási algoritmusok az elektromos hálózatok optimalizálásában?',
    date: '2026. április 2.',
    category: 'Technológia',
    imageUrl: 'https://picsum.photos/seed/ai2/800/600'
  },
  {
    id: '3',
    title: 'Etikai kérdések az autonóm rendszerek világában',
    excerpt: 'A szakértők szerint sürgős szabályozásra van szükség az AI által vezérelt döntéshozatali folyamatokban.',
    date: '2026. április 1.',
    category: 'Etika',
    imageUrl: 'https://picsum.photos/seed/ai3/800/600'
  }
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 font-sans selection:bg-blue-500/30">
      <Navbar transparent />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
              <Sparkles className="w-3.5 h-3.5" /> Minden Nap AI
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent leading-[1.1]">
              Az AI érthetően. <br />
              <span className="text-blue-500">Hírek és tudás</span> minden nap.
            </h1>
            <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-12 leading-relaxed">
              Maradj naprakész a legfrissebb AI hírekkel és sajátítsd el a jövő technológiáját 
              gyakorlatias kurzusaink segítségével.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/news" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20 group">
                Legfrissebb Hírek <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/tudastar" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all text-center hover:border-white/20">
                Tudástár Böngészése
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* News Quick View */}
      <section className="py-24 bg-[#0d0d0d] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
                <Newspaper className="text-blue-500 w-8 h-8" /> Friss Hírek
              </h2>
              <p className="text-gray-400">A legfontosabb események az AI világából.</p>
            </div>
            <Link to="/news" className="hidden md:flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors group">
              Összes hír <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {MOCK_NEWS.map((news, index) => (
              <Link
                key={news.id}
                to={`/news/${news.id}`}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-[#151515] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/30 transition-all hover:-translate-y-2 shadow-2xl h-full"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={news.imageUrl} 
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-5 left-5 bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                      {news.category}
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="text-xs text-gray-500 font-medium mb-4">{news.date}</div>
                    <h3 className="text-xl font-bold mb-4 group-hover:text-blue-400 transition-colors leading-tight">
                      {news.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                      {news.excerpt}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link to="/news" className="inline-flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors">
              Összes hír böngészése <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Educational Teaser */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 rounded-[3rem] p-8 md:p-20 flex flex-col lg:flex-row items-center gap-16 shadow-3xl">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm font-bold">
                <BookOpen className="w-5 h-5" /> Tanulj velünk
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight">
                Sajátítsd el az AI <br /> 
                <span className="text-blue-500">gyakorlati használatát.</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Kurzusaink nem csak elméletet tanítanak. Valós projekteken keresztül mutatjuk meg, 
                hogyan integrálhatod a mesterséges intelligenciát a mindennapi munkádba.
              </p>
              <ul className="space-y-4">
                {[
                  'Iparági szakértők által vezetett órák',
                  'Gyakorlati feladatok és visszajelzés',
                  'Örökös hozzáférés a tananyagokhoz',
                  'Exkluzív közösségi tagság'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="text-blue-500 w-5 h-5" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/tudastar" className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all hover:scale-105 active:scale-95">
                Tudástár megtekintése <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex-1 relative">
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://picsum.photos/seed/learning/800/1000" 
                  alt="Learning AI" 
                  className="w-full aspect-[4/5] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10">
                  <div className="bg-blue-600/90 backdrop-blur-md p-6 rounded-2xl border border-white/20 inline-block max-w-xs">
                    <p className="text-white font-bold text-lg mb-1">AI Prompt Engineering</p>
                    <p className="text-blue-100 text-sm opacity-80">A legnépszerűbb kurzusunk</p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        {/* Abstract background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        </div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-4">
              <Mail className="text-white w-8 h-8" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Ne maradj le semmiről.
            </h2>
            <p className="text-blue-100 text-lg max-w-xl mx-auto opacity-90">
              Iratkozz fel hírlevelünkre, és küldjük a hét legfontosabb AI híreit 
              és exkluzív oktatási tippjeit közvetlenül a postaládádba.
            </p>
            
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="E-mail címed" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-blue-200 focus:outline-none focus:bg-white/20 transition-all"
              />
              <button 
                type="submit"
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all active:scale-95 shadow-lg"
              >
                Feliratkozás
              </button>
            </form>
            
            {subscribed && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white font-bold flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> Köszönjük! Hamarosan jelentkezünk.
              </motion.p>
            )}
            
            <p className="text-blue-200 text-xs opacity-70">
              Bármikor leiratkozhatsz. Adatvédelmi irányelveinket <Link to="/privacy" className="underline">itt találod</Link>.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
