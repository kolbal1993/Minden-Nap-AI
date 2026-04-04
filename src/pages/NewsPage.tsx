/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Search, 
  Calendar, 
  User, 
  ArrowRight, 
  Tag,
  Clock,
  Cpu
} from 'lucide-react';

import { NEWS_ITEMS } from '../constants/news';

const CATEGORIES = ['Összes', 'Generatív AI', 'Üzleti Automatizáció', 'AI eszközök', 'Szabályozás'];

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Összes');

  const filteredNews = NEWS_ITEMS.filter(item => {
    const now = new Date();
    const publishDate = item.publishDate ? new Date(item.publishDate) : null;
    const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;

    // Status check
    if (item.status === 'inactive') return false;

    // Scheduling check
    if (publishDate && publishDate > now) return false;
    if (expiryDate && expiryDate < now) return false;

    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Összes' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-transparent text-gray-100 font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold tracking-tighter mb-6"
            >
              Legfrissebb <span className="text-blue-500">Hírek</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 max-w-2xl"
            >
              Maradj naprakész a mesterséges intelligencia világának legfontosabb eseményeivel és technológiai áttöréseivel.
            </motion.p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Keresés a hírek között..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-6 py-3 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* News Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {filteredNews.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/30 transition-all shadow-2xl"
              >
                <Link to={`/news/${item.id}`} className="block h-full">
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 md:p-10">
                    <div className="flex items-center gap-6 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> {item.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> {item.readTime}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> {item.author}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors leading-tight">
                      {item.title}
                    </h2>
                    <p className="text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {filteredNews.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Nincs a keresésnek megfelelő hír.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
