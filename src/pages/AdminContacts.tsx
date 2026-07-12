/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AdminContacts — Real Firestore `contacts` collection CRUD.
 * No localStorage, no mock contacts.
 */

import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Menu,
  Mail,
  Phone,
  MapPin,
  Globe,
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

interface ContactDoc {
  id: string;
  label: string;
  value: string;
  type: string;
  icon?: string;
  createdAt?: any;
}

export default function AdminContacts() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactDoc | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [formData, setFormData] = useState({ label: '', value: '', type: 'email' });

  const {
    data: contactsRaw,
    loading,
    error,
  } = useFirestoreCollection('contacts', { orderBy: 'createdAt', max: 500 });

  const contacts: ContactDoc[] = useMemo(() => contactsRaw as unknown as ContactDoc[], [contactsRaw]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'address': return MapPin;
      default: return Globe;
    }
  };

  const handleOpenModal = (contact?: ContactDoc) => {
    setActionError(null);
    if (contact) {
      setEditingContact(contact);
      setFormData({ label: contact.label, value: contact.value, type: contact.type });
    } else {
      setEditingContact(null);
      setFormData({ label: '', value: '', type: 'email' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.label || !formData.value) return;
    setActionError(null);
    try {
      if (editingContact) {
        await updateDoc(doc(db, 'contacts', editingContact.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'contacts'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setIsModalOpen(false);
      setEditingContact(null);
      setFormData({ label: '', value: '', type: 'email' });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDeleteClick = (id: string) => {
    setContactToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;
    setActionError(null);
    try {
      await deleteDoc(doc(db, 'contacts', contactToDelete));
      setIsDeleteConfirmOpen(false);
      setContactToDelete(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
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

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-20 border-b border-main bg-glass backdrop-blur-md flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-hover rounded-xl transition-colors md:hidden text-muted hover:text-title"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-title truncate">Kapcsolatok</h1>
            <span className="hidden sm:flex items-center gap-2 text-xs text-muted">
              <Database className="w-3.5 h-3.5" /> Firestore: {contacts.length} kapcsolat
            </span>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Új kapcsolat</span>
          </button>
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
            ) : contacts.length === 0 ? (
              <EmptyState
                icon={Globe}
                title="Még nincsenek kapcsolatok"
                description="Adj hozzá elérhetőségeket, hogy a látogatók megtaláljanak."
                cta={{ label: 'Új kapcsolat hozzáadása', onClick: () => handleOpenModal(), icon: Plus }}
              />
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-hover border-b border-main">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Típus</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Megnevezés</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Érték</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-right">Műveletek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-main">
                  {contacts.map((contact) => {
                    const ItemIcon = getIconForType(contact.type);
                    return (
                      <tr key={contact.id} className="hover:bg-hover transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-hover flex items-center justify-center text-muted">
                              <ItemIcon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-muted">{contact.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-title">{contact.label}</td>
                        <td className="px-6 py-4 text-sm text-body">{contact.value}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(contact)}
                              className="p-2 rounded-lg hover:bg-blue-500/10 text-muted hover:text-blue-600 transition-all"
                              title="Szerkesztés"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(contact.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-all"
                              title="Törlés"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
              className="relative w-full max-w-md bg-card border border-main rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-main bg-hover flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-3 text-title">
                  {editingContact ? <Edit2 className="text-blue-600" /> : <Plus className="text-blue-600" />}
                  {editingContact ? 'Kapcsolat szerkesztése' : 'Új kapcsolat'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-card rounded-full text-muted hover:text-title">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Típus</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-hover border border-main rounded-xl px-4 py-3 text-title"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Telefon</option>
                    <option value="address">Cím</option>
                    <option value="social">Közösségi média</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Megnevezés</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Pl: Elsődleges E-mail"
                    className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Érték</label>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Pl: info@mindennapai.hu"
                    className="w-full bg-hover border border-main rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-title"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!formData.label || !formData.value}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    {editingContact ? 'Mentés Firestore-ba' : 'Hozzáadás Firestore-ba'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 bg-hover hover:bg-hover/80 text-title py-3.5 rounded-xl font-bold border border-main"
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
              <p className="text-muted text-center mb-8">Ez a művelet nem vonható vissza. A kapcsolat véglegesen törlődik.</p>
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
    </div>
  );
}
