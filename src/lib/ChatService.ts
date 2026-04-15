/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  db, 
  auth, 
  storage,
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  query, 
  orderBy,
  Unsubscribe,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { SecurityManager } from './SecurityManager';

/**
 * ChatService - A Firebase Firestore és a SecurityManager közötti szinkronizációért felelős osztály.
 * Kezeli a titkosított és normál üzenetküldést, valamint a valós idejű dekódolást.
 */
export class ChatService {
  private securityManager: SecurityManager;

  constructor() {
    this.securityManager = new SecurityManager();
  }

  /**
   * Frissíti a felhasználó biztonsági profilját a Firestore-ban.
   * @param mode 'E2EE' vagy 'NONE'
   */
  async updateUserSecurityProfile(mode: 'E2EE' | 'NONE'): Promise<void> {
    if (!auth.currentUser) throw new Error("User not authenticated");

    try {
      const publicKeyBase64 = await this.securityManager.setupSecurity(mode);
      const userRef = doc(db, 'users', auth.currentUser.uid);

      // Firestore mezők:
      // - encryptionEnabled: logikai érték a 2FA/E2EE állapotáról
      // - publicKey: RSA publikus kulcs Base64 formátumban
      await updateDoc(userRef, {
        encryptionEnabled: mode === 'E2EE',
        publicKey: mode === 'E2EE' ? publicKeyBase64 : null,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
    }
  }

  /**
   * Intelligens üzenetküldés: automatikusan titkosít, ha a címzettnél aktív az E2EE.
   * @param recipientId A címzett felhasználó ID-ja.
   * @param chatId A beszélgetés ID-ja.
   * @param plainText Az elküldendő üzenet szövege.
   */
  async sendSmartMessage(recipientId: string, chatId: string, plainText: string): Promise<void> {
    if (!auth.currentUser) throw new Error("User not authenticated");

    try {
      // 1. Címzett adatainak lekérése
      const recipientRef = doc(db, 'users', recipientId);
      const recipientDoc = await getDoc(recipientRef);
      
      let messageData: any = {
        senderId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        isEncrypted: false,
        text: plainText
      };

      // 2. Döntési logika a titkosításról
      if (recipientDoc.exists()) {
        const data = recipientDoc.data();
        if (data.encryptionEnabled === true && data.publicKey) {
          // Titkosítás végrehajtása
          const encryptedPackage = await this.securityManager.encryptForRecipient(plainText, data.publicKey);
          
          // Firestore mezők titkosított üzenet esetén:
          // - isEncrypted: true
          // - text: A titkosított üzenet (ciphertext)
          // - iv: Inicializáló vektor az AES-GCM-hez
          // - encryptedKey: A címzett RSA kulcsával titkosított AES munkamenet-kulcs
          messageData = {
            ...messageData,
            isEncrypted: true,
            text: encryptedPackage.encryptedMessage,
            iv: encryptedPackage.iv,
            encryptedKey: encryptedPackage.encryptedKey
          };
        }
      }

      // 3. Üzenet mentése a beszélgetésbe
      const messagesRef = collection(db, 'conversations', chatId, 'messages');
      await addDoc(messagesRef, messageData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `conversations/${chatId}/messages`);
    }
  }

  /**
   * Biztonságos fájlfeltöltés E2EE titkosítással.
   * @param file A feltöltendő fájl.
   * @param recipientId A címzett ID-ja.
   * @param chatId A beszélgetés ID-ja.
   */
  async uploadSecureFile(file: File, recipientId: string, chatId: string): Promise<void> {
    if (!auth.currentUser) throw new Error("User not authenticated");

    try {
      // 1. Címzett publikus kulcsának lekérése
      const recipientRef = doc(db, 'users', recipientId);
      const recipientDoc = await getDoc(recipientRef);
      
      if (!recipientDoc.exists() || !recipientDoc.data().publicKey) {
        throw new Error("RECIPIENT_E2EE_NOT_ACTIVE");
      }

      const publicKey = recipientDoc.data().publicKey;

      // 2. Fájl titkosítása
      const { encryptedBlob, iv, encryptedKey } = await this.securityManager.encryptFile(file, publicKey);

      // 3. Titkosított fájl feltöltése a Storage-ba
      const fileId = crypto.randomUUID();
      const storageRef = ref(storage, `chats/${chatId}/files/${fileId}`);
      await uploadBytes(storageRef, encryptedBlob);
      const downloadUrl = await getDownloadURL(storageRef);

      // 4. Üzenet mentése a Firestore-ba
      const messagesRef = collection(db, 'conversations', chatId, 'messages');
      await addDoc(messagesRef, {
        senderId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        isEncrypted: true,
        type: 'file',
        fileUrl: downloadUrl,
        fileName: file.name,
        fileType: file.type,
        iv: iv,
        encryptedKey: encryptedKey
      });
    } catch (error) {
      console.error("Secure file upload failed:", error);
      throw error;
    }
  }

  /**
   * Biztonságos fájl letöltése és visszafejtése.
   * @param messageData Az üzenet adatai a Firestore-ból.
   */
  async downloadSecureFile(messageData: any): Promise<string> {
    try {
      // 1. Titkosított fájl letöltése
      const response = await fetch(messageData.fileUrl);
      const encryptedBuffer = await response.arrayBuffer();

      // 2. Fájl visszafejtése
      const decryptedBlob = await this.securityManager.decryptFile(
        encryptedBuffer,
        messageData.iv,
        messageData.encryptedKey
      );

      // 3. Blob URL létrehozása a megjelenítéshez
      return URL.createObjectURL(new Blob([decryptedBlob], { type: messageData.fileType }));
    } catch (error) {
      console.error("Secure file download failed:", error);
      throw error;
    }
  }

  /**
   * Csoportkulcs létrehozása vagy megújítása (Key Rotation).
   * @param groupId A csoport ID-ja.
   * @param participantIds A résztvevők ID-jainak listája.
   */
  async createOrRotateGroupKey(groupId: string, participantIds: string[]): Promise<void> {
    if (!auth.currentUser) throw new Error("User not authenticated");

    try {
      // 1. Új csoportkulcs generálása
      const groupKey = await this.securityManager.generateGroupKey();

      // 2. Résztvevők publikus kulcsainak lekérése
      const keyPromises = participantIds.map(async (uid) => {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists() && userDoc.data().publicKey) {
          const encryptedKey = await this.securityManager.encryptKeyForUser(groupKey, userDoc.data().publicKey);
          return { uid, encryptedKey };
        }
        return null;
      });

      const encryptedKeys = (await Promise.all(keyPromises)).filter(k => k !== null);

      // 3. Titkosított kulcsok mentése a Firestore-ba
      const keysCollection = collection(db, 'conversations', groupId, 'keys');
      const savePromises = encryptedKeys.map(k => 
        setDoc(doc(keysCollection, k!.uid), { 
          key: k!.encryptedKey,
          updatedAt: serverTimestamp()
        })
      );

      await Promise.all(savePromises);

      // 4. Saját kulcs mentése helyileg is a gyors eléréshez
      await this.securityManager.storeGroupKey(groupId, groupKey);
    } catch (error) {
      console.error("Group key rotation failed:", error);
      throw error;
    }
  }

  /**
   * Lekéri a csoportkulcsot (IndexedDB-ből vagy Firestore-ból).
   */
  async getGroupKey(groupId: string): Promise<CryptoKey | null> {
    if (!auth.currentUser) return null;

    // 1. Próbáljuk meg a helyi tárolóból
    let groupKey = await this.securityManager.getGroupKey(groupId);
    if (groupKey) return groupKey;

    // 2. Ha nincs meg, kérjük le a Firestore-ból
    try {
      const keyDoc = await getDoc(doc(db, 'conversations', groupId, 'keys', auth.currentUser.uid));
      if (keyDoc.exists()) {
        const encryptedKey = keyDoc.data().key;
        groupKey = await this.securityManager.decryptKeyWithPrivateKey(encryptedKey);
        
        // Mentés helyileg a jövőbeni használathoz
        await this.securityManager.storeGroupKey(groupId, groupKey);
        return groupKey;
      }
    } catch (error) {
      console.error("Failed to retrieve group key:", error);
    }

    return null;
  }

  /**
   * Titkosított csoportos üzenet küldése.
   */
  async sendGroupMessage(groupId: string, text: string): Promise<void> {
    if (!auth.currentUser) throw new Error("User not authenticated");

    const groupKey = await this.getGroupKey(groupId);
    if (!groupKey) throw new Error("GROUP_KEY_MISSING");

    try {
      const encrypted = await this.securityManager.encryptWithGroupKey(text, groupKey);
      
      const messagesRef = collection(db, 'conversations', groupId, 'messages');
      await addDoc(messagesRef, {
        senderId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        isEncrypted: true,
        isGroupMessage: true,
        text: encrypted.encryptedMessage,
        iv: encrypted.iv
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `conversations/${groupId}/messages`);
    }
  }

  /**
   * Új résztvevő hozzáadása a csoporthoz.
   */
  async addParticipantToGroup(groupId: string, newParticipantId: string): Promise<void> {
    if (!auth.currentUser) throw new Error("User not authenticated");

    try {
      const convRef = doc(db, 'conversations', groupId);
      const convDoc = await getDoc(convRef);
      if (!convDoc.exists()) throw new Error("Conversation not found");

      const participants = convDoc.data().participants as string[];
      if (participants.includes(newParticipantId)) return;

      // 1. Új résztvevő hozzáadása a listához
      const updatedParticipants = [...participants, newParticipantId];
      await updateDoc(convRef, { participants: updatedParticipants });

      // 2. A jelenlegi csoportkulcs titkosítása az új tag számára
      const groupKey = await this.getGroupKey(groupId);
      if (groupKey) {
        const userDoc = await getDoc(doc(db, 'users', newParticipantId));
        if (userDoc.exists() && userDoc.data().publicKey) {
          const encryptedKey = await this.securityManager.encryptKeyForUser(groupKey, userDoc.data().publicKey);
          await setDoc(doc(db, 'conversations', groupId, 'keys', newParticipantId), { 
            key: encryptedKey,
            updatedAt: serverTimestamp()
          });
        }
      } else {
        // Ha nincs meg a kulcsunk (pl. nem vagyunk tagok vagy hiba), akkor rotáljuk? 
        // Inkább rotáljuk, ha mi vagyunk az adminok/módosítók.
        await this.createOrRotateGroupKey(groupId, updatedParticipants);
      }
    } catch (error) {
      console.error("Failed to add participant:", error);
      throw error;
    }
  }

  /**
   * Résztvevő eltávolítása és KULCS ROTÁCIÓ.
   */
  async removeParticipantFromGroup(groupId: string, participantIdToRemove: string): Promise<void> {
    if (!auth.currentUser) throw new Error("User not authenticated");

    try {
      const convRef = doc(db, 'conversations', groupId);
      const convDoc = await getDoc(convRef);
      if (!convDoc.exists()) throw new Error("Conversation not found");

      const participants = convDoc.data().participants as string[];
      const updatedParticipants = participants.filter(id => id !== participantIdToRemove);

      // 1. Résztvevő eltávolítása
      await updateDoc(convRef, { participants: updatedParticipants });

      // 2. KULCS ROTÁCIÓ: Új kulcs generálása a maradék tagoknak
      // Így az eltávolított tag nem tudja olvasni a jövőbeni üzeneteket.
      await this.createOrRotateGroupKey(groupId, updatedParticipants);
    } catch (error) {
      console.error("Failed to remove participant:", error);
      throw error;
    }
  }

  /**
   * Beállítja a gépelési állapotot.
   */
  async setTypingStatus(chatId: string, isTyping: boolean): Promise<void> {
    if (!auth.currentUser) return;
    const typingRef = doc(db, 'conversations', chatId, 'typing', auth.currentUser.uid);
    if (isTyping) {
      await setDoc(typingRef, {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName,
        timestamp: serverTimestamp()
      });
    } else {
      await deleteDoc(typingRef);
    }
  }

  /**
   * Figyeli, hogy ki gépel éppen.
   */
  listenToTyping(chatId: string, onUpdate: (typingUsers: any[]) => void): Unsubscribe {
    const typingRef = collection(db, 'conversations', chatId, 'typing');
    return onSnapshot(typingRef, (snapshot) => {
      const users = snapshot.docs
        .map(doc => doc.data())
        .filter(u => u.uid !== auth.currentUser?.uid);
      onUpdate(users);
    });
  }

  /**
   * Megpróbál visszafejteni egyetlen üzenetet (előnézethez).
   */
  async decryptSmartPreview(chatId: string, messageData: any): Promise<string> {
    if (!messageData.isEncrypted) return messageData.text;

    try {
      if (messageData.isGroupMessage) {
        const groupKey = await this.getGroupKey(chatId);
        if (groupKey) {
          return await this.securityManager.decryptWithGroupKey(messageData.text, messageData.iv, groupKey);
        }
      } else {
        return await this.securityManager.decryptIncoming({
          encryptedMessage: messageData.text,
          iv: messageData.iv,
          encryptedKey: messageData.encryptedKey
        });
      }
    } catch (e) {
      // Ha nem sikerül, marad a lakat
    }
    return "🔒 Titkosított tartalom";
  }

  /**
   * Valós idejű chat figyelés automatikus dekódolással.
   * @param chatId A beszélgetés ID-ja.
   * @param onUpdate Callback függvény a feldolgozott üzenetekkel.
   */
  listenToChat(chatId: string, onUpdate: (messages: any[]) => void): Unsubscribe {
    const messagesRef = collection(db, 'conversations', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, async (snapshot) => {
      // Csoportkulcs előtöltése, ha szükséges
      let groupKey: CryptoKey | null = null;

      const processedMessages = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let text = data.text;

        if (data.isEncrypted === true) {
          try {
            if (data.isGroupMessage) {
              // Csoportos üzenet visszafejtése
              if (!groupKey) groupKey = await this.getGroupKey(chatId);
              if (groupKey) {
                text = await this.securityManager.decryptWithGroupKey(data.text, data.iv, groupKey);
              } else {
                text = "Titkosított csoportos üzenet (kulcs hiányzik)";
              }
            } else {
              // 1:1 üzenet visszafejtése
              text = await this.securityManager.decryptIncoming({
                encryptedMessage: data.text,
                iv: data.iv,
                encryptedKey: data.encryptedKey
              });
            }
          } catch (error: any) {
            if (error.message === "DECRYPTION_KEY_MISSING") {
              text = "Titkosított tartalom (kulcs hiányzik ezen az eszközön)";
            } else {
              text = "Hiba a visszafejtés során";
              console.error("Decryption error:", error);
            }
          }
        }

        return {
          id: doc.id,
          ...data,
          text
        };
      }));

      onUpdate(processedMessages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `conversations/${chatId}/messages`);
    });
  }
}
