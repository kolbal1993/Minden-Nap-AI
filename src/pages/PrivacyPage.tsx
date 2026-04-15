/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Shield, 
  Eye, 
  Lock, 
  Database, 
  UserCheck,
  Info
} from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/20 mb-6"
            >
              <Shield className="text-blue-400 w-8 h-8" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 text-gray-900 dark:text-white"
            >
              Adatvédelmi <span className="text-blue-500">Tájékoztató</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-700 dark:text-gray-100"
            >
              Utolsó frissítés: 2026. április 3.
            </motion.p>
          </div>

          {/* Content */}
          <div className="space-y-12 text-gray-700 dark:text-gray-100 leading-relaxed">
            <section className="bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Info className="text-blue-500 w-6 h-6" /> 1. Bevezetés
              </h2>
              <p className="mb-4">
                A Minden Nap AI (továbbiakban: Szolgáltató) elkötelezett a felhasználók személyes adatainak védelme mellett. Jelen tájékoztató célja, hogy átlátható módon bemutassa, hogyan gyűjtjük, használjuk fel és védjük az Ön adatait.
              </p>
              <p>
                Adatkezelési alapelveink összhangban vannak az Európai Unió Általános Adatvédelmi Rendeletével (GDPR).
              </p>
            </section>

            <section className="bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Database className="text-blue-500 w-6 h-6" /> 2. Gyűjtött adatok köre
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-400" /> Regisztrációs adatok
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-100">Név, e-mail cím, jelszó (titkosítva), cégnév (opcionális).</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-400" /> Használati adatok
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-100">IP cím, böngésző típusa, megtekintett kurzusok, belépési naplók.</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Lock className="text-blue-500 w-6 h-6" /> 3. Az adatkezelés célja
              </h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <span>A szolgáltatásokhoz való hozzáférés biztosítása (pl. kurzusok elérése).</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <span>Személyre szabott tartalom és ajánlatok nyújtása.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <span>Kapcsolattartás, ügyfélszolgálati megkeresések megválaszolása.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <span>A weboldal biztonságának és stabilitásának fenntartása.</span>
                </li>
              </ul>
            </section>

            <section className="bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Shield className="text-blue-500 w-6 h-6" /> 4. Az Ön jogai
              </h2>
              <p className="mb-4">Önnek joga van:</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-blue-400 font-bold text-sm">01</span>
                  <span className="text-sm">Tájékoztatást kérni adatai kezeléséről.</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-blue-400 font-bold text-sm">02</span>
                  <span className="text-sm">Kérni adatai helyesbítését vagy törlését.</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-blue-400 font-bold text-sm">03</span>
                  <span className="text-sm">Tiltakozni az adatok kezelése ellen.</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-blue-400 font-bold text-sm">04</span>
                  <span className="text-sm">Adathordozhatósághoz való jogával élni.</span>
                </div>
              </div>
            </section>

            <div className="p-8 rounded-[2rem] bg-blue-600/5 border border-blue-500/10 text-center">
              <p className="text-gray-700 dark:text-gray-100 text-sm italic">
                Adatvédelmi kérdésekben írjon nekünk az <a href="mailto:privacy@mindennapai.hu" className="text-blue-400 font-bold hover:underline">privacy@mindennapai.hu</a> címen.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
