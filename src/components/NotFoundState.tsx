/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NotFoundState — egységes "nem található" állapot komponens.
 *
 * Korábban minden DetailPage saját, sötét szöveges hibakezelője volt, ami
 * világos téma esetén láthatatlan volt. Ez a komponens TÉMAFÜGGETLEN (mind
 * a `light`, mind a `dark` módban jól látható), TELJES KÉPERNYŐS, és a
 * Navbar/Footer is megjelenik — a felhasználó SOHA nem ragad "üres" oldalon.
 *
 * Használat:
 *   <NotFoundState
 *     title="A hír nem található"
 *     message="Lehet, hogy törölték, vagy hibás linkre kattintottál."
 *     backLink="/news"
 *     backLabel="Vissza a hírekhez"
 *     showRefresh
 *   />
 */

import { Link } from 'react-router-dom';
import { ChevronLeft, RefreshCw, AlertCircle } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

interface NotFoundStateProps {
  title: string;
  message?: string;
  backLink: string;
  backLabel: string;
  /** Hibakód megjelenítése (pl. "HTTP 404") — opcionális */
  code?: string;
  /** Refresh gomb megjelenítése */
  showRefresh?: boolean;
}

export default function NotFoundState({
  title,
  message,
  backLink,
  backLabel,
  code,
  showRefresh = true,
}: NotFoundStateProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-title)] font-sans transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Ikon — TÉMAFÜGGETLEN, mindig látható (kék konténer + sötét ikon) */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 mb-8">
            <AlertCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" strokeWidth={2} />
          </div>

          {/* Hibakód badge — ha van */}
          {code && (
            <div className="inline-block mb-4 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-mono font-semibold uppercase tracking-wider">
              {code}
            </div>
          )}

          {/* Cím — TÉMAFÜGGETLEN (text-[var(--text-title)]) */}
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            {title}
          </h1>

          {/* Üzenet — TÉMAFÜGGETLEN */}
          {message && (
            <p className="text-lg text-[var(--text-muted)] mb-10 max-w-md mx-auto">
              {message}
            </p>
          )}

          {/* Akciógombok — TÉMAFÜGGETLEN */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={backLink}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <ChevronLeft className="w-5 h-5" />
              {backLabel}
            </Link>

            {showRefresh && (
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-title)] font-semibold hover:bg-[var(--bg-hover)] transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Frissítés
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
