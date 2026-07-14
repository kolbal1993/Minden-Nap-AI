/**
 * Seed Firestore 'posts' collection from src/constants/news.ts.
 * Run: npx tsx scripts/seed-posts-from-constants.ts
 *
 * JAVÍTÁS (2026-07-14, Balázs "C) + domain typo debug"):
 * A /hirek oldal üres volt, mert a Firestore 'posts' collection SOHA nem lett seed-elve.
 * A seed-firestore.ts CSAK a 'courses' collection-t seed-eli.
 * Ez a script a 4 hírt a constants/news.ts-ból seed-eli a Firestore 'posts' collection-be.
 *
 * IDEMPOTENS: ha a doc ID már létezik, kihagyja (nem duplikál).
 * Numeric ID alias: '1', '2', '3', '4' doc ID-ket ír (a /news/1 backward compat).
 */
import { readFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// CommonJS-compatible __dirname shim
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Firebase admin init
const sa: Record<string, string> = JSON.parse(
  readFileSync(resolve('/root/.hermes/secrets/firebase-service-account.json'), 'utf-8'),
);
initializeApp({ credential: cert(sa as any) });
const db = getFirestore('ai-studio-3099fea7-9321-43de-ba26-9cf40429bac2');

async function loadNewsItems(): Promise<any[]> {
  // Use dynamic import to load the constants/news.ts module
  const mod = await import(resolve(projectRoot, 'src', 'constants', 'news.ts'));
  return (mod as any).NEWS_ITEMS || [];
}

async function seedPost(item: any) {
  // 1. Numerikus ID-s doc (backward compat: /news/1, /news/2, stb.)
  const numericId = String(item.id);
  const numericRef = db.collection('posts').doc(numericId);
  const numericSnap = await numericRef.get();
  if (numericSnap.exists) {
    console.log(`  [SKIP] posts/${numericId} already exists`);
  } else {
    const payload = {
      ...item,
      id: numericId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await numericRef.set(payload);
    console.log(`  [CREATED] posts/${numericId} (${item.title.substring(0, 50)}...)`);
  }

  // 2. Slug-ID-s doc (admin panelen a slug alapján jelenik meg)
  const slugId = `post_${(item.title as string)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')}`;
  const slugRef = db.collection('posts').doc(slugId);
  const slugSnap = await slugRef.get();
  if (slugSnap.exists) {
    console.log(`  [SKIP] posts/${slugId} already exists`);
  } else {
    const payload = {
      ...item,
      id: numericId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await slugRef.set(payload);
    console.log(`  [CREATED] posts/${slugId} (alias of ${numericId})`);
  }
}

async function main() {
  console.log('=== SEED POSTS FROM CONSTANTS (JAVÍTÁS 2026-07-14) ===');
  const items = await loadNewsItems();
  console.log(`Összes hír a constants/news.ts-ban: ${items.length}`);
  for (const item of items) {
    await seedPost(item);
  }
  console.log('\n=== KÉSZ ===');
  console.log(`Összesen ${items.length} hír seed-elve a Firestore 'posts' collection-be.`);
  console.log('A /hirek oldal MOSTANTÓL betölti a híreket!');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
