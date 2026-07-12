
/**
 * Remove duplicate numeric-ID docs from posts collection.
 * The seed script wrote docs with numeric IDs (1,2,3,4) via batch.set().
 * Admin panel may also create auto-ID docs. We keep auto-ID ones only.
 * Run: npx tsx scripts/cleanup-posts-dup.ts
 */
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const sa = JSON.parse(readFileSync(resolve('/root/.hermes/secrets/firebase-service-account.json'), 'utf-8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore('ai-studio-3099fea7-9321-43de-ba26-9cf40429bac2');

async function main() {
  const snap = await db.collection('posts').get();
  let deleted = 0;
  for (const doc of snap.docs) {
    // Delete docs with numeric-only IDs (legacy seed duplicates)
    if (/^\d+$/.test(doc.id)) {
      console.log('Deleting duplicate:', doc.id, doc.data().title?.substring(0, 40));
      await doc.ref.delete();
      deleted++;
    }
  }
  console.log(`Deleted ${deleted} duplicate posts`);
  process.exit(0);
}
main().catch(err => { console.error(err); process.exit(1); });
