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
  Megaphone
} from 'lucide-react';

export default function AdminContacts() {
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

  const handleDelete = (id: number) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  };

  const navItems = [
    { name: 'Analitika', icon: BarChart3, path: '/admin/analytics' },
    { name: 'Kampányok', icon: Megaphone, path: '/admin/campaigns' },
    { name: 'Posztok', icon: FileText, path: '/admin/posts' },
    { name: 'Tudástár', icon: BookOpen, path: '/admin/tudastar' },
    { name: 'Felhasználók', icon: Users, path: '/admin/users' },
    { name: 'Kapcsolatok', icon: Contact2, path: '/admin/contacts' },
    { name: 'Beállítások', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-transparent text-gray-100 font-sans flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 flex flex-col fixed h-full bg-black/20 backdrop-blur-xl z-20">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-blue-600/20">
              <Cpu className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tighter">Minden Nap AI</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-white' : 'group-hover:text-blue-400'}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <Link 
            to="/" 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-400 transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="font-medium">Kijelentkezés</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-12">
        <div className="max-w-5xl mx-auto">
          <header className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-bold tracking-tighter mb-2">Kapcsolatok kezelése</h1>
              <p className="text-gray-500">Itt tudod módosítani az elérhetőségeket és a közösségi média linkeket.</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-5 h-5" /> Új elérhetőség
            </button>
          </header>

          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {contacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                      <contact.icon className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{contact.label}</p>
                      {contact.type === 'email' ? (
                        <a href={`mailto:${contact.value}`} className="text-lg font-medium text-white hover:text-blue-400 transition-colors">{contact.value}</a>
                      ) : contact.type === 'social' || contact.type === 'phone' ? (
                        <a 
                          href={contact.type === 'phone' ? `tel:${contact.value}` : contact.value} 
                          className="text-lg font-medium text-white hover:text-blue-400 transition-colors"
                          target={contact.type === 'social' ? "_blank" : undefined}
                          rel={contact.type === 'social' ? "noopener noreferrer" : undefined}
                        >
                          {contact.value}
                        </a>
                      ) : (
                        <p className="text-lg font-medium text-white">{contact.value}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(contact)}
                      className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(contact.id)}
                      className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
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
                  className="bg-[#0d0d0d] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative z-10"
                >
                  <h2 className="text-2xl font-bold mb-8">
                    {editingContact ? 'Elérhetőség szerkesztése' : 'Új elérhetőség hozzáadása'}
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Típus</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                      >
                        <option value="email">E-mail</option>
                        <option value="phone">Telefon</option>
                        <option value="address">Cím</option>
                        <option value="social">Közösségi média</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Megnevezés</label>
                      <input 
                        type="text" 
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        placeholder="pl. Ügyfélszolgálat"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Érték / Link</label>
                      <input 
                        type="text" 
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="pl. info@mindennapai.hu"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all"
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
        </div>
      </main>
    </div>
  );
}
