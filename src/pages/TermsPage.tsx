/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  ShieldCheck, 
  Scale, 
  FileText, 
  Lock, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-transparent text-gray-100 font-sans selection:bg-blue-500/30">
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
              <Scale className="text-blue-400 w-8 h-8" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold tracking-tighter mb-6"
            >
              Általános <span className="text-blue-500">Szerződési Feltételek</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400"
            >
              Utolsó frissítés: 2026. április 3.
            </motion.p>
          </div>

          {/* Content */}
          <div className="space-y-12 text-gray-300 leading-relaxed">
            <section className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FileText className="text-blue-500 w-6 h-6" /> 1. Általános rendelkezések
              </h2>
              <p className="mb-4">
                A jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a Minden Nap AI (továbbiakban: Szolgáltató) által üzemeltetett weboldal és az azon keresztül elérhető szolgáltatások igénybevételének feltételeit szabályozza.
              </p>
              <p>
                A weboldal használatával, illetve a regisztrációval a Felhasználó kijelenti, hogy a jelen ÁSZF tartalmát megismerte, azt magára nézve kötelezőnek ismeri el.
              </p>
            </section>

            <section className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <ShieldCheck className="text-blue-500 w-6 h-6" /> 2. Szolgáltatások köre
              </h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <CheckCircle2 className="text-blue-500 w-5 h-5 shrink-0 mt-1" />
                  <span>Online oktatási anyagok és kurzusok biztosítása a mesterséges intelligencia témakörében.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="text-blue-500 w-5 h-5 shrink-0 mt-1" />
                  <span>Szakmai hírek, elemzések és esettanulmányok publikálása.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="text-blue-500 w-5 h-5 shrink-0 mt-1" />
                  <span>Közösségi funkciók és interaktív felületek biztosítása a regisztrált tagok számára.</span>
                </li>
              </ul>
            </section>

            <section className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Lock className="text-blue-500 w-6 h-6" /> 3. Regisztráció és adatvédelem
              </h2>
              <p className="mb-4">
                Bizonyos szolgáltatások igénybevétele regisztrációhoz kötött. A Felhasználó köteles a regisztráció során valós adatokat megadni.
              </p>
              <p>
                A Szolgáltató a Felhasználó adatait az Adatvédelmi Tájékoztatóban foglaltaknak megfelelően kezeli, azokat harmadik félnek – a jogszabályban meghatározott esetek kivételével – nem adja át.
              </p>
            </section>

            <section className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <AlertCircle className="text-blue-500 w-6 h-6" /> 4. Felelősségkorlátozás
              </h2>
              <p className="mb-4">
                A Szolgáltató mindent megtesz a weboldalon található információk pontosságáért, azonban nem vállal felelősséget az esetleges pontatlanságokból vagy technikai hibákból eredő károkért.
              </p>
              <p>
                A kurzusokban átadott ismeretek alkalmazása a Felhasználó saját felelősségére történik. A Szolgáltató nem garantál konkrét üzleti vagy anyagi eredményt a tananyagok elvégzése után.
              </p>
            </section>

            <div className="p-8 rounded-[2rem] bg-blue-600/5 border border-blue-500/10 text-center">
              <p className="text-gray-400 text-sm italic">
                Kérdés esetén forduljon hozzánk bizalommal az <a href="mailto:info@mindennapai.hu" className="text-blue-400 font-bold hover:underline">info@mindennapai.hu</a> e-mail címen.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
