/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SecurityManager - Professzionális E2EE (End-to-End Encryption) kezelő osztály.
 * Támogatja a hibrid titkosítást (RSA-OAEP + AES-GCM) és a biztonságos kulcstárolást IndexedDB-ben.
 */
export class SecurityManager {
  private dbName = 'ChatSecurityDB';
  private storeName = 'keys';
  private groupStoreName = 'groupKeys';
  private privateKeyId = 'rsa_private_key';
  private dbVersion = 2;

  /**
   * Inicializálja vagy törli a biztonsági beállításokat.
   * @param mode 'E2EE' vagy 'NONE'
   * @returns A publikus kulcs Base64 formátumban (E2EE esetén), vagy null.
   */
  async setupSecurity(mode: 'E2EE' | 'NONE'): Promise<string | null> {
    if (mode === 'E2EE') {
      // 1. RSA kulcspár generálása (2048-bit, SHA-256)
      // A privát kulcs nem-exportálható (extractable: false) a maximális biztonság érdekében.
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true, // Módosítva: extractable: true a biztonsági mentés támogatásához
        ["encrypt", "decrypt"]
      );

      // 2. Privát kulcs mentése IndexedDB-be (a CryptoKey objektum közvetlenül tárolható)
      await this.storePrivateKey(keyPair.privateKey);

      // 3. Publikus kulcs exportálása Base64-ként (ezt kell feltölteni a Firebase-be)
      const exportedPublic = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
      return this.arrayBufferToBase64(exportedPublic);
    } else {
      // Biztonság leállítása: kulcsok törlése
      await this.clearSecurity();
      return null;
    }
  }

  /**
   * Titkosít egy üzenetet a címzett számára.
   * @param plainText Az eredeti üzenet.
   * @param recipientPublicKeyBase64 A címzett RSA publikus kulcsa.
   */
  async encryptForRecipient(plainText: string, recipientPublicKeyBase64: string) {
    // 1. Címzett publikus kulcsának importálása
    const publicKey = await this.importPublicKey(recipientPublicKeyBase64);

    // 2. Egyszeri AES munkamenet-kulcs generálása (AES-GCM 256-bit)
    const sessionKey = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    // 3. Üzenet titkosítása az AES kulccsal
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedText = new TextEncoder().encode(plainText);
    const encryptedMessage = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      sessionKey,
      encodedText
    );

    // 4. Az AES kulcs titkosítása a címzett RSA kulcsával
    const exportedSessionKey = await window.crypto.subtle.exportKey("raw", sessionKey);
    const encryptedSessionKey = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      exportedSessionKey
    );

    // 5. A csomag összeállítása (Base64 formátumban)
    return {
      encryptedMessage: this.arrayBufferToBase64(encryptedMessage),
      iv: this.arrayBufferToBase64(iv),
      encryptedKey: this.arrayBufferToBase64(encryptedSessionKey)
    };
  }

  /**
   * Visszafejt egy beérkező titkosított csomagot.
   * @param encryptedPackage A titkosított üzenet, IV és titkosított kulcs.
   */
  async decryptIncoming(encryptedPackage: { encryptedMessage: string, iv: string, encryptedKey: string }): Promise<string> {
    // 1. Privát kulcs lekérése IndexedDB-ből
    const privateKey = await this.getPrivateKey();
    if (!privateKey) {
      throw new Error("DECRYPTION_KEY_MISSING");
    }

    try {
      // 2. AES munkamenet-kulcs visszafejtése az RSA privát kulccsal
      const encryptedKeyBuffer = this.base64ToArrayBuffer(encryptedPackage.encryptedKey);
      const decryptedSessionKeyBuffer = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encryptedKeyBuffer
      );

      // 3. AES kulcs importálása
      const sessionKey = await window.crypto.subtle.importKey(
        "raw",
        decryptedSessionKeyBuffer,
        "AES-GCM",
        true,
        ["decrypt"]
      );

      // 4. Az üzenet visszafejtése
      const iv = this.base64ToArrayBuffer(encryptedPackage.iv);
      const encryptedData = this.base64ToArrayBuffer(encryptedPackage.encryptedMessage);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        sessionKey,
        encryptedData
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error("DECRYPTION_FAILED");
    }
  }

  /**
   * Titkosít egy fájlt a címzett számára.
   * @param file A feltöltendő fájl.
   * @param recipientPublicKeyBase64 A címzett RSA publikus kulcsa.
   */
  async encryptFile(file: File, recipientPublicKeyBase64: string) {
    // 1. Címzett publikus kulcsának importálása
    const publicKey = await this.importPublicKey(recipientPublicKeyBase64);

    // 2. Egyedi AES munkamenet-kulcs generálása a fájlhoz (AES-GCM 256-bit)
    const fileKey = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    // 3. Fájl tartalmának beolvasása és titkosítása
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const fileBuffer = await file.arrayBuffer();
    const encryptedFileBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      fileKey,
      fileBuffer
    );

    // 4. A fájl-kulcs titkosítása a címzett RSA kulcsával
    const exportedFileKey = await window.crypto.subtle.exportKey("raw", fileKey);
    const encryptedFileKey = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      exportedFileKey
    );

    return {
      encryptedBlob: new Blob([encryptedFileBuffer]),
      iv: this.arrayBufferToBase64(iv),
      encryptedKey: this.arrayBufferToBase64(encryptedFileKey)
    };
  }

  /**
   * Visszafejt egy titkosított fájlt.
   * @param encryptedBuffer A letöltött titkosított adat.
   * @param ivBase64 Az inicializáló vektor.
   * @param encryptedKeyBase64 A titkosított fájl-kulcs.
   */
  async decryptFile(encryptedBuffer: ArrayBuffer, ivBase64: string, encryptedKeyBase64: string): Promise<Blob> {
    const privateKey = await this.getPrivateKey();
    if (!privateKey) throw new Error("DECRYPTION_KEY_MISSING");

    // 1. Fájl-kulcs visszafejtése az RSA privát kulccsal
    const encryptedKeyBuffer = this.base64ToArrayBuffer(encryptedKeyBase64);
    const decryptedFileKeyBuffer = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedKeyBuffer
    );

    // 2. AES kulcs importálása
    const fileKey = await window.crypto.subtle.importKey(
      "raw",
      decryptedFileKeyBuffer,
      "AES-GCM",
      true,
      ["decrypt"]
    );

    // 3. A fájl visszafejtése
    const iv = this.base64ToArrayBuffer(ivBase64);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      fileKey,
      encryptedBuffer
    );

    return new Blob([decryptedBuffer]);
  }

  /**
   * Exportálja a privát kulcsot egy jelszóval titkosított formátumban.
   * @param password A felhasználó által megadott jelszó.
   */
  async exportBackupKey(password: string): Promise<string> {
    const privateKey = await this.getPrivateKey();
    if (!privateKey) throw new Error("NO_KEY_TO_BACKUP");

    // 1. Só és IV generálása
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // 2. AES kulcs származtatása a jelszóbál (PBKDF2)
    const aesKey = await this.deriveKeyFromPassword(password, salt);

    // 3. RSA privát kulcs exportálása (PKCS#8 formátum)
    const exportedKeyBuffer = await window.crypto.subtle.exportKey("pkcs8", privateKey);

    // 4. Az exportált kulcs titkosítása AES-GCM-mel
    const encryptedKey = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      aesKey,
      exportedKeyBuffer
    );

    // 5. Biztonsági mentés csomag összeállítása
    const backupPackage = {
      salt: this.arrayBufferToBase64(salt),
      iv: this.arrayBufferToBase64(iv),
      encryptedKey: this.arrayBufferToBase64(encryptedKey)
    };

    return JSON.stringify(backupPackage);
  }

  /**
   * Visszaállítja a privát kulcsot egy titkosított mentésből.
   * @param backupData JSON formátumú mentés.
   * @param password A mentéskor használt jelszó.
   */
  async importBackupKey(backupData: string, password: string): Promise<void> {
    const backup = JSON.parse(backupData);
    const salt = this.base64ToArrayBuffer(backup.salt);
    const iv = this.base64ToArrayBuffer(backup.iv);
    const encryptedKey = this.base64ToArrayBuffer(backup.encryptedKey);

    // 1. AES kulcs újra-származtatása
    const aesKey = await this.deriveKeyFromPassword(password, new Uint8Array(salt));

    try {
      // 2. RSA kulcs visszafejtése
      const decryptedKeyBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        aesKey,
        encryptedKey
      );

      // 3. RSA privát kulcs importálása
      const privateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        decryptedKeyBuffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["decrypt"]
      );

      // 4. Mentés IndexedDB-be
      await this.storePrivateKey(privateKey);
    } catch (error) {
      console.error("Backup restore failed:", error);
      throw new Error("INVALID_PASSWORD_OR_DATA");
    }
  }

  /**
   * Jelszó alapú kulcsszármaztatás (PBKDF2).
   */
  private async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Generál egy új csoportkulcsot (AES-256).
   */
  async generateGroupKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Titkosít egy csoportkulcsot egy adott felhasználó számára.
   * @param groupKey A csoport AES kulcsa.
   * @param recipientPublicKeyBase64 A címzett RSA publikus kulcsa.
   */
  async encryptKeyForUser(groupKey: CryptoKey, recipientPublicKeyBase64: string): Promise<string> {
    const publicKey = await this.importPublicKey(recipientPublicKeyBase64);
    const rawKey = await window.crypto.subtle.exportKey("raw", groupKey);
    
    const encryptedKey = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      rawKey
    );

    return this.arrayBufferToBase64(encryptedKey);
  }

  /**
   * Visszafejt egy titkosított csoportkulcsot a saját privát kulccsal.
   * @param encryptedKeyBase64 A titkosított kulcs.
   */
  async decryptKeyWithPrivateKey(encryptedKeyBase64: string): Promise<CryptoKey> {
    const privateKey = await this.getPrivateKey();
    if (!privateKey) throw new Error("DECRYPTION_KEY_MISSING");

    const encryptedKeyBuffer = this.base64ToArrayBuffer(encryptedKeyBase64);
    const decryptedRawKey = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedKeyBuffer
    );

    return await window.crypto.subtle.importKey(
      "raw",
      decryptedRawKey,
      "AES-GCM",
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Titkosít egy üzenetet a csoportkulccsal.
   */
  async encryptWithGroupKey(plainText: string, groupKey: CryptoKey) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedText = new TextEncoder().encode(plainText);
    
    const encryptedMessage = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      groupKey,
      encodedText
    );

    return {
      encryptedMessage: this.arrayBufferToBase64(encryptedMessage),
      iv: this.arrayBufferToBase64(iv)
    };
  }

  /**
   * Visszafejt egy üzenetet a csoportkulccsal.
   */
  async decryptWithGroupKey(encryptedMessageBase64: string, ivBase64: string, groupKey: CryptoKey): Promise<string> {
    const iv = this.base64ToArrayBuffer(ivBase64);
    const encryptedData = this.base64ToArrayBuffer(encryptedMessageBase64);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      groupKey,
      encryptedData
    );

    return new TextDecoder().decode(decryptedBuffer);
  }

  /**
   * Ment egy csoportkulcsot az IndexedDB-be.
   */
  async storeGroupKey(groupId: string, key: CryptoKey): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.groupStoreName, 'readwrite');
      const store = transaction.objectStore(this.groupStoreName);
      const request = store.put(key, groupId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Lekér egy csoportkulcsot az IndexedDB-ből.
   */
  async getGroupKey(groupId: string): Promise<CryptoKey | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.groupStoreName, 'readonly');
      const store = transaction.objectStore(this.groupStoreName);
      const request = store.get(groupId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // --- Belső segédfüggvények ---

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onupgradeneeded = (event: any) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
        if (!db.objectStoreNames.contains(this.groupStoreName)) {
          db.createObjectStore(this.groupStoreName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async storePrivateKey(key: CryptoKey): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(key, this.privateKeyId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getPrivateKey(): Promise<CryptoKey | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(this.privateKeyId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async clearSecurity(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(this.privateKeyId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async importPublicKey(base64: string): Promise<CryptoKey> {
    const buffer = this.base64ToArrayBuffer(base64);
    return await window.crypto.subtle.importKey(
      "spki",
      buffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
    );
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
