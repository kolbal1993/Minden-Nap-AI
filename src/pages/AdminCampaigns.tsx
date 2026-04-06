/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut,
  Cpu,
  BookOpen,
  Contact2,
  BarChart3,
  Users,
  Tag,
  Plus,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Percent,
  Gift,
  Target,
  Megaphone,
  Crown,
  Bell
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'all' | 'course' | 'premium';
  targetId?: string; // Course ID if type is 'course'
  targetName?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired';
  usageCount: number;
}

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Tavaszi Megújulás',
    description: '20% kedvezmény mindenre az oldalon.',
    type: 'all',
    discountType: 'percentage',
    discountValue: 20,
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    status: 'active',
    usageCount: 145
  },
  {
    id: '2',
    name: 'AI Alapok Akció',
    description: 'Féláron az AI Alapok tananyag.',
    type: 'course',
    targetId: 'course_1',
    targetName: 'Bevezetés az AI világába',
    discountType: 'percentage',
    discountValue: 50,
    startDate: '2026-05-01',
    endDate: '2026-05-15',
    status: 'scheduled',
    usageCount: 0
  },
  {
    id: '3',
    name: 'Prémium Évforduló',
    description: '5000 Ft kedvezmény az éves prémium tagságból.',
    type: 'premium',
    discountType: 'fixed',
    discountValue: 5000,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    status: 'expired',
    usageCount: 89
  }
];

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setCampaigns(campaigns.filter(c => c.id !== deleteConfirmId));
      setIsDeleteConfirmOpen(false);
      setDeleteConfirmId(null);
    }
  };

  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    type: 'all',
    discountType: 'percentage',
    discountValue: undefined,
    startDate: '',
    endDate: '',
    status: 'scheduled'
  });

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  };

  const handleOpenModal = (campaign?: Campaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setNewCampaign({ ...campaign });
    } else {
      setEditingCampaign(null);
      setNewCampaign({
        name: '',
        description: '',
        type: 'all',
        discountType: 'percentage',
        discountValue: undefined,
        startDate: '',
        endDate: '',
        status: 'scheduled'
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveCampaign = () => {
    if (editingCampaign) {
      setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? { ...c, ...newCampaign } as Campaign : c));
    } else {
      const id = Math.random().toString(36).substr(2, 9);
      setCampaigns([...campaigns, { ...newCampaign, id, usageCount: 0 } as Campaign]);
    }
    setIsModalOpen(false);
    setEditingCampaign(null);
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    setDeleteConfirmId(null);
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex font-sans">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">Kampányok Kezelése</h1>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" /> Új Kampány
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Keresés kampányok között..." 
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <motion.div 
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0d0d0d] border border-white/5 rounded-[2rem] p-6 relative overflow-hidden group"
              >
                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${
                    campaign.status === 'active' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
                    campaign.status === 'scheduled' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                    'text-gray-500 bg-white/5 border-white/10'
                  }`}>
                    {campaign.status === 'active' ? 'Aktív' : campaign.status === 'scheduled' ? 'Ütemezett' : 'Lejárt'}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    campaign.type === 'all' ? 'bg-purple-500/10 text-purple-500' :
                    campaign.type === 'course' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-orange-500/10 text-orange-500'
                  }`}>
                    {campaign.type === 'all' ? <Target className="w-6 h-6" /> :
                     campaign.type === 'course' ? <BookOpen className="w-6 h-6" /> :
                     <Crown className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{campaign.name}</h3>
                    <p className="text-xs text-gray-500">
                      {campaign.type === 'all' ? 'Teljes oldal' : 
                       campaign.type === 'course' ? `Tananyag: ${campaign.targetName}` : 
                       'Prémium tagság'}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-6 line-clamp-2">{campaign.description}</p>

                <div className="bg-white/5 rounded-2xl p-4 mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Kedvezmény</p>
                    <p className="text-2xl font-black text-white">
                      {campaign.discountType === 'percentage' ? `${campaign.discountValue}%` : `-${campaign.discountValue} Ft`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Használat</p>
                    <p className="text-xl font-bold text-blue-400">{campaign.usageCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {campaign.startDate} - {campaign.endDate}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(campaign)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Szerkesztés
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(campaign.id)}
                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Create Campaign Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <Megaphone className="text-blue-500 w-6 h-6" />
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-2xl font-bold mb-2">
                {editingCampaign ? 'Kampány szerkesztése' : 'Új kampány létrehozása'}
              </h2>
              <p className="text-gray-400 text-sm mb-8">Állíts be kedvezményeket egy meghatározott időszakra.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Kampány neve</label>
                    <input 
                      type="text" 
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                      placeholder="Pl. Nyári Akció"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Típus</label>
                    <div className="relative">
                      <select 
                        value={newCampaign.type}
                        onChange={(e) => setNewCampaign({...newCampaign, type: e.target.value as any})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 appearance-none transition-colors"
                      >
                        <option value="all">Teljes oldal</option>
                        <option value="course">Egyes tananyag</option>
                        <option value="premium">Prémium tagság</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <Plus className="w-4 h-4 rotate-45" />
                      </div>
                    </div>
                  </div>
                  {newCampaign.type === 'course' && (
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Tananyag kiválasztása</label>
                      <div className="relative">
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 appearance-none transition-colors"
                        >
                          <option value="1">Bevezetés az AI világába</option>
                          <option value="2">Prompt Engineering Mesterkurzus</option>
                          <option value="3">AI a marketingben</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <Plus className="w-4 h-4 rotate-45" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Leírás</label>
                    <textarea 
                      value={newCampaign.description}
                      onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                      placeholder="Rövid leírás a kampányról..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_0.6fr] gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Kedvezmény típusa</label>
                      <div className="relative">
                        <select 
                          value={newCampaign.discountType}
                          onChange={(e) => setNewCampaign({...newCampaign, discountType: e.target.value as any})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 appearance-none transition-colors"
                        >
                          <option value="percentage">Százalék (%)</option>
                          <option value="fixed">Fix összeg (Ft)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <Plus className="w-4 h-4 rotate-45" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Érték</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        value={newCampaign.discountValue ?? ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setNewCampaign({...newCampaign, discountValue: val === '' ? undefined : parseInt(val)});
                        }}
                        placeholder="0"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Kezdés</label>
                      <input 
                        type="date" 
                        value={newCampaign.startDate}
                        onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Vége</label>
                      <input 
                        type="date" 
                        value={newCampaign.endDate}
                        onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Státusz</label>
                    <div className="relative">
                      <select 
                        value={newCampaign.status}
                        onChange={(e) => setNewCampaign({...newCampaign, status: e.target.value as any})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 appearance-none transition-colors"
                      >
                        <option value="active">Aktív</option>
                        <option value="scheduled">Ütemezett</option>
                        <option value="expired">Lejárt</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <Plus className="w-4 h-4 rotate-45" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCampaign(null);
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all"
                >
                  Mégse
                </button>
                <button 
                  onClick={handleSaveCampaign}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                  {editingCampaign ? 'Módosítások mentése' : 'Kampány létrehozása'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="text-red-500 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-center mb-2">Biztosan törölni szeretnéd?</h2>
              <p className="text-gray-400 text-center mb-8">Ez a művelet nem vonható vissza. A kampány véglegesen törlődik.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all"
                >
                  Mégse
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20"
                >
                  Törlés
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
