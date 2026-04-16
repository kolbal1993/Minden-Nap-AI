import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Image as ImageIcon, 
  Smile, 
  Plus,
  MessageSquare,
  ChevronLeft,
  X,
  CheckCheck,
  Paperclip,
  Loader2,
  Users,
  Shield,
  Lock,
  Sparkles
} from 'lucide-react';
import { 
  db, 
  auth, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { ChatService } from '../lib/ChatService';
import SecureFileMessage from '../components/SecureFileMessage';
import GroupCreationModal from '../components/GroupCreationModal';
import GroupSettings from '../components/GroupSettings';
import { useToast } from '../components/ToastProvider';
import { 
  generateKeyPair, 
  exportPublicKey, 
  importPublicKey, 
  generateSymmetricKey, 
  exportSymmetricKey, 
  importSymmetricKey, 
  encryptSymmetricKey, 
  decryptSymmetricKey, 
  encryptMessage, 
  decryptMessage 
} from '../lib/cryptoUtils';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  orderBy, 
  doc, 
  updateDoc, 
  setDoc, 
  getDocs,
  limit,
  Timestamp,
  getDoc,
  increment
} from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Message {
  id: string;
  text: string;
  decryptedText?: string;
  senderId: string;
  timestamp: any;
  type: 'text' | 'image' | 'file';
  isEncrypted?: boolean;
  isGroupMessage?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  iv?: string;
  encryptedKey?: string;
}

