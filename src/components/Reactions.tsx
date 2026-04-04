import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Smile } from 'lucide-react';

export const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

interface ReactionsProps {
  reactions: { [emoji: string]: number };
  userReaction?: string;
  onReact: (emoji: string) => void;
  variant?: 'post' | 'comment' | 'news';
}

export default function Reactions({ reactions, userReaction, onReact, variant = 'post' }: ReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalReactions = Object.values(reactions).reduce((acc, count) => acc + count, 0);

  return (
    <div className="relative flex items-center gap-2">
      {/* Reaction Display */}
      <div className="flex items-center gap-1.5">
        {Object.entries(reactions).map(([emoji, count]) => (
          count > 0 && (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all ${
                userReaction === emoji 
                  ? 'bg-blue-600/20 border-blue-500/50 text-white' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <span className="text-sm">{emoji}</span>
              <span className="text-xs font-bold">{count}</span>
            </button>
          )
        ))}
      </div>

      {/* Add Reaction Button */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={`flex items-center gap-2 transition-colors ${
            showPicker ? 'text-blue-400' : 'text-gray-500 hover:text-blue-400'
          }`}
          title="Reakció hozzáadása"
        >
          {variant === 'news' ? (
            <div className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold bg-white/5 hover:bg-white/10 text-gray-300 transition-all">
              <Smile className="w-5 h-5" /> Reakciók
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Plus className="w-4 h-4" />
              <Smile className="w-5 h-5" />
            </div>
          )}
        </button>

        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className={`absolute bottom-full mb-2 left-0 z-50 bg-[#1a1a1a] border border-white/10 rounded-2xl p-2 shadow-2xl flex gap-1 backdrop-blur-xl ${
                variant === 'news' ? 'mb-4' : ''
              }`}
            >
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(emoji);
                    setShowPicker(false);
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:scale-125 hover:bg-white/5 ${
                    userReaction === emoji ? 'bg-blue-600/20' : ''
                  }`}
                >
                  <span className="text-xl">{emoji}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
