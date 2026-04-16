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
  Sparkles,
  Calendar
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
    <div className="min-h-screen bg-transparent text-main font-sans selection:bg-blue-500/30 transition-colors duration-300">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs font-bold uppercase tracking-widest mb-8">
              <Sparkles className="w-3.5 h-3.5" /> Minden Nap AI
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-8 bg-gradient-to-br from-[var(--text-title)] via-[var(--text-title)] to-blue-100 bg-clip-text text-transparent leading-[1.1] drop-shadow-2xl">
              Az AI érthetően. <br />
              <span className="text-blue-600 dark:text-blue-400 drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]">Hírek és tudás</span> <span className="text-[var(--text-title)]">minden nap.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-desc text-lg md:text-xl mb-12 leading-relaxed">
              Maradj naprakész a legfrissebb AI hírekkel és sajátítsd el a jövő technológiáját 
              gyakorlatias kurzusaink segítségével.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/news" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20 group">
                Legfrissebb Hírek <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/tudastar" className="w-full sm:w-auto bg-hover border-none text-title px-10 py-5 rounded-2xl font-bold text-lg transition-all text-center shadow-lg hover:shadow-xl">
                Tudástár Böngészése
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* News Quick View */}
      <section className="py-24 bg-surface border-y border-subtle transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3 text-title">
                <Newspaper className="text-blue-500 w-8 h-8" /> Friss Hírek
              </h2>
              <p className="text-body">A legfontosabb események az AI világából.</p>
            </div>
            <Link to="/news" className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:text-blue-500 transition-colors group">
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
                  className="group bg-[var(--bg-card)] border-none rounded-3xl overflow-hidden transition-all hover:-translate-y-2 shadow-lg hover:shadow-2xl h-full"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={news.imageUrl} 
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-5 left-5 bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                      {news.category}
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-3 text-muted text-xs mb-4">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {news.date}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-title group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {news.title}
                    </h3>
                    <p className="text-desc text-sm line-clamp-3 mb-6 leading-relaxed">
                      {news.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider group/btn">
                      Olvasd tovább <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </div>
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs font-bold uppercase tracking-widest">
                <Zap className="w-3.5 h-3.5" /> Gyakorlati Tudás
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-title)] tracking-tight leading-[1.1]">
                Sajátítsd el az AI-t <br />
                <span className="text-blue-600">lépésről lépésre.</span>
              </h2>
              <p className="text-[var(--text-body)] text-lg leading-relaxed max-w-xl">
                Nem csak híreket kapsz. Megmutatjuk, hogyan használd az AI eszközöket 
                a mindennapi munkádban és kreatív folyamataidban.
              </p>
              <ul className="space-y-5 text-[var(--text-title)]">
                {[
                  'Prompt Engineering alapoktól a profi szintig',
                  'Kép- és videógenerálás mesterfogásai',
                  'AI munkafolyamatok automatizálása',
                  'Személyre szabott tanulási útvonalak'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Link to="/tudastar" className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20">
                  Tudástár megtekintése <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative z-10 rounded-3xl overflow-hidden border border-subtle shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 group isolation-isolate transform-gpu backface-hidden">
                <img 
                  src="https://picsum.photos/seed/learning/800/1000" 
                  alt="Learning AI" 
                  className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10">
                  <div className="bg-blue-600/90 backdrop-blur-md p-6 rounded-2xl border border-white/20 inline-block max-w-xs shadow-2xl">
                    <p className="text-white font-bold text-lg mb-1">AI Prompt Engineering</p>
                    <p className="text-blue-100 text-sm opacity-80">A legnépszerűbb kurzusunk</p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-500/5 blur-3xl rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-bg-main to-bg-main -z-10" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border-none p-12 md:p-20 rounded-[3rem] shadow-2xl relative overflow-hidden group"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full group-hover:bg-blue-600/20 transition-colors duration-700" />
            
            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/10 rounded-3xl mb-4 border border-blue-500/20">
                <Mail className="text-blue-600 w-10 h-10" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-title)] tracking-tight leading-tight">
                Ne maradj le semmiről. <br />
                <span className="text-blue-600">AI hírek a postaládádba.</span>
              </h2>
              <p className="text-[var(--text-body)] text-lg max-w-xl mx-auto leading-relaxed">
                Iratkozz fel hírlevelünkre, és küldjük a hét legfontosabb AI híreit 
                és exkluzív oktatási tippjeit közvetlenül a postaládádba.
              </p>
              
              <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="E-mail címed" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => e.currentTarget.select()}
                  required
                  className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl px-6 py-5 text-[var(--text-title)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                />
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-blue-500 transition-all active:scale-95 shadow-xl shadow-blue-600/20 hover:scale-105"
                >
                  Feliratkozás
                </button>
              </form>
              
              {subscribed && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-500 font-bold flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Köszönjük! Hamarosan jelentkezünk.
                </motion.p>
              )}
              
              <p className="text-muted text-xs">
                Bármikor leiratkozhatsz. Adatvédelmi irányelveinket <Link to="/privacy" className="underline hover:text-blue-600 transition-colors">itt találod</Link>.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
