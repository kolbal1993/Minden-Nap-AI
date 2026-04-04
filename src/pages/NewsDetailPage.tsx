/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Calendar, 
  User, 
  Clock, 
  ChevronLeft,
  Share2,
  Bookmark,
  MessageSquare,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Check,
  Zap
} from 'lucide-react';

import { NEWS_ITEMS } from '../constants/news';

export default function NewsDetailPage() {
  const { id } = useParams();
  const news = NEWS_ITEMS.find(item => item.id === id);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);

  const refreshProfile = () => {
    const profile = JSON.parse(localStorage.getItem('userProfile') || 'null');
    if (profile) {
      setUserProfile(profile);
    } else {
      // Default mock profile if not set
      setUserProfile({
        name: 'Vendég Felhasználó',
        avatar: 'https://picsum.photos/seed/guest/200/200'
      });
    }
  };

  useEffect(() => {
    if (!id) return;
    
    // Check if bookmarked
    const savedNews = JSON.parse(localStorage.getItem('user_saved_news') || '[]');
    setIsBookmarked(savedNews.includes(id));

    // Check user vote
    const userVotes = JSON.parse(localStorage.getItem('user_news_votes') || '{}');
    setUserVote(userVotes[id] || null);

    // Load comments
    const savedComments = JSON.parse(localStorage.getItem(`news_comments_${id}`) || '[]');
    setComments(savedComments);

    // Load user profile
    refreshProfile();

    const handleStorageChange = () => {
      refreshProfile();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [id]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    const comment = {
      id: Date.now().toString(),
      text: newComment,
      date: new Date().toLocaleString('hu-HU'),
      userName: userProfile?.name || 'Vendég',
      userAvatar: userProfile?.avatar || 'https://picsum.photos/seed/guest/200/200',
      isPremium: userProfile?.isPremium || false
    };

    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    localStorage.setItem(`news_comments_${id}`, JSON.stringify(updatedComments));
    setNewComment('');
  };

  const handleBookmark = () => {
    if (!id) return;
    const savedNews = JSON.parse(localStorage.getItem('user_saved_news') || '[]');
    let newSavedNews;
    if (isBookmarked) {
      newSavedNews = savedNews.filter((newsId: string) => newsId !== id);
    } else {
      newSavedNews = [...savedNews, id];
    }
    localStorage.setItem('user_saved_news', JSON.stringify(newSavedNews));
    setIsBookmarked(!isBookmarked);

    // Update global stats for admin
    updateGlobalStats(id, 'saves', isBookmarked ? -1 : 1);
  };

  const handleVote = (type: 'like' | 'dislike') => {
    if (!id) return;
    const userVotes = JSON.parse(localStorage.getItem('user_news_votes') || '{}');
    const currentVote = userVotes[id];

    if (currentVote === type) {
      // Remove vote
      delete userVotes[id];
      setUserVote(null);
      updateGlobalStats(id, type === 'like' ? 'likes' : 'dislikes', -1);
    } else {
      // Change or add vote
      if (currentVote) {
        // Remove old vote first
        updateGlobalStats(id, currentVote === 'like' ? 'likes' : 'dislikes', -1);
      }
      userVotes[id] = type;
      setUserVote(type);
      updateGlobalStats(id, type === 'like' ? 'likes' : 'dislikes', 1);
    }
    localStorage.setItem('user_news_votes', JSON.stringify(userVotes));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  const updateGlobalStats = (newsId: string, field: 'likes' | 'dislikes' | 'saves', delta: number) => {
    const stats = JSON.parse(localStorage.getItem('news_global_stats') || '{}');
    if (!stats[newsId]) {
      stats[newsId] = { likes: 0, dislikes: 0, saves: 0 };
    }
    stats[newsId][field] = Math.max(0, (stats[newsId][field] || 0) + delta);
    localStorage.setItem('news_global_stats', JSON.stringify(stats));
  };

  if (!news) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">A hír nem található</h1>
          <Link to="/news" className="text-blue-500 hover:underline">Vissza a hírekhez</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-gray-100 font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link to="/news" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Vissza a hírekhez
          </Link>

          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-500/20">
                {news.category}
              </span>
              <span className="text-gray-500 text-xs font-medium">• {news.readTime} olvasás</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 leading-tight">
              {news.title}
            </h1>
            <div className="flex items-center justify-between border-y border-white/5 py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                  {news.author[0]}
                </div>
                <div>
                  <div className="text-white font-bold">{news.author}</div>
                  <div className="text-gray-500 text-sm flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> {news.date}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button 
                    onClick={handleShare}
                    className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors"
                    title="Megosztás"
                  >
                    <Share2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <AnimatePresence>
                    {showShareTooltip && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-md whitespace-nowrap flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Másolva!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button 
                  onClick={handleBookmark}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isBookmarked ? 'bg-blue-600 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
                  title={isBookmarked ? "Eltávolítás a könyvjelzők közül" : "Mentés könyvjelzőként"}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-[3rem] overflow-hidden mb-16 shadow-2xl border border-white/5"
          >
            <img 
              src={news.imageUrl} 
              alt={news.title} 
              className="w-full aspect-[16/9] object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert prose-blue max-w-none"
          >
            <p className="text-xl text-gray-300 leading-relaxed font-medium mb-12 italic border-l-4 border-blue-500 pl-8">
              {news.excerpt}
            </p>
            <div className="text-gray-400 text-lg leading-relaxed space-y-8 whitespace-pre-line mb-16">
              {news.content}
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center justify-center gap-6 py-12 border-y border-white/5">
              <button 
                onClick={() => handleVote('like')}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all ${userVote === 'like' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
              >
                <ThumbsUp className={`w-5 h-5 ${userVote === 'like' ? 'fill-current' : ''}`} /> Tetszik
              </button>
              <button 
                onClick={() => handleVote('dislike')}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all ${userVote === 'dislike' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
              >
                <ThumbsDown className={`w-5 h-5 ${userVote === 'dislike' ? 'fill-current' : ''}`} /> Nem tetszik
              </button>
            </div>
          </motion.div>

          {/* Footer Actions */}
          <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
            <div className="flex items-center gap-4">
              <MessageSquare className="text-blue-500 w-6 h-6" />
              <span className="text-gray-400">Hozzászólások ({comments.length})</span>
            </div>
            <Link to="/news" className="bg-white text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-all">
              Többi Hír <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Comment Section */}
          <div className="space-y-12">
            <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
              <h3 className="text-xl font-bold mb-8">Szólj hozzá a hírhez</h3>
              <form onSubmit={handleAddComment} className="space-y-6">
                <div className="flex gap-4">
                  <Link to="/profile" className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white/10 hover:border-blue-500 transition-colors">
                    <img src={userProfile?.avatar} alt="" className="w-full h-full object-cover" />
                  </Link>
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Írd le a véleményed..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors resize-none min-h-[120px]"
                  />
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                  >
                    Küldés
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              {comments.map((comment) => (
                <motion.div 
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-[#0d0d0d] border rounded-3xl p-6 flex gap-4 transition-all ${comment.isPremium ? 'border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent' : 'border-white/5'}`}
                >
                  <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/10 hover:border-blue-500 transition-colors relative">
                    <img src={comment.userAvatar} alt="" className="w-full h-full object-cover" />
                    {comment.isPremium && (
                      <div className="absolute bottom-0 right-0 bg-orange-500 p-0.5 rounded-full border border-[#0d0d0d] z-10">
                        <Zap className="w-1.5 h-1.5 text-white fill-current" />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Link to="/profile" className={`font-bold transition-colors ${comment.isPremium ? 'text-orange-400 hover:text-orange-300' : 'text-gray-200 hover:text-blue-400'}`}>
                          {comment.userName}
                        </Link>
                        {comment.isPremium && (
                          <span className="bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border border-orange-500/20 flex items-center gap-1">
                            <Zap className="w-2 h-2 fill-current" /> Prémium
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{comment.date}</span>
                    </div>
                    <p className={`${comment.isPremium ? 'text-gray-200' : 'text-gray-400'} leading-relaxed`}>
                      {comment.text}
                    </p>
                  </div>
                </motion.div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <p className="text-gray-500">Még nincsenek hozzászólások. Legyél te az első!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
