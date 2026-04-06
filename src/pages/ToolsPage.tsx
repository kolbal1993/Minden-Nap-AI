/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Wrench, 
  ArrowLeft, 
  ExternalLink, 
  Search,
  Zap,
  Cpu,
  Layout,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Code,
  Globe,
  Star
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TOOL_CATEGORIES = ['Összes', 'Szöveggenerálás', 'Képgenerálás', 'Videó', 'Programozás', 'Marketing', 'Produktivitás'];

const TOOLS = [
  {
    id: '1',
    name: 'ChatGPT',
    description: 'A világ legnépszerűbb AI chatbotja szövegíráshoz, kódoláshoz és elemzéshez.',
    category: 'Szöveggenerálás',
    icon: MessageSquare,
    url: 'https://chat.openai.com',
    isAffiliate: false,
    rating: 4.9,
    color: 'bg-emerald-500/10 text-emerald-500'
  },
  {
    id: '2',
    name: 'Midjourney',
    description: 'A legmagasabb minőségű képgeneráló AI, amely művészi szintű vizuális tartalmakat hoz létre.',
    category: 'Képgenerálás',
    icon: ImageIcon,
    url: 'https://www.midjourney.com',
    isAffiliate: false,
    rating: 4.8,
    color: 'bg-blue-500/10 text-blue-500'
  },
  {
    id: '3',
    name: 'Claude',
    description: 'Az Anthropic fejlett nyelvi modellje, amely kiemelkedik a hosszú szövegek elemzésében és a precíz kódolásban.',
    category: 'Szöveggenerálás',
    icon: Cpu,
    url: 'https://claude.ai',
    isAffiliate: false,
    rating: 4.8,
    color: 'bg-orange-500/10 text-orange-500'
  },
  {
    id: '4',
    name: 'Perplexity',
    description: 'AI-alapú keresőmotor, amely forrásmegjelöléssel válaszol a kérdéseidre valós időben.',
    category: 'Produktivitás',
    icon: Globe,
    url: 'https://www.perplexity.ai',
    isAffiliate: true,
    rating: 4.9,
    color: 'bg-cyan-500/10 text-cyan-500'
  },
  {
    id: '5',
    name: 'HeyGen',
    description: 'Professzionális AI videógenerátor, amellyel élethű avatarokat és videókat készíthetsz percek alatt.',
    category: 'Videó',
    icon: Video,
    url: 'https://www.heygen.com',
    isAffiliate: true,
    rating: 4.7,
    color: 'bg-purple-500/10 text-purple-500'
  },
  {
    id: '6',
    name: 'Cursor',
    description: 'Az AI-alapú kódszerkesztő, amely forradalmasítja a szoftverfejlesztést.',
    category: 'Programozás',
    icon: Code,
    url: 'https://www.cursor.com',
    isAffiliate: false,
    rating: 4.9,
    color: 'bg-blue-600/10 text-blue-400'
  },
  {
    id: '7',
    name: 'Make.com',
    description: 'A legerősebb vizuális automatizációs platform, amellyel kódolás nélkül kapcsolhatod össze kedvenc alkalmazásaidat és AI eszközeidet.',
    category: 'Produktivitás',
    icon: Zap,
    url: 'https://www.make.com/en/register?pc=mindennapai',
    isAffiliate: true,
    rating: 4.9,
    color: 'bg-indigo-500/10 text-indigo-500'
  }
];

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Összes');

  const filteredTools = TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Összes' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-transparent text-gray-100 font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Link */}
          <Link 
            to="/tudastar" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Vissza a Tudástárhoz
          </Link>

          {/* Header */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-6"
            >
              <Wrench className="w-4 h-4" /> Eszköztár
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold tracking-tighter mb-6"
            >
              A Legjobb <span className="text-emerald-500">AI Eszközök</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 max-w-2xl"
            >
              Válogatott gyűjtemény a leghatékonyabb mesterséges intelligencia szoftverekből, amiket mi is nap mint nap használunk.
            </motion.p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-8 mb-12 items-center justify-between">
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {TOOL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${
                    selectedCategory === cat 
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Eszköz keresése..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-full pl-11 pr-6 py-4 focus:outline-none focus:border-emerald-500 transition-all text-sm shadow-xl"
              />
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-8 h-full flex flex-col hover:border-emerald-500/30 transition-all shadow-2xl relative overflow-hidden">
                  {/* Background Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 blur-[60px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tool.color}`}>
                      <tool.icon className="w-7 h-7" />
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-400 text-sm font-bold bg-orange-400/5 px-3 py-1 rounded-full border border-orange-400/10">
                      <Star className="w-3.5 h-3.5 fill-current" /> {tool.rating}
                    </div>
                  </div>

                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{tool.category}</span>
                    {tool.isAffiliate && (
                      <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded">Ajánlott</span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-400 transition-colors">{tool.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">
                    {tool.description}
                  </p>

                  <a 
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-2xl bg-white/5 hover:bg-emerald-600 text-center text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    Megnyitás <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nincs találat</h3>
              <p className="text-gray-500">Próbálkozz más kulcsszóval vagy kategóriával.</p>
            </div>
          )}

          {/* Affiliate Disclaimer */}
          <div className="mt-20 p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
            <p className="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed">
              <span className="font-bold text-gray-400">Közzététel:</span> Az oldalon található linkek egy része affiliate link lehet. Ez azt jelenti, hogy ha ezeken keresztül regisztrálsz vagy vásárolsz, mi jutalékot kaphatunk, ami segít fenntartani az oldalt és ingyenes tartalmakat gyártani. Ez számodra semmilyen plusz költséggel nem jár, sőt, gyakran kedvezményeket is biztosítunk. Csak olyan eszközöket ajánlunk, amiket mi is ismerünk és jónak tartunk.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
