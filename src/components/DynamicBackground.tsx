/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export default function DynamicBackground() {
  const { theme } = useTheme();
  
  return (
    <div className={`fixed inset-0 -z-10 transition-colors duration-700 overflow-hidden ${
      theme === 'dark' ? 'bg-[#050505]' : 'bg-gray-50'
    }`}>
      {/* Mesh Gradient Blobs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-700 ${
          theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-400/10'
        }`}
      />
      
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 120, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-700 ${
          theme === 'dark' ? 'bg-purple-600/15' : 'bg-purple-400/10'
        }`}
      />

      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
        className={`absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full blur-[100px] transition-colors duration-700 ${
          theme === 'dark' ? 'bg-blue-400/10' : 'bg-blue-300/5'
        }`}
      />

      <motion.div
        animate={{
          x: [0, -120, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 8
        }}
        className={`absolute bottom-[10%] left-[10%] w-[45%] h-[45%] rounded-full blur-[110px] transition-colors duration-700 ${
          theme === 'dark' ? 'bg-indigo-600/10' : 'bg-indigo-400/5'
        }`}
      />

      {/* Noise Texture Overlay */}
      <div className={`absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-700 ${
        theme === 'dark' ? 'opacity-[0.03]' : 'opacity-[0.01]'
      }`} 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Subtle Grid Overlay */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
        theme === 'dark' ? 'opacity-[0.05]' : 'opacity-[0.02]'
      }`}
           style={{ backgroundImage: `radial-gradient(circle at 2px 2px, ${theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} 1px, transparent 0)`, backgroundSize: '40px 40px' }}>
      </div>
    </div>
  );
}
