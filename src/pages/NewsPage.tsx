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
  Clock, 
  MessageSquare,
  Share2,
  Check
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';

import { NEWS_ITEMS } from '../constants/news';

const CATEGORIES = ['Összes', 'Generatív AI', 'Üzleti Automatizáció', 'AI eszközök', 'Szabályozás'];

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Összes');
  const [sharingId, setSharingId] = useState<string | null>(null);

  const handleShare = async (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareData = {
      title: item.title,
      text: item.excerpt,
      url: `${window.location.origin}/news/${item.id}`
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setSharingId(item.id);
        setTimeout(() => setSharingId(null), 2000);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(shareData.url);
        setSharingId(item.id);
        setTimeout(() => setSharingId(null), 2000);
      }
    }
  };

  const getCommentCount = (id: string) => {
    try {
      const savedComments = JSON.parse(localStorage.getItem(`news_comments_${id}`) || '[]');
      return savedComments.length;
    } catch (e) {
      return 0;
    }
  };

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
    <div className="min-h-screen bg-transparent text-body font-sans selection:bg-blue-500/30 transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 text-title"
            >
              Legfrissebb <span className="text-blue-500">Hírek</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-body max-w-2xl"
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
                      : 'bg-card text-body hover:bg-hover border border-main'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input 
                type="text" 
                placeholder="Keresés a hírek között..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => { setSearchTerm(''); e.target.select(); }}
                onClick={(e) => e.currentTarget.select()}
                className="w-full bg-card border border-main rounded-full pl-11 pr-6 py-3 focus:outline-none focus:border-blue-500 transition-colors text-sm text-title"
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
                className="group bg-card border-none rounded-[2.5rem] overflow-hidden transition-all shadow-lg hover:shadow-2xl"
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
                    <div className="absolute top-6 right-6">
                      <button
                        onClick={(e) => handleShare(e, item)}
                        className="w-10 h-10 bg-black/50 backdrop-blur-md hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all border border-white/10 group/share relative"
                      >
                        <Share2 className="w-4 h-4" />
                        <AnimatePresence>
                          {sharingId === item.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 10 }}
                              className="absolute bottom-full mb-2 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-md whitespace-nowrap flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Másolva!
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    </div>
                  </div>
                  <div className="p-8 md:p-10">
                    <div className="flex items-center gap-6 text-xs text-body mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> {item.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> {item.readTime}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> {item.author}
                      </div>
                      <div className="flex items-center gap-2 text-blue-400 font-bold">
                        <MessageSquare className="w-3.5 h-3.5" /> {getCommentCount(item.id)}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight text-title">
                      {item.title}
                    </h2>
                    <p className="text-body mb-4 line-clamp-3 leading-relaxed">
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
