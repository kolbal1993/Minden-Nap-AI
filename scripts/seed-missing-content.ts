/**
 * Seed ALL missing Firestore collections from src/constants/.
 * Run: npx tsx scripts/seed-missing-content.ts
 *
 * JAVÍTÁS (2026-07-14, Balázs "új tartalom = azonnal látszik"):
 * Ez a script a single source of truth pattern-t valósítja meg:
 * - A src/constants/news.ts és src/constants/courses.ts a FORRÁS
 * - Ha a Firestore 'posts' VAGY 'courses' collection ÜRES, seed-eli
 * - IDEMPOTENS: ha már van tartalom, kihagyja (nem duplikál)
 * - A Vercel prebuild script hívja meg (NEM kell manuálisan futtatni)
 */
import { readFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const sa: Record<string, string> = JSON.parse(
  readFileSync(resolve('/root/.hermes/secrets/firebase-service-account.json'), 'utf-8'),
);
initializeApp({ credential: cert(sa as any) });
const db = getFirestore('ai-studio-3099fea7-9321-43de-ba26-9cf40429bac2');

async function loadConstants<T>(path: string, exportName: string): Promise<T[]> {
  const mod = await import(resolve(projectRoot, path));
  return (mod as any)[exportName] || [];
}

async function seedIfMissing(
  collectionName: string,
  items: any[],
  itemIdField: string = 'id',
  createSlugAlias: boolean = true,
): Promise<{ created: number; skipped: number; aliases: number }> {
  console.log(`\n=== ${collectionName} ===`);

  // 1. Ellenőrizzük, hogy a collection üres-e
  const snap = await db.collection(collectionName).limit(1).get();
  if (!snap.empty) {
    console.log(`  [SKIP] ${collectionName} már tartalmaz dokumentumokat (${snap.size} látható)`);
    const totalSnap = await db.collection(collectionName).count().get();
    console.log(`  [INFO] Összes dokumentum: ${totalSnap.data().count}`);
    return { created: 0, skipped: totalSnap.data().count, aliases: 0 };
  }

  console.log(`  [SEED] ${collectionName} üres, ${items.length} hír seed-elése...`);

  let created = 0;
  let skipped = 0;
  let aliases = 0;

  for (const item of items) {
    const numericId = String(item[itemIdField]);

    // 1. Numerikus ID-s doc (backward compat: /news/1, /course/1, stb.)
    const numericRef = db.collection(collectionName).doc(numericId);
    const numericSnap = await numericRef.get();
    if (numericSnap.exists) {
      console.log(`    [SKIP] ${collectionName}/${numericId} already exists`);
      skipped++;
    } else {
      const payload = {
        ...item,
        id: numericId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      await numericRef.set(payload);
      console.log(`    [CREATED] ${collectionName}/${numericId} (${(item.title || item.name || '?').substring(0, 50)})`);
      created++;
    }

    // 2. Slug-ID-s alias doc (admin panelen a slug alapján jelenik meg)
    if (createSlugAlias && item.title) {
      const slugId = `${collectionName === 'posts' ? 'post' : 'course'}_${item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')}`;
      const slugRef = db.collection(collectionName).doc(slugId);
      const slugSnap = await slugRef.get();
      if (slugSnap.exists) {
        console.log(`    [SKIP] ${collectionName}/${slugId} already exists`);
      } else {
        const payload = {
          ...item,
          id: numericId,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };
        await slugRef.set(payload);
        console.log(`    [ALIAS] ${collectionName}/${slugId} (alias of ${numericId})`);
        aliases++;
      }
    }
  }

  return { created, skipped, aliases };
}

async function main() {
  console.log('=== SEED MISSING CONTENT (JAVÍTÁS 2026-07-14) ===');
  console.log('Single source of truth: src/constants/* → Firestore (ha üres)');
  console.log();

  const results = {
    posts: { created: 0, skipped: 0, aliases: 0 },
    courses: { created: 0, skipped: 0, aliases: 0 },
  };

  // 1. Hírek seed-elése (ha a posts collection üres)
  try {
    const newsItems = await loadConstants<any>('src/constants/news.ts', 'NEWS_ITEMS');
    console.log(`📰 constants/news.ts: ${newsItems.length} hír`);
    results.posts = await seedIfMissing('posts', newsItems, 'id', true);
  } catch (e) {
    console.error(`❌ Hiba a news.ts betöltésekor: ${e}`);
  }

  // 2. Kurzusok seed-elése (ha a courses collection üres)
  try {
    const courseItems = await loadConstants<any>('src/constants/courses.ts', 'COURSES');
    console.log(`\n📚 constants/courses.ts: ${courseItems.length} kurzus`);
    results.courses = await seedIfMissing('courses', courseItems, 'id', true);
  } catch (e) {
    console.error(`❌ Hiba a courses.ts betöltésekor: ${e}`);
  }

  // 3. Összegzés
  console.log('\n=== ÖSSZEGZÉS ===');
  console.log(`posts: created=${results.posts.created}, skipped=${results.posts.skipped}, aliases=${results.posts.aliases}`);
  console.log(`courses: created=${results.courses.created}, skipped=${results.courses.skipped}, aliases=${results.courses.aliases}`);

  const totalCreated = results.posts.created + results.courses.created;
  if (totalCreated > 0) {
    console.log(`\n✅ ${totalCreated} új dokumentum seed-elve a Firestore-ba!`);
    console.log('A /hirek és /tudastar oldalak MOSTANTÓL tartalmat mutatnak!');
  } else {
    console.log('\n✅ Mindkét collection már tartalmazott adatokat — NINCS szükség seed-re.');
  }

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
