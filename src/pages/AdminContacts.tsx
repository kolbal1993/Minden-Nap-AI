/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Settings, 
  BarChart3, 
  LogOut, 
  Cpu,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Save,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Contact2,
  Edit2,
  Users,
  Megaphone,
  Bell,
  Menu,
  X
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminContacts() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Mock initial data
  const [contacts, setContacts] = useState([
    { id: 1, type: 'email', label: 'Elsődleges E-mail', value: 'info@mindennapai.hu', icon: Mail },
    { id: 2, type: 'phone', label: 'Ügyfélszolgálat', value: '+36 30 123 4567', icon: Phone },
    { id: 3, type: 'address', label: 'Központi Iroda', value: '1051 Budapest, Szent István tér 1.', icon: MapPin },
    { id: 4, type: 'social', label: 'LinkedIn', value: 'https://linkedin.com/company/mindennapai', icon: Linkedin },
    { id: 5, type: 'social', label: 'Twitter', value: 'https://twitter.com/mindennapai', icon: Twitter },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [formData, setFormData] = useState({ label: '', value: '', type: 'email' });

  const handleOpenModal = (contact?: any) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({ label: contact.label, value: contact.value, type: contact.type });
    } else {
      setEditingContact(null);
      setFormData({ label: '', value: '', type: 'email' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.label || !formData.value) return;
    
    const icons: Record<string, any> = {
      email: Mail,
      phone: Phone,
      address: MapPin,
      social: Globe
    };

    if (editingContact) {
      setContacts(contacts.map(c => c.id === editingContact.id ? { 
        ...c, 
        ...formData, 
        icon: icons[formData.type] || Globe 
      } : c));
    } else {
      const contact = {
        id: Date.now(),
        ...formData,
        icon: icons[formData.type] || Globe
      };
      setContacts([...contacts, contact]);
    }
    
    setIsModalOpen(false);
    setEditingContact(null);
    setFormData({ label: '', value: '', type: 'email' });
  };

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setContactToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (contactToDelete) {
      setContacts(contacts.filter(c => c.id !== contactToDelete));
      setIsDeleteConfirmOpen(false);
      setContactToDelete(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  };

  const navItems = [
    { name: 'Analitika', icon: BarChart3, path: '/admin/analytics' },
    { name: 'Értesítések', icon: Bell, path: '/admin/notifications' },
    { name: 'Kampányok', icon: Megaphone, path: '/admin/campaigns' },
    { name: 'Posztok', icon: FileText, path: '/admin/posts' },
    { name: 'Tudástár', icon: BookOpen, path: '/admin/tudastar' },
    { name: 'Felhasználók', icon: Users, path: '/admin/users' },
    { name: 'Kapcsolatok', icon: Contact2, path: '/admin/contacts' },
    { name: 'Beállítások', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-main text-body font-sans flex transition-colors duration-300">
      {/* Sidebar Overlay */}
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

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-20 border-b border-main bg-glass backdrop-blur-md flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-hover rounded-xl transition-colors md:hidden text-muted hover:text-title"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-title truncate">Kapcsolatok</h1>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden xs:inline">Új elérhetőség</span><span className="xs:hidden">Új</span>
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8 lg:p-12">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tighter mb-2 text-title">Elérhetőségek</h2>
              <p className="text-muted text-sm sm:text-base">Itt tudod módosítani az elérhetőségeket és a közösségi média linkeket.</p>
            </div>

          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {contacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card rounded-2xl p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-xl border-none"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-hover rounded-2xl flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                      <contact.icon className="w-6 h-6 text-muted group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{contact.label}</p>
                      {contact.type === 'email' ? (
                        <a href={`mailto:${contact.value}`} className="text-lg font-medium text-title hover:text-blue-500 transition-colors">{contact.value}</a>
                      ) : contact.type === 'social' || contact.type === 'phone' ? (
                        <a 
                          href={contact.type === 'phone' ? `tel:${contact.value}` : contact.value} 
                          className="text-lg font-medium text-title hover:text-blue-500 transition-colors"
                          target={contact.type === 'social' ? "_blank" : undefined}
                          rel={contact.type === 'social' ? "noopener noreferrer" : undefined}
                        >
                          {contact.value}
                        </a>
                      ) : (
                        <p className="text-lg font-medium text-title">{contact.value}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(contact)}
                      className="p-3 text-muted hover:text-title hover:bg-hover rounded-xl transition-all"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(contact.id)}
                      className="p-3 text-muted hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Modal */}
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
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
                  className="bg-card border border-main w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative z-10"
                >
                  <h2 className="text-2xl font-bold mb-8 text-title">
                    {editingContact ? 'Elérhetőség szerkesztése' : 'Új elérhetőség hozzáadása'}
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest ml-1">Típus</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none text-title"
                      >
                        <option value="email">E-mail</option>
                        <option value="phone">Telefon</option>
                        <option value="address">Cím</option>
                        <option value="social">Közösségi média</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest ml-1">Megnevezés</label>
                      <input 
                        type="text" 
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.currentTarget.select()}
                        placeholder="pl. Ügyfélszolgálat"
                        className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest ml-1">Érték / Link</label>
                      <input 
                        type="text" 
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.currentTarget.select()}
                        placeholder="pl. info@mindennapai.hu"
                        className="w-full bg-hover border border-main rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 bg-hover hover:bg-hover/80 text-title py-4 rounded-2xl font-bold transition-all border border-main"
                      >
                        Mégse
                      </button>
                      <button 
                        onClick={handleSave}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                      >
                        <Save className="w-5 h-5" /> Mentés
                      </button>
                    </div>
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
                  className="relative w-full max-w-md bg-card border border-main rounded-[2rem] p-8 shadow-2xl"
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
      </div>
    </main>
  </div>
  );
}
