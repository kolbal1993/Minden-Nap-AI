
/**
 * Fix Balázs Firestore user doc missing email field
 * Run: npx tsx scripts/fix-user-email.ts
 */
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const sa = JSON.parse(readFileSync(resolve('/root/.hermes/secrets/firebase-service-account.json'), 'utf-8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore('ai-studio-3099fea7-9321-43de-ba26-9cf40429bac2');

async function main() {
  const uid = 'FMLKmvjk7lVjmDZOMINkDF9UNNG3';
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    console.log('User doc does not exist, creating...');
    await ref.set({
      email: 'kolesbalazs93@gmail.com',
      displayName: 'Balázs Koles',
      createdAt: FieldValue.serverTimestamp(),
      role: 'admin',
      isPremium: true,
    });
  } else {
    const data = snap.data() || {};
    if (!data.email) {
      await ref.update({ email: 'kolesbalazs93@gmail.com' });
      console.log('Email field added');
    } else {
      console.log('Email already exists:', data.email);
    }
  }
  process.exit(0);
}
main().catch(err => { console.error(err); process.exit(1); });
