/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Users, Plus, Check, Loader2, Camera } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, getDocs, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { ChatService } from '../lib/ChatService';

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  publicKey?: string;
}

interface GroupCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (groupId: string) => void;
}

export default function GroupCreationModal({ isOpen, onClose, onCreated }: GroupCreationModalProps) {
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const chatService = new ChatService();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), limit(50));
      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(u => u.uid !== auth.currentUser?.uid && u.publicKey); // Csak titkosítással rendelkezőket
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const toggleUser = (uid: string) => {
    setSelectedUsers(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.length === 0 || !auth.currentUser) return;

    setIsCreating(true);
    try {
      // 1. Beszélgetés létrehozása a Firestore-ban
      const participants = [auth.currentUser.uid, ...selectedUsers];
      const conversationsRef = collection(db, 'conversations');
      
      const newConv = await addDoc(conversationsRef, {
        name: groupName,
        avatar: groupAvatar || `https://picsum.photos/seed/${groupName}/200/200`,
        isGroup: true,
        participants: participants,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        lastMessage: {
          text: 'Csoport létrehozva',
          senderId: auth.currentUser.uid,
          timestamp: serverTimestamp()
        }
      });

      // 2. Csoportkulcs generálása és megosztása
      await chatService.createOrRotateGroupKey(newConv.id, participants);

      onCreated(newConv.id);
      onClose();
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Hiba történt a csoport létrehozása közben.');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = availableUsers.filter(u => 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0d0d0d] border border-black/10 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Új titkosított csoport</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              {/* Group Info */}
              <div className="flex gap-6 items-start">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center overflow-hidden">
                    {groupAvatar ? (
                      <img src={groupAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                    )}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Avatar URL"
                    value={groupAvatar}
                    onChange={(e) => setGroupAvatar(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 block">Csoport neve</label>
                  <input 
                    type="text" 
                    placeholder="Pl. Projekt Csapat"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* User Search */}
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-4 block">Tagok hozzáadása ({selectedUsers.length})</label>
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Tagok keresése..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.uid}
                      onClick={() => toggleUser(user.uid)}
                      className={`w-full p-3 flex items-center gap-4 rounded-2xl transition-all text-left group ${selectedUsers.includes(user.uid) ? 'bg-blue-600/10 border border-blue-600/20' : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'}`}
                    >
                      <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover border border-black/10 dark:border-white/10" />
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">{user.displayName}</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">E2EE Aktív</p>
                      </div>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${selectedUsers.includes(user.uid) ? 'bg-blue-600 text-white' : 'bg-black/5 dark:bg-white/5 text-transparent group-hover:text-gray-400 dark:group-hover:text-gray-600'}`}>
                        <Check className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5">
              <button
                onClick={handleCreate}
                disabled={isCreating || !groupName.trim() || selectedUsers.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Csoport létrehozása...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Csoport létrehozása
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
