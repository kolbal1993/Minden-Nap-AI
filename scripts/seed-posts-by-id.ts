/**
 * Seed Firestore posts/courses with numeric ID aliases (1, 2, 3, 4).
 * Run: npx tsx scripts/seed-posts-by-id.ts
 *
 * Background: A posts collection has 4 docs with slug-based IDs
 * (post_a_gpt_5_fejleszt_se_j_m_rf_ld etc.). The user expects /news/1
 * to work (backward compat + admin UI uses numeric IDs). We resolve
 * "1"→post by matching docs[id]=="1" internal field, then write
 * a copy under numeric doc ID (only if not already present — safe).
 */
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync('/root/.hermes/secrets/firebase-service-account.json', 'utf-8'));
initializeApp({ credential: cert(sa as any) });
const db = getFirestore("ai-studio-3099fea7-9321-43de-ba26-9cf40429bac2");

async function aliasById(collectionName: string) {
  console.log(`\n=== ${collectionName} ===`);
  const snap = await db.collection(collectionName).get();
  console.log(`  Found ${snap.size} docs`);

  for (const docSnap of snap.docs) {
    const data = docSnap.data() as any;
    const numericId = data.id;
    if (!numericId || !/^\d+$/.test(String(numericId))) {
      console.log(`  [SKIP] ${docSnap.id} (no numeric id field)`);
      continue;
    }

    // Check if numeric ID doc already exists
    const targetRef = db.collection(collectionName).doc(String(numericId));
    const existing = await targetRef.get();
    if (existing.exists) {
      console.log(`  [SKIP] ${collectionName}/${numericId} already exists`);
      continue;
    }

    // Create numeric ID alias (copy of slug doc, but with doc ID = numeric)
    const payload = { ...data, createdAt: FieldValue.serverTimestamp() };
    // Remove the inner `id` field since it's now redundant with the doc ID
    delete payload.id;
    await targetRef.set(payload);
    console.log(`  [ALIAS] ${docSnap.id} → ${collectionName}/${numericId}`);
  }
}

async function main() {
  await aliasById('posts');
  await aliasById('courses');
  console.log('\nDone.');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
