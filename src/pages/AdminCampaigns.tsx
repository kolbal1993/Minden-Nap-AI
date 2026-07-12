/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AdminCampaigns — Real Firestore `campaigns` collection CRUD.
 * No localStorage, no MOCK_CAMPAIGNS.
 */

import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  BookOpen,
  Plus,
  Calendar,
  Trash2,
  Edit2,
  X,
  Target,
  Megaphone,
  Crown,
  Menu,
  Eye,
  EyeOff,
  Database,
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'all' | 'course' | 'premium';
  targetId?: string;
  targetName?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired';
  usageCount: number;
}

export default function AdminCampaigns() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: campaignsRaw,
    loading,
    error,
  } = useFirestoreCollection('campaigns', { orderBy: 'createdAt', max: 500 });

  const campaigns: Campaign[] = useMemo(() => campaignsRaw as unknown as Campaign[], [campaignsRaw]);

  const [formData, setFormData] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    type: 'all',
    discountType: 'percentage',
    discountValue: undefined,
    startDate: '',
    endDate: '',
    status: 'scheduled',
    usageCount: 0,
  });

  const handleOpenModal = (campaign?: Campaign) => {
    setActionError(null);
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({ ...campaign });
    } else {
      setEditingCampaign(null);
      setFormData({
        name: '',
        description: '',
        type: 'all',
        discountType: 'percentage',
        discountValue: undefined,
        startDate: '',
        endDate: '',
        status: 'scheduled',
        usageCount: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || formData.discountValue === undefined) return;
    setActionError(null);
    try {
      if (editingCampaign) {
        await updateDoc(doc(db, 'campaigns', editingCampaign.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'campaigns'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setIsModalOpen(false);
      setEditingCampaign(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setActionError(null);
    try {
      await deleteDoc(doc(db, 'campaigns', deleteConfirmId));
      setIsDeleteConfirmOpen(false);
      setDeleteConfirmId(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  const filteredCampaigns = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return campaigns.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(term) ||
        (c.description || '').toLowerCase().includes(term),
    );
  }, [campaigns, searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20 w-fit">
            <Eye className="w-3 h-3" /> Aktív
          </span>
        );
      case 'scheduled':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20 w-fit">
            <Calendar className="w-3 h-3" /> Ütemezett
          </span>
        );
      case 'expired':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted bg-hover px-2 py-1 rounded-md border border-main w-fit">
            <EyeOff className="w-3 h-3" /> Lejárt
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-main text-body flex font-sans transition-colors duration-300">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-main bg-glass backdrop-blur-md flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-hover rounded-xl transition-colors md:hidden text-muted hover:text-title"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-title truncate">Kampányok</h1>
            <span className="hidden sm:flex items-center gap-2 text-xs text-muted">
              <Database className="w-3.5 h-3.5" /> Firestore: {campaigns.length} kampány
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Keresés..."
                className="bg-card border border-main rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 w-48 text-title placeholder:text-muted"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Új kampány</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {actionError && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 text-sm">
              Hiba: {actionError}
            </div>
          )}

          <div className="bg-card rounded-3xl overflow-hidden shadow-xl border-none">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-500">Hiba: {error.message}</div>
            ) : filteredCampaigns.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title={searchTerm ? 'Nincs találat' : 'Még nincsenek kampányok'}
                description={
                  searchTerm
                    ? 'Próbálj más keresési feltételt.'
                    : 'Hozz létre kedvezmény- vagy prémiumkampányokat a felhasználók számára.'
                }
                cta={
                  searchTerm
                    ? undefined
                    : { label: 'Új kampány', onClick: () => handleOpenModal(), icon: Plus }
                }
              />
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-hover border-b border-main">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Név</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Kedvezmény</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Időszak</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Használat</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Státusz</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-right">Műveletek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-main">
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-hover transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-title">{campaign.name}</span>
                          <span className="text-xs text-muted line-clamp-1">{campaign.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-title">
                          {campaign.discountType === 'percentage'
                            ? `${campaign.discountValue}%`
                            : `${(campaign.discountValue || 0).toLocaleString()} Ft`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted">{campaign.startDate} → {campaign.endDate}</td>
                      <td className="px-6 py-4 text-sm font-medium text-title">{campaign.usageCount || 0}</td>
                      <td className="px-6 py-4">{getStatusBadge(campaign.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(campaign)}
                            className="p-2 rounded-lg hover:bg-blue-500/10 text-muted hover:text-blue-600 transition-all"
                            title="Szerkesztés"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(campaign.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-all"
                            title="Törlés"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
              className="relative w-full max-w-2xl bg-card border border-main rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-main bg-hover flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-title">
                  <Target className="text-blue-600" /> {editingCampaign ? 'Kampány szerkesztése' : 'Új kampány'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-card rounded-full text-muted hover:text-title">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider">Kampány neve</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Pl: Tavaszi Megújulás"
                    className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider">Leírás</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-title min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider">Kedvezmény típus</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 text-title"
                    >
                      <option value="percentage">Százalék</option>
                      <option value="fixed">Fix összeg</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider">Érték</label>
                    <input
                      type="number"
                      value={formData.discountValue || ''}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 text-title"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider">Kezdés</label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 text-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider">Vége</label>
                    <input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full bg-hover border border-main rounded-2xl px-5 py-4 text-title"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider">Típus</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-hover border border-main rounded-2xl px-5 py-4 text-title"
                  >
                    <option value="all">Összes</option>
                    <option value="course">Kurzus</option>
                    <option value="premium">Prémium</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!formData.name || formData.discountValue === undefined}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    {editingCampaign ? 'Módosítások mentése Firestore-ba' : 'Kampány létrehozása Firestore-ba'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 bg-hover hover:bg-hover/80 text-title py-4 rounded-2xl font-bold transition-all border border-main"
                  >
                    Mégse
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
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
              className="relative w-full max-w-md bg-card border border-main rounded-xl p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="text-red-500 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-center mb-2 text-title">Biztosan törölni szeretnéd?</h2>
              <p className="text-muted text-center mb-8">Ez a művelet nem vonható vissza. A kampány véglegesen törlődik.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 bg-hover hover:bg-hover/80 text-title py-4 rounded-2xl font-bold transition-all border border-main"
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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
