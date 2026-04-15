/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Loader2, Download, Upload, Key, X } from 'lucide-react';
import { SecurityManager } from '../lib/SecurityManager';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

/**
 * SecuritySettings Component - Kezeli a végpontok közötti titkosítás (E2EE) aktiválását.
 */
export default function SecuritySettings() {
  const [isE2EE, setIsE2EE] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [password, setPassword] = useState('');
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const securityManager = new SecurityManager();

  useEffect(() => {
    const checkSecurityStatus = async () => {
      if (!auth.currentUser) return;
      
      try {
        // Firebase hívás: Lekérjük a felhasználó aktuális biztonsági állapotát
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setIsE2EE(userDoc.data().isE2EEActive || false);
        }
      } catch (error) {
        console.error("Error checking security status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSecurityStatus();
  }, []);

  const handleToggleE2EE = async () => {
    if (!auth.currentUser) return;
    
    const newStatus = !isE2EE;
    const confirmMessage = newStatus 
      ? "Figyelem: E2EE módban az üzenetek csak ezen az eszközön lesznek olvashatók. A kulcs elvesztése adatvesztéssel jár. Biztosan bekapcsolod?"
      : "Biztosan kikapcsolod a végpontok közötti titkosítást? A korábbi titkosított üzeneteid olvashatatlanok lesznek.";

    if (!window.confirm(confirmMessage)) return;

    setIsProcessing(true);
    try {
      if (newStatus) {
        // 1. Kulcsok generálása és mentése IndexedDB-be
        const publicKeyBase64 = await securityManager.setupSecurity('E2EE');
        
        // 2. Firebase hívás: Publikus kulcs feltöltése és állapot frissítése
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          isE2EEActive: true,
          publicKey: publicKeyBase64, // Ezt használják majd mások a neked küldött üzenetek titkosításához
          updatedAt: new Date()
        });
      } else {
        // 1. Helyi kulcsok törlése
        await securityManager.setupSecurity('NONE');
        
        // 2. Firebase hívás: Állapot törlése
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          isE2EEActive: false,
          publicKey: null
        });
      }
      
      setIsE2EE(newStatus);
    } catch (error) {
      console.error("Security setup failed:", error);
      alert("Hiba történt a biztonsági beállítások módosítása közben.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setIsProcessing(true);
    try {
      const backupData = await securityManager.exportBackupKey(password);
      
      // Fájl letöltése
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowBackupModal(false);
      setPassword('');
      alert("A biztonsági mentés sikeresen elkészült és letöltődött.");
    } catch (error) {
      console.error("Backup failed:", error);
      alert("Hiba történt a mentés során. Ellenőrizd, hogy be van-e kapcsolva az E2EE.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !backupFile) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          await securityManager.importBackupKey(content, password);
          
          // Firebase frissítés (hogy tudjuk, van kulcsunk)
          if (auth.currentUser) {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, { isE2EEActive: true });
            setIsE2EE(true);
          }
          
          setShowRestoreModal(false);
          setPassword('');
          setBackupFile(null);
          alert("A kulcs sikeresen visszaállítva!");
        } catch (err) {
          alert("Hibás jelszó vagy sérült mentési fájl!");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsText(backupFile);
    } catch (error) {
      console.error("Restore failed:", error);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[60px] -z-10" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl ${isE2EE ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
            {isE2EE ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Végpontok közötti titkosítás (E2EE)
              {isE2EE && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Aktív</span>}
            </h3>
            <p className="text-gray-400 text-sm mt-1 max-w-md">
              A legmagasabb szintű biztonság. Az üzeneteidet csak te és a címzett olvashatja. 
              Senki más, még a szerver üzemeltetője sem látja a tartalmukat.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <button
            onClick={handleToggleE2EE}
            disabled={isProcessing}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${isE2EE ? 'bg-blue-600' : 'bg-white/10'}`}
          >
            <span className="sr-only">E2EE Toggle</span>
            <motion.span
              animate={{ x: isE2EE ? 28 : 4 }}
              className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
            />
          </button>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {isProcessing ? 'Feldolgozás...' : (isE2EE ? 'Bekapcsolva' : 'Kikapcsolva')}
          </span>
        </div>
      </div>

      {isE2EE && (
        <>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-4"
          >
            <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div className="text-xs text-orange-200/80 leading-relaxed">
              <p className="font-bold text-orange-400 mb-1 uppercase tracking-wider">Fontos figyelmeztetés</p>
              Figyelem: E2EE módban az üzenetek csak ezen az eszközön lesznek olvashatók. 
              A privát kulcsot a böngésződ biztonságos tárolójában (IndexedDB) őrizzük. 
              Ha törlöd a böngésző adatait vagy másik eszközre váltasz, a korábbi üzeneteidhez nem fogsz tudni hozzáférni. 
              A kulcs elvesztése végleges adatvesztéssel jár.
            </div>
          </motion.div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowBackupModal(true)}
              className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl transition-all group"
            >
              <Download className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="text-sm font-bold">Biztonsági mentés</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Kulcs exportálása</p>
              </div>
            </button>

            <button
              onClick={() => setShowRestoreModal(true)}
              className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl transition-all group"
            >
              <Upload className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="text-sm font-bold">Visszaállítás</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Kulcs importálása</p>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Backup Modal */}
      <AnimatePresence>
        {showBackupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Biztonsági mentés</h3>
                <button onClick={() => setShowBackupModal(false)} className="text-gray-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleBackup} className="space-y-6">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0" />
                  <p className="text-xs text-blue-200/80">
                    Adj meg egy jelszót a kulcs titkosításához. Ezt a jelszót nem tudjuk visszaállítani!
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mentési jelszó</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-50 text-white hover:text-blue-600 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Mentés letöltése"}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showRestoreModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Kulcs visszaállítása</h3>
                <button onClick={() => setShowRestoreModal(false)} className="text-gray-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleRestore} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mentési fájl</label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Jelszó</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !backupFile}
                  className="w-full bg-purple-600 hover:bg-purple-50 text-white hover:text-purple-600 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Visszaállítás indítása"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
