/**
 * Seed Firestore with stock data from src/constants.
 * Run: npx tsx scripts/seed-firestore.ts
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ESM-safe firebase-admin import
// cert, initializeApp, firestore, FieldValue are all in firebase-admin/app
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const sa: Record<string, string> = JSON.parse(
  readFileSync(resolve('/root/.hermes/secrets/firebase-service-account.json'), 'utf-8'),
);

initializeApp({ credential: cert(sa as any) });
const db = getFirestore("ai-studio-3099fea7-9321-43de-ba26-9cf40429bac2");

const COURSES = [
  {
    id: '1', title: 'AI kezdőknek',
    description: 'Ismerd meg a ChatGPT, Midjourney és más forradalmi eszközök alapjait és gyakorlati alkalmazását.',
    level: 'Kezdő', accessType: 'free', duration: '12 óra', rating: 4.9, students: 1240,
    price: 'Ingyenes', category: 'Akadémia',
    imageUrl: 'https://picsum.photos/seed/course1/800/600',
    features: ['ChatGPT alapok', 'Prompt engineering', 'Képgenerálás', 'Etikai alapok'],
    status: 'active', publishDate: '2026-04-01', expiryDate: '', modules: 8,
    curriculum: [
      { title: 'Mi az a Generatív AI?', duration: '45 perc' },
      { title: 'A ChatGPT hatékony használata', duration: '90 perc' },
      { title: 'Képgenerálás Midjourney-vel', duration: '120 perc' },
      { title: 'AI eszközök a mindennapi munkában', duration: '60 perc' },
    ],
  },
  {
    id: '2', title: 'Prompt Engineering alapok',
    description: 'Tanuld meg, hogyan hozz ki maximumot a nagy nyelvi modellekből komplex üzleti feladatokhoz.',
    level: 'Haladó', accessType: 'premium', duration: '20 óra', rating: 4.8, students: 850,
    price: '24.900 Ft', category: 'Akadémia',
    imageUrl: 'https://picsum.photos/seed/course2/800/600',
    features: ['Láncolt promptek', 'Szerepkör alapú AI', 'Adatfeldolgozás', 'Automatizálás'],
    status: 'active', publishDate: '2026-03-28', expiryDate: '', modules: 12,
    curriculum: [
      { title: 'Prompting technikák mélyrepülés', duration: '120 perc' },
      { title: 'Láncolt és rekurzív promptek', duration: '180 perc' },
      { title: 'AI ügynökök építése', duration: '240 perc' },
      { title: 'Üzleti folyamatok automatizálása', duration: '150 perc' },
    ],
  },
  {
    id: '3', title: 'AI az üzletben',
    description: 'Hogyan integráld a mesterséges intelligenciát a vállalati munkafolyamatokba a hatékonyság növelése érdekében.',
    level: 'Középhaladó', accessType: 'premium', duration: '15 óra', rating: 4.7, students: 620,
    price: '39.900 Ft', category: 'Akadémia',
    imageUrl: 'https://picsum.photos/seed/course3/800/600',
    features: ['Munkafolyamat elemzés', 'AI eszközök kiválasztása', 'ROI számítás', 'Implementáció'],
    status: 'active', publishDate: '2026-03-25', expiryDate: '', modules: 10,
    curriculum: [
      { title: 'AI stratégia kialakítása', duration: '90 perc' },
      { title: 'Eszközválasztás és tesztelés', duration: '120 perc' },
      { title: 'Változásmenedzsment az AI korában', duration: '150 perc' },
      { title: 'Esettanulmányok és gyakorlat', duration: '180 perc' },
    ],
  },
  {
    id: '4', title: 'Python Programozás AI Fejlesztőknek',
    description: 'Sajátítsd el a Python alapjait, amire szükséged lesz saját AI alkalmazások és scriptek írásához.',
    level: 'Kezdő', accessType: 'premium', duration: '30 óra', rating: 4.9, students: 2100,
    price: '19.900 Ft', category: 'Akadémia',
    imageUrl: 'https://picsum.photos/seed/course4/800/600',
    features: ['Python alapok', 'NumPy & Pandas', 'API integráció', 'Saját chatbot építése'],
    status: 'active', publishDate: '2026-03-20', expiryDate: '', modules: 15,
    curriculum: [
      { title: 'Python alapok és adattípusok', duration: '180 perc' },
      { title: 'Adatkezelés és elemzés', duration: '240 perc' },
      { title: 'Webes API-k és AI integráció', duration: '300 perc' },
      { title: 'Saját AI alkalmazás fejlesztése', duration: '360 perc' },
    ],
  },
];

const POSTS = [
  {
    id: '1', title: 'A GPT-5 fejlesztése új mérföldkőhöz érkezett',
    excerpt: 'A legfrissebb jelentések szerint az OpenAI új modellje minden eddiginél jobb érvelési képességekkel rendelkezik...',
    content: 'A GPT-5 fejlesztése gőzerővel halad. Az OpenAI belső forrásai szerint a modell már a tesztelési fázis végén jár.',
    date: '2026. április 3.', author: 'Admin', category: 'Generatív AI', readTime: '5 perc',
    imageUrl: 'https://picsum.photos/seed/ai1/1200/600',
    status: 'active', publishDate: '2026-04-03', expiryDate: '',
  },
  {
    id: '2', title: 'Az AI szerepe a fenntartható energiagazdálkodásban',
    excerpt: 'Hogyan segítenek a gépi tanulási algoritmusok az elektromos hálózatok optimalizálásában...',
    content: 'Az energiaipar forradalom előtt áll.',
    date: '2026. április 2.', author: 'Kovács János', category: 'Üzleti Automatizáció', readTime: '8 perc',
    imageUrl: 'https://picsum.photos/seed/ai2/1200/600',
    status: 'active', publishDate: '2026-04-02', expiryDate: '',
  },
  {
    id: '3', title: 'Etikai kérdések az autonóm rendszerek világában',
    excerpt: 'A szakértők szerint sürgős szabályozásra van szükség az AI által vezérelt döntéshozatali folyamatokban...',
    content: 'Az etika és az AI kapcsolata sosem volt ennyire aktuális.',
    date: '2026. április 1.', author: 'Admin', category: 'Szabályozás', readTime: '6 perc',
    imageUrl: 'https://picsum.photos/seed/ai3/1200/600',
    status: 'active', publishDate: '2026-04-01', expiryDate: '',
  },
  {
    id: '4', title: 'Új AI eszközök a kreatív ipar számára',
    excerpt: 'A generatív művészet és a videókészítés új korszaka köszöntött be...',
    content: 'A művészek és tervezők számára az AI már nem fenyegetés, hanem egy új ecset.',
    date: '2026. március 30.', author: 'Szabó Anna', category: 'AI eszközök', readTime: '4 perc',
    imageUrl: 'https://picsum.photos/seed/ai4/1200/600',
    status: 'active', publishDate: '2026-03-30', expiryDate: '',
  },
];

async function seedCollection(
  collectionName: string,
  docs: Array<Record<string, unknown>>,
) {
  const colRef = db.collection(collectionName);
  const snap = await colRef.limit(1).get();
  if (!snap.empty) {
    console.log(`[SKIP] ${collectionName}: already has data`);
    return;
  }

  const batch = db.batch();
  for (const doc of docs) {
    const { id, ...data } = doc;
    const ref = colRef.doc(String(id));
    batch.set(ref, { ...data, createdAt: FieldValue.serverTimestamp() });
  }
  await batch.commit();
  console.log(`[SEED] ${collectionName}: ${docs.length} docs written`);
}

async function main() {
  console.log('=== Firestore Seed ===\n');
  await seedCollection('courses', COURSES);
  await seedCollection('posts', POSTS);
  console.log('\nDone.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
