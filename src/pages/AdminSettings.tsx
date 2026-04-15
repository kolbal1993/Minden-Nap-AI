/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut,
  Cpu,
  BookOpen,
  Contact2,
  BarChart3,
  Users,
  Save,
  Globe,
  Mail,
  Bell,
  Shield,
  Palette,
  Megaphone
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminSettings() {
  const location = useLocation();
  const [siteName, setSiteName] = useState('Minden Nap AI');
  const [contactEmail, setContactEmail] = useState('info@mindennapai.hu');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  };

  const handleSave = () => {
    // In a real app, this would save to a backend
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex font-sans">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md flex items-center justify-between px-8">
          <h1 className="text-xl font-bold">Rendszerbeállítások</h1>
          <div className="flex items-center gap-4">
            {isSaved && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-400 text-sm font-medium"
              >
                Beállítások elmentve!
              </motion.span>
            )}
            <button 
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <Save className="w-4 h-4" /> Mentés
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl space-y-8">
            {/* General Settings */}
            <section className="bg-[#0d0d0d] border border-white/5 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="text-blue-500 w-6 h-6" />
                <h2 className="text-xl font-bold">Általános beállítások</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Weboldal neve</label>
                  <input 
                    type="text" 
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Kapcsolati email</label>
                  <input 
                    type="email" 
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="space-y-1">
                  <p className="font-bold">Karbantartási mód</p>
                  <p className="text-sm text-gray-500">Ha be van kapcsolva, az oldal nem lesz elérhető a látogatók számára.</p>
                </div>
                <button 
                  onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
                  className={`w-14 h-8 rounded-full transition-all relative ${isMaintenanceMode ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isMaintenanceMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </section>

            {/* Notification Settings */}
            <section className="bg-[#0d0d0d] border border-white/5 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="text-yellow-500 w-6 h-6" />
                <h2 className="text-xl font-bold">Értesítések</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500 focus:ring-offset-0" />
                  <span className="text-gray-300 group-hover:text-white transition-colors">Email értesítés új kapcsolatfelvételről</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500 focus:ring-offset-0" />
                  <span className="text-gray-300 group-hover:text-white transition-colors">Heti analitikai összefoglaló küldése</span>
                </label>
              </div>
            </section>

            {/* Security Settings */}
            <section className="bg-[#0d0d0d] border border-white/5 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="text-green-500 w-6 h-6" />
                <h2 className="text-xl font-bold">Biztonság</h2>
              </div>
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-sm font-bold transition-all">
                Admin jelszó megváltoztatása
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
