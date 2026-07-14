import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync('/root/.hermes/secrets/firebase-service-account.json', 'utf-8'));
initializeApp({ credential: cert(sa as any) });
const db = getFirestore('ai-studio-3099fea7-9321-43de-ba26-9cf40429bac2');

async function main() {
  const postsSnap = await db.collection('posts').get();
  console.log('Összes posts doc:', postsSnap.size);
  for (const doc of postsSnap.docs) {
    const d = doc.data();
    console.log('  -', doc.id, '|', (d.title || 'NO_TITLE').substring(0, 50), '|', d.publishDate || 'NO_DATE');
  }
  console.log();
  const coursesSnap = await db.collection('courses').get();
  console.log('Összes courses doc:', coursesSnap.size);
  for (const doc of coursesSnap.docs) {
    const d = doc.data();
    console.log('  -', doc.id, '|', (d.title || 'NO_TITLE').substring(0, 50), '|', d.publishDate || 'NO_DATE');
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
