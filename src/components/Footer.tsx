/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 border-t border-main bg-transparent transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <Cpu className="text-blue-600 w-6 h-6" />
          <span className="text-lg font-bold tracking-tighter text-title">Minden Nap AI</span>
        </Link>
        <div className="flex gap-8 text-sm text-body">
          <Link to="/community" className="hover:text-title transition-colors">Közösség</Link>
          <Link to="/privacy" className="hover:text-title transition-colors">Adatvédelem</Link>
          <Link to="/terms" className="hover:text-title transition-colors">ÁSZF</Link>
          <Link to="/contact" className="hover:text-title transition-colors">Kapcsolat</Link>
        </div>
        <div className="text-sm text-body">
          © 2026 Minden Nap AI. Minden jog fenntartva.
        </div>
      </div>
    </footer>
  );
}
