/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, UserMinus, Shield, Loader2, Search, Check, AlertTriangle } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { ChatService } from '../lib/ChatService';

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  publicKey?: string;
}

interface GroupSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  participants: string[];
  groupName: string;
}

export default function GroupSettings({ isOpen, onClose, groupId, participants, groupName }: GroupSettingsProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'add'>('members');
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatService = new ChatService();

  useEffect(() => {
    if (isOpen) {
      fetchMemberProfiles();
      if (activeTab === 'add') fetchAvailableUsers();
    }
  }, [isOpen, activeTab, participants]);

  const fetchMemberProfiles = async () => {
    try {
      const profiles = await Promise.all(participants.map(async (uid) => {
        const userDoc = await getDoc(doc(db, 'users', uid));
        return userDoc.data() as UserProfile;
      }));
      setMemberProfiles(profiles.filter(p => p !== undefined));
    } catch (error) {
      console.error('Error fetching member profiles:', error);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const q = query(collection(db, 'users'), limit(50));
      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(u => !participants.includes(u.uid) && u.publicKey);
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const handleAddMember = async (uid: string) => {
    setIsProcessing(true);
    try {
      await chatService.addParticipantToGroup(groupId, uid);
      // A participants prop frissülni fog a MessagesPage-en keresztül
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Hiba történt a tag hozzáadása közben.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveMember = async (uid: string) => {
    if (uid === auth.currentUser?.uid) {
      alert('Magadat nem távolíthatod el a csoportból.');
      return;
    }
    
    if (!confirm('Biztosan eltávolítod ezt a tagot? Ez azonnali kulcs-rotációt (Key Rotation) von maga után.')) return;

    setIsProcessing(true);
    try {
      await chatService.removeParticipantFromGroup(groupId, uid);
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Hiba történt a tag eltávolítása közben.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-[#0d0d0d] border border-black/10 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
              <div>
                <h2 className="text-xl font-bold tracking-tight truncate max-w-[200px] text-gray-900 dark:text-white">{groupName}</h2>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest font-bold mt-1">Csoportbeállítások</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-black/5 dark:border-white/5">
              <button 
                onClick={() => setActiveTab('members')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'members' ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-600/5 dark:bg-blue-400/5' : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Tagok ({participants.length})
              </button>
              <button 
                onClick={() => setActiveTab('add')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'add' ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-600/5 dark:bg-blue-400/5' : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Hozzáadás
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {activeTab === 'members' ? (
                memberProfiles.map((user) => (
                  <div key={user.uid} className="w-full p-4 flex items-center gap-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 group">
                    <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover border border-black/10 dark:border-white/10" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate text-gray-900 dark:text-white">{user.displayName} {user.uid === auth.currentUser?.uid && '(Te)'}</h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Tag</p>
                    </div>
                    {user.uid !== auth.currentUser?.uid && (
                      <button 
                        onClick={() => handleRemoveMember(user.uid)}
                        disabled={isProcessing}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <UserMinus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <>
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
                  <div className="space-y-2">
                    {availableUsers
                      .filter(u => u.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((user) => (
                      <button
                        key={user.uid}
                        onClick={() => handleAddMember(user.uid)}
                        disabled={isProcessing}
                        className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all text-left border border-transparent hover:border-black/5 dark:hover:border-white/5"
                      >
                        <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover border border-black/10 dark:border-white/10" />
                        <div className="flex-1">
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white">{user.displayName}</h3>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">E2EE Elérhető</p>
                        </div>
                        <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-6 bg-blue-600/5 border-t border-black/5 dark:border-white/5">
              <div className="flex items-start gap-3 p-4 bg-blue-600/10 rounded-2xl border border-blue-600/20">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                  A tagok módosítása automatikusan frissíti a titkosítási kulcsokat. Az eltávolított tagok nem férhetnek hozzá az új üzenetekhez.
                </p>
              </div>
            </div>

            {isProcessing && (
              <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50">
                <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl border border-black/10 dark:border-white/10 flex flex-col items-center gap-4 shadow-2xl">
                  <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-500 animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Kulcsok frissítése...</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
