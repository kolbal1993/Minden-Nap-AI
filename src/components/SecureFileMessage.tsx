/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileIcon, ImageIcon, Download, Loader2, AlertCircle, Shield } from 'lucide-react';
import { ChatService } from '../lib/ChatService';
import { useToast } from './ToastProvider';

interface SecureFileMessageProps {
  message: any;
}

/**
 * SecureFileMessage - Végpontok közötti titkosított fájlok megjelenítésére szolgáló komponens.
 * Automatikusan visszafejti a fájlt a megjelenítés előtt.
 */
export default function SecureFileMessage({ message }: SecureFileMessageProps) {
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatService = new ChatService();
  const { showToast } = useToast();

  useEffect(() => {
    const decrypt = async () => {
      try {
        const url = await chatService.downloadSecureFile(message);
        setDecryptedUrl(url);
        showToast(`Fájl visszafejtve: ${message.fileName}`, 'success');
      } catch (err: any) {
        console.error("Failed to decrypt file:", err);
        setError(err.message === "DECRYPTION_KEY_MISSING" 
          ? "Kulcs hiányzik ezen az eszközön" 
          : "Hiba a visszafejtés során");
      } finally {
        setIsDecrypting(false);
      }
    };

    decrypt();

    // Tisztítás: Blob URL felszabadítása
    return () => {
      if (decryptedUrl) {
        URL.revokeObjectURL(decryptedUrl);
      }
    };
  }, [message.fileUrl]);

  if (isDecrypting) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 min-w-[200px]">
        <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-500 animate-spin" />
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Fájl visszafejtése...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-2xl border border-red-500/20 min-w-[200px]">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        <span className="text-xs text-red-700 dark:text-red-300 font-medium">{error}</span>
      </div>
    );
  }

  const isImage = message.fileType?.startsWith('image/');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-gray-100 dark:bg-white/5 max-w-[300px]"
    >
      {isImage && decryptedUrl ? (
        <div className="relative aspect-square overflow-hidden bg-black/20">
          <img 
            src={decryptedUrl} 
            alt={message.fileName} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Shield className="absolute top-4 right-4 w-5 h-5 text-white/50" />
            <a 
              href={decryptedUrl} 
              download={message.fileName}
              className="p-3 bg-white text-black rounded-full shadow-xl hover:scale-110 transition-transform flex items-center gap-2 font-bold text-xs px-6"
            >
              <Download className="w-4 h-4" />
              Letöltés
            </a>
          </div>
        </div>
      ) : (
        <div className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            {isImage ? <ImageIcon className="w-6 h-6" /> : <FileIcon className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{message.fileName}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              {isImage ? 'Titkosított kép' : 'Titkosított fájl'}
            </p>
          </div>
          <a 
            href={decryptedUrl || '#'} 
            download={message.fileName}
            className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Download className="w-5 h-5" />
          </a>
        </div>
      )}
    </motion.div>
  );
}