interface Conversation {
  id: string;
  participants: string[];
  isGroup?: boolean;
  name?: string;
  avatar?: string;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: any;
  };
  unreadCount?: Record<string, number>;
  otherUser?: UserProfile;
}

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  status?: string;
  lastSeen?: any;
  publicKey?: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ phase: string, percent: number } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [activeSymKey, setActiveSymKey] = useState<CryptoKey | null>(null);
  
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const chatService = new ChatService();
  const { showToast } = useToast();

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          await ensureKeyPair(user);
          syncUserProfile(user);
          unsubscribeSnapshot = loadConversations(user.uid);
          setIsLoading(false);
        } catch (error) {
          console.error('Error during auth initialization:', error);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const ensureKeyPair = async (user: any) => {
    const storedPrivKey = localStorage.getItem(`priv_key_${user.uid}`);
    if (storedPrivKey) {
      // In a real app, we'd import the private key from a secure store
      // For this demo, we'll generate and store it in memory/localStorage
      // (Note: localStorage is not ideal for private keys, but better than Firestore)
      try {
        const jwk = JSON.parse(storedPrivKey);
        const privKey = await window.crypto.subtle.importKey(
          "jwk",
          jwk,
          {
            name: "RSA-OAEP",
            hash: "SHA-256",
          },
          true,
          ["decrypt"]
        );
        setPrivateKey(privKey);
        return;
      } catch (e) {
        console.error("Error importing private key:", e);
      }
    }

    // Generate new pair
    const pair = await generateKeyPair();
    const exportedPublic = await exportPublicKey(pair.publicKey);
    const exportedPrivate = await window.crypto.subtle.exportKey("jwk", pair.privateKey);
    
    localStorage.setItem(`priv_key_${user.uid}`, JSON.stringify(exportedPrivate));
    localStorage.setItem(`pub_key_${user.uid}`, exportedPublic);
    setPrivateKey(pair.privateKey);
  };

  useEffect(() => {
    if (activeConversation && currentUser) {
      // Valós idejű üzenetfigyelés automatikus dekódolással
      const unsubscribe = chatService.listenToChat(activeConversation.id, (msgs) => {
        setMessages(msgs);
        scrollToBottom();
        
        // Olvasatlanság törlése
        const convRef = doc(db, 'conversations', activeConversation.id);
        updateDoc(convRef, {
          [`unreadCount.${currentUser.uid}`]: 0
        }).catch(err => console.error('Error resetting unread count:', err));
      });

      return () => unsubscribe();
    }
  }, [activeConversation, currentUser]);

  const syncUserProfile = async (user: any) => {
    const userRef = doc(db, 'users', user.uid);
    const pubKey = localStorage.getItem(`pub_key_${user.uid}`);
    try {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        lastSeen: serverTimestamp(),
        status: 'online',
        publicKey: pubKey
      }, { merge: true });
    } catch (error) {
      console.error('Error syncing user profile:', error);
    }
  };

  const loadConversations = (uid: string) => {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const convs = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data() as Conversation;
        const otherUserId = data.participants.find((p: string) => p !== uid);
        
        let otherUser: UserProfile | undefined;
        if (otherUserId) {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            otherUser = userDoc.data() as UserProfile;
          }
        }

        // Smart Preview Decryption
        let previewText = data.lastMessage?.text || '';
        if (data.lastMessage && data.lastMessage.text && data.lastMessage.text.startsWith('{"encryptedMessage"')) {
          try {
            const msgData = JSON.parse(data.lastMessage.text);
            previewText = await chatService.decryptSmartPreview(docSnapshot.id, {
              ...msgData,
              isEncrypted: true,
              isGroupMessage: data.isGroup
            });
          } catch (e) {
            previewText = "🔒 Titkosított tartalom";
          }
        } else if (data.lastMessage?.text === '[Titkosított üzenet]' || data.lastMessage?.text === '[Titkosított csoportos üzenet]') {
          previewText = "🔒 Titkosított tartalom";
        }

        return {
          id: docSnapshot.id,
          ...data,
          otherUser,
          lastMessage: data.lastMessage ? { ...data.lastMessage, text: previewText } : undefined
        } as Conversation;
      }));

      // Sort by last message timestamp
      convs.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp?.toMillis() || 0;
        const timeB = b.lastMessage?.timestamp?.toMillis() || 0;
        return timeB - timeA;
      });

      setConversations(convs);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'conversations');
    });

    return unsubscribe;
  };

  useEffect(() => {
    if (activeConversation && currentUser) {
      const unsubscribeTyping = chatService.listenToTyping(activeConversation.id, (users) => {
        setTypingUsers(users);
      });
      return () => unsubscribeTyping();
    }
  }, [activeConversation, currentUser]);

  const handleTyping = () => {
    if (!activeConversation || !currentUser) return;
    
    chatService.setTypingStatus(activeConversation.id, true);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      chatService.setTypingStatus(activeConversation.id, false);
    }, 3000);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation || !currentUser) return;

    const otherUserId = activeConversation.participants.find(p => p !== currentUser.uid);
    if (!otherUserId) return;

    setIsUploading(true);
    setUploadProgress({ phase: 'Titkosítás...', percent: 30 });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Kis késleltetés a vizualizációhoz
      setUploadProgress({ phase: 'Feltöltés...', percent: 60 });
      
      await chatService.uploadSecureFile(file, otherUserId, activeConversation.id);
      
      setUploadProgress({ phase: 'Kész!', percent: 100 });
      showToast("Fájl sikeresen elküldve", "success");

      // Update conversation last message
      const convRef = doc(db, 'conversations', activeConversation.id);
      await updateDoc(convRef, {
        lastMessage: {
          text: "[Titkosított fájl]",
          senderId: currentUser.uid,
          timestamp: serverTimestamp()
        },
        [`unreadCount.${otherUserId}`]: increment(1)
      });
    } catch (error: any) {
      console.error("File upload failed:", error);
      showToast(error.message === "RECIPIENT_E2EE_NOT_ACTIVE" 
        ? "A címzettnél nincs bekapcsolva a titkosítás."
        : "Hiba történt a feltöltés közben.", "error");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(null);
      }, 1000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeConversation || !currentUser) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      if (activeConversation.isGroup) {
        // Csoportos üzenet küldése
        await chatService.sendGroupMessage(activeConversation.id, messageText);
      } else {
        // 1:1 üzenet küldése (Smart Message)
        const otherUserId = activeConversation.participants.find(p => p !== currentUser.uid);
        if (!otherUserId) return;
        await chatService.sendSmartMessage(otherUserId, activeConversation.id, messageText);
      }

      const convRef = doc(db, 'conversations', activeConversation.id);
      const otherUserIds = activeConversation.participants.filter(p => p !== currentUser.uid);
      
      const updateData: any = {
        lastMessage: {
          text: activeConversation.isGroup ? `[Titkosított csoportos üzenet]` : "[Titkosított üzenet]",
          senderId: currentUser.uid,
          timestamp: serverTimestamp()
        }
      };

      otherUserIds.forEach(uid => {
        updateData[`unreadCount.${uid}`] = increment(1);
      });

      await updateDoc(convRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `conversations/${activeConversation.id}/messages`);
    }
  };

  const startNewConversation = async (otherUser: UserProfile) => {
    if (!currentUser || !privateKey) return;

    // Check if conversation already exists
    const existing = conversations.find(c => 
      c.participants.includes(otherUser.uid) && c.participants.includes(currentUser.uid)
    );

    if (existing) {
      setActiveConversation(existing);
      setIsNewChatModalOpen(false);
      return;
    }

    if (!otherUser.publicKey) {
      alert("Ez a felhasználó még nem állította be a titkosítást. Kérd meg, hogy jelentkezzen be az üzenetekhez!");
      return;
    }

    try {
      const convRef = collection(db, 'conversations');
      const newConv = await addDoc(convRef, {
        participants: [currentUser.uid, otherUser.uid],
        unreadCount: {
          [currentUser.uid]: 0,
          [otherUser.uid]: 0
        },
        lastMessage: {
          text: 'Beszélgetés elindítva (E2EE)',
          senderId: currentUser.uid,
          timestamp: serverTimestamp()
        }
      });

      // Generate and encrypt symmetric key
      const symKey = await generateSymmetricKey();
      const myPubKey = await importPublicKey(localStorage.getItem(`pub_key_${currentUser.uid}`)!);
      const otherPubKey = await importPublicKey(otherUser.publicKey);

      const myEncryptedKey = await encryptSymmetricKey(symKey, myPubKey);
      const otherEncryptedKey = await encryptSymmetricKey(symKey, otherPubKey);

      await setDoc(doc(db, 'conversations', newConv.id, 'keys', currentUser.uid), { key: myEncryptedKey });
      await setDoc(doc(db, 'conversations', newConv.id, 'keys', otherUser.uid), { key: otherEncryptedKey });

      setActiveConversation({
        id: newConv.id,
        participants: [currentUser.uid, otherUser.uid],
        otherUser
      });
      setIsNewChatModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'conversations');
    }
  };

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), limit(20));
      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(u => u.uid !== currentUser?.uid);
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (isNewChatModalOpen) {
      fetchUsers();
    }
  }, [isNewChatModalOpen]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-main flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted font-bold uppercase tracking-widest text-[10px]">Üzenetek betöltése...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-main flex flex-col transition-colors duration-300">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 pt-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-8"
          >
            <MessageSquare className="w-10 h-10 text-blue-600" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-4 text-title tracking-tight">Jelentkezz be az üzenetküldéshez</h1>
          <p className="text-muted mb-10 text-center max-w-md leading-relaxed">
            Az üzenetküldés funkció használatához be kell jelentkezned a fiókodba. Minden üzenet végpontok közötti titkosítással védett.
          </p>
          <button 
            onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95"
          >
            Bejelentkezés
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main text-body font-sans flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 pt-20 flex overflow-hidden h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-main flex flex-col bg-card transition-all ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-main">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold tracking-tighter text-title">Üzenetek</h1>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsGroupModalOpen(true)}
                  title="Új csoport"
                  className="w-10 h-10 bg-hover text-body rounded-xl flex items-center justify-center hover:bg-hover hover:text-title transition-all"
                >
                  <Users className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsNewChatModalOpen(true)}
                  title="Új chat"
                  className="w-10 h-10 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input 
                type="text" 
                placeholder="Keresés beszélgetésekben..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => { setSearchTerm(''); e.target.select(); }}
                onClick={(e) => e.currentTarget.select()}
                className="w-full bg-card border border-main rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations.length === 0 && !isLoading ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-hover rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="text-muted w-8 h-8" />
                </div>
                <p className="text-body text-sm">Nincsenek még beszélgetéseid.</p>
                <button 
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="text-blue-600 dark:text-blue-400 text-sm font-bold mt-2 hover:underline"
                >
                  Indíts egyet most!
                </button>
              </div>
            ) : (
              conversations
                .filter(c => (c.otherUser?.displayName || c.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
                .map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full p-4 flex items-center gap-4 hover:bg-hover transition-all text-left border-l-4 ${activeConversation?.id === conv.id ? 'bg-blue-600/5 border-blue-600' : 'border-transparent'}`}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={conv.isGroup ? (conv.avatar || `https://picsum.photos/seed/${conv.id}/100/100`) : (conv.otherUser?.photoURL || `https://picsum.photos/seed/${conv.id}/100/100`)} 
                      alt={conv.isGroup ? conv.name : conv.otherUser?.displayName} 
                      className={`w-12 h-12 object-cover border border-main ${conv.isGroup ? 'rounded-2xl' : 'rounded-full'}`}
                    />
                    {!conv.isGroup && conv.otherUser?.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-main rounded-full" />
                    )}
                    {conv.isGroup && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center border-2 border-main">
                        <Users className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm truncate text-title">{conv.isGroup ? conv.name : (conv.otherUser?.displayName || 'Unknown User')}</h3>
                      <span className="text-[10px] text-muted">{formatTime(conv.lastMessage?.timestamp)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${conv.unreadCount?.[currentUser?.uid] ? 'text-title font-bold' : 'text-body'}`}>
                        {conv.lastMessage?.senderId === currentUser?.uid ? 'Te: ' : ''}
                        {conv.lastMessage?.text}
                      </p>
                      {conv.unreadCount?.[currentUser?.uid] ? (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {conv.unreadCount[currentUser.uid]}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col bg-main relative ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <header className="h-20 border-b border-main px-6 flex items-center justify-between bg-glass backdrop-blur-md">
                <div 
                  className={`flex items-center gap-4 ${activeConversation.isGroup ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={() => activeConversation.isGroup && setIsGroupSettingsOpen(true)}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveConversation(null); }}
                    className="md:hidden p-2 -ml-2 text-muted hover:text-title"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="relative">
                    <img 
                      src={activeConversation.isGroup ? activeConversation.avatar : activeConversation.otherUser?.photoURL} 
                      alt="" 
                      className={`w-10 h-10 object-cover border border-main ${activeConversation.isGroup ? 'rounded-xl' : 'rounded-full'}`}
                    />
                    {!activeConversation.isGroup && activeConversation.otherUser?.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-main rounded-full" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-title">{activeConversation.isGroup ? activeConversation.name : activeConversation.otherUser?.displayName}</h2>
                    <p className={`text-[10px] uppercase tracking-widest font-bold ${activeConversation.isGroup ? 'text-blue-600 dark:text-blue-400' : 'text-green-500'}`}>
                      {activeConversation.isGroup ? `${activeConversation.participants.length} tag • E2EE` : (activeConversation.otherUser?.status === 'online' ? 'Online' : 'Offline')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeConversation.isGroup && (
                    <div className="flex items-center gap-1 mr-2 px-3 py-1.5 bg-blue-600/10 rounded-lg border border-blue-600/20">
                      <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Csoportos E2EE</span>
                    </div>
                  )}
                  <button className="p-2.5 text-muted hover:text-title hover:bg-hover rounded-xl transition-all">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 text-muted hover:text-title hover:bg-hover rounded-xl transition-all">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 text-muted hover:text-title hover:bg-hover rounded-xl transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </header>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.map((msg, index) => {
                  const isMe = msg.senderId === currentUser?.uid;
                  const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-3`}>
                      {!isMe && (
                        <div className="w-8 h-8 shrink-0">
                          {showAvatar && (
                            <img 
                              src={activeConversation.otherUser?.photoURL} 
                              alt="" 
                              className="w-8 h-8 rounded-full object-cover border border-main"
                            />
                          )}
                        </div>
                      )}
                      <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        {msg.type === 'file' ? (
                          <SecureFileMessage message={msg} />
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-2xl text-sm leading-relaxed relative group/msg ${
                            isMe 
                              ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-600/10' 
                              : 'bg-hover text-body rounded-bl-none border border-main'
                          }`}>
                            <AnimatePresence mode="wait">
                              {msg.decryptedText ? (
                                <motion.div
                                  key="decrypted"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="flex items-start gap-2"
                                >
                                  <span>{msg.decryptedText}</span>
                                  {msg.isEncrypted && (
                                    <Lock className="w-3 h-3 text-white/40 mt-1 shrink-0" />
                                  )}
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="decrypting"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center gap-2 text-muted italic"
                                >
                                  <Loader2 className="w-3 h-3 animate-spin" /> 
                                  <span>Visszafejtés...</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                        <div className={`flex items-center gap-1.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[9px] text-muted font-medium">{formatTime(msg.timestamp)}</span>
                          {isMe && (
                            <CheckCheck className="w-3 h-3 text-blue-600 dark:text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing Indicator */}
              <AnimatePresence>
                {typingUsers.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-6 py-2 flex items-center gap-2"
                  >
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px] text-muted font-bold uppercase tracking-widest">
                      {typingUsers.length === 1 
                        ? `${typingUsers[0].displayName} gépel...` 
                        : `${typingUsers.length} ember gépel...`}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload Progress */}
              <AnimatePresence>
                {uploadProgress && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 py-3 bg-blue-600/5 border-t border-blue-600/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{uploadProgress.phase}</span>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{uploadProgress.percent}%</span>
                    </div>
                    <div className="h-1 bg-hover rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress.percent}%` }}
                        className="h-full bg-blue-600"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message Input */}
              <div className="p-6 bg-glass backdrop-blur-md border-t border-main">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileSelect} 
                      className="hidden" 
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="p-2.5 text-muted hover:text-title transition-colors disabled:opacity-50"
                    >
                      {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                    </button>
                    <button type="button" className="p-2.5 text-muted hover:text-title transition-colors">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2.5 text-muted hover:text-title transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Írj egy üzenetet..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.currentTarget.select()}
                      className="w-full bg-card border border-main rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-title placeholder:text-muted"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-32 h-32 bg-blue-600/5 rounded-[3rem] flex items-center justify-center mb-10 relative"
              >
                <div className="absolute inset-0 bg-blue-600/10 blur-2xl rounded-full" />
                <Shield className="w-16 h-16 text-blue-500 relative z-10" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-10px] border border-blue-600/20 rounded-[3.5rem] border-dashed"
                />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4 tracking-tight text-title">Biztonságos kommunikáció</h2>
              <p className="text-muted max-w-xs leading-relaxed">
                Válassz egy végpontok közötti titkosítással védett csatornát a beszélgetés indításához.
              </p>
              <div className="mt-10 flex flex-col gap-4">
                <button 
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3"
                >
                  <Sparkles className="w-5 h-5" />
                  Új beszélgetés indítása
                </button>
                <p className="text-[10px] text-muted uppercase tracking-widest font-bold">
                  Minden üzenet AES-256 titkosítással védett
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* New Chat Modal */}
      <AnimatePresence>
        {isNewChatModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewChatModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-main rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-main flex items-center justify-between bg-hover">
                <h2 className="text-xl font-bold tracking-tight text-title">Új beszélgetés</h2>
                <button 
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="p-2 hover:bg-hover rounded-full transition-colors text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 border-b border-main">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Felhasználó keresése..."
                    className="w-full bg-hover border border-main rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-title"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {availableUsers.length === 0 ? (
                  <div className="p-8 text-center text-muted text-sm">
                    Nem találhatók felhasználók.
                  </div>
                ) : (
                  availableUsers.map((user) => (
                    <button
                      key={user.uid}
                      onClick={() => startNewConversation(user)}
                      className="w-full p-4 flex items-center gap-4 hover:bg-hover rounded-2xl transition-all text-left group"
                    >
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName} 
                        className="w-12 h-12 rounded-full object-cover border border-main"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-title group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.displayName}</h3>
                        <p className="text-[10px] text-muted uppercase tracking-widest font-bold">
                          {user.status || 'Offline'}
                        </p>
                      </div>
                      <Plus className="w-5 h-5 text-muted group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <GroupCreationModal 
        isOpen={isGroupModalOpen} 
        onClose={() => setIsGroupModalOpen(false)}
        onCreated={(id) => {
          // A beszélgetés automatikusan bekerül a listába az onSnapshot miatt
          setIsGroupModalOpen(false);
        }}
      />

      {activeConversation && activeConversation.isGroup && (
        <GroupSettings 
          isOpen={isGroupSettingsOpen}
          onClose={() => setIsGroupSettingsOpen(false)}
          groupId={activeConversation.id}
          participants={activeConversation.participants}
          groupName={activeConversation.name || ''}
        />
      )}
    </div>
  );
}
