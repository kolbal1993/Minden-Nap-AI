/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ArrowLeft, 
  Sparkles, 
  Book, 
  Cpu, 
  Zap, 
  Brain, 
  Terminal,
  MessageSquare,
  History,
  Trash2,
  Copy,
  Check,
  Smile
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

const SUGGESTIONS = [
  { term: 'LLM', description: 'Large Language Model' },
  { term: 'RAG', description: 'Retrieval-Augmented Generation' },
  { term: 'Prompt Engineering', description: 'A bemeneti utasítások optimalizálása' },
  { term: 'Fine-tuning', description: 'Modell finomhangolása specifikus adatokon' },
  { term: 'Hallucináció', description: 'Amikor az AI téves információt generál' },
  { term: 'Token', description: 'A szövegfeldolgozás alapegysége' }
];

export default function AIDictionaryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<{ term: string; explanation: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('ai_dictionary_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (term: string, explanation: string) => {
    const newHistory = [{ term, explanation }, ...history.filter(h => h.term !== term)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('ai_dictionary_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ai_dictionary_history');
  };

  const handleSearch = async (term: string = searchTerm) => {
    if (!term.trim()) return;
    
    setIsSearching(true);
    setResult(null);
    setSearchTerm(term);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Te egy AI szakértő vagy. Magyarázd el röviden, közérthetően, de szakmailag pontosan a következő AI szakzsargont vagy fogalmat magyarul: "${term}". 
        Használj Markdown formázást. A magyarázat legyen strukturált, tartalmazzon egy rövid definíciót, egy példát a használatára, és hogy miért fontos az AI világában.`,
        config: {
          systemInstruction: "Te a Minden Nap AI platform szakértője vagy. Segíts a felhasználóknak megérteni az AI szakzsargont."
        }
      });

      const explanation = response.text || "Sajnos nem sikerült magyarázatot generálni.";
      setResult(explanation);
      saveToHistory(term, explanation);
      
      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("AI Dictionary Error:", error);
      setResult("Hiba történt az AI lekérdezése közben. Kérlek próbáld újra később.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link 
            to="/tudastar" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Vissza a Tudástárhoz
          </Link>

          {/* Header */}
          <div className="mb-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-6"
            >
              <Sparkles className="w-4 h-4" /> AI Szótár
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold tracking-tighter mb-6"
            >
              Értsd meg az <span className="text-blue-500">AI Nyelvét</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400 max-w-2xl mx-auto"
            >
              Írj be bármilyen AI szakzsargont vagy rövidítést, és mesterséges intelligenciánk azonnal elmagyarázza neked.
            </motion.p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-blue-600/20 blur-[60px] opacity-20" />
            <div className="relative flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Pl. LLM, RAG, Fine-tuning..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-[#0d0d0d] border border-white/10 rounded-3xl pl-16 pr-6 py-5 focus:outline-none focus:border-blue-500 transition-all text-lg shadow-2xl"
                />
              </div>
              <button 
                onClick={() => handleSearch()}
                disabled={isSearching || !searchTerm.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-5 rounded-3xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-blue-600/20"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">Magyarázat</span>
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="mb-16">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <History className="w-3 h-3" /> Gyakori kifejezések
            </h3>
            <div className="flex flex-wrap gap-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.term}
                  onClick={() => handleSearch(s.term)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-600/5 text-sm text-gray-400 hover:text-blue-400 transition-all flex flex-col items-start gap-1"
                >
                  <span className="font-bold text-gray-200">{s.term}</span>
                  <span className="text-[10px] opacity-60">{s.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Result Area */}
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-12 text-center"
              >
                <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Brain className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Az AI gondolkodik...</h3>
                <p className="text-gray-500">Pillanatokon belül érkezik a magyarázat.</p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                ref={resultRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0d0d0d] border border-blue-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl relative"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
                
                <div className="p-8 md:p-12">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                        <Book className="text-blue-500 w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{searchTerm}</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">AI Magyarázat</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleCopy}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all relative group"
                        title="Másolás"
                      >
                        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {copied ? 'Másolva!' : 'Másolás'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="prose prose-invert prose-blue max-w-none">
                    <div className="markdown-body text-gray-300 leading-relaxed space-y-4">
                      <Markdown>{result}</Markdown>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Terminal className="w-4 h-4" />
                      Generálva a Minden Nap AI motorjával
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">Hasznos volt?</span>
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 text-gray-400 hover:text-green-500 transition-all">
                          <Smile className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* History */}
          {history.length > 0 && !isSearching && !result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-20"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <History className="text-blue-500 w-5 h-5" /> Korábbi keresések
                </h2>
                <button 
                  onClick={clearHistory}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" /> Előzmények törlése
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(h.term)}
                    className="p-6 rounded-3xl bg-[#0d0d0d] border border-white/5 hover:border-blue-500/30 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{h.term}</span>
                      <MessageSquare className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {h.explanation.replace(/[#*`]/g, '').substring(0, 100)}...
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
