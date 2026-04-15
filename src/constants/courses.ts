/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COURSES = [
  {
    id: '1',
    title: 'AI kezdőknek',
    description: 'Ismerd meg a ChatGPT, Midjourney és más forradalmi eszközök alapjait és gyakorlati alkalmazását.',
    level: 'Kezdő',
    accessType: 'free',
    duration: '12 óra',
    rating: 4.9,
    students: 1240,
    price: 'Ingyenes',
    category: 'Akadémia',
    imageUrl: 'https://picsum.photos/seed/course1/800/600',
    features: ['ChatGPT alapok', 'Prompt engineering', 'Képgenerálás', 'Etikai alapok'],
    status: 'active',
    publishDate: '2026-04-01',
    expiryDate: '',
    modules: 8,
    curriculum: [
      { title: 'Mi az a Generatív AI?', duration: '45 perc' },
      { title: 'A ChatGPT hatékony használata', duration: '90 perc' },
      { title: 'Képgenerálás Midjourney-vel', duration: '120 perc' },
      { title: 'AI eszközök a mindennapi munkában', duration: '60 perc' }
    ]
  },
  {
    id: '2',
    title: 'Prompt Engineering alapok',
    description: 'Tanuld meg, hogyan hozz ki maximumot a nagy nyelvi modellekből komplex üzleti feladatokhoz.',
    level: 'Haladó',
    accessType: 'premium',
    duration: '20 óra',
    rating: 4.8,
    students: 850,
    price: '24.900 Ft',
    category: 'Akadémia',
    imageUrl: 'https://picsum.photos/seed/course2/800/600',
    features: ['Láncolt promptek', 'Szerepkör alapú AI', 'Adatfeldolgozás', 'Automatizálás'],
    status: 'active',
    publishDate: '2026-03-28',
    expiryDate: '',
    modules: 12,
    curriculum: [
      { title: 'Prompting technikák mélyrepülés', duration: '120 perc' },
      { title: 'Láncolt és rekurzív promptek', duration: '180 perc' },
      { title: 'AI ügynökök építése', duration: '240 perc' },
      { title: 'Üzleti folyamatok automatizálása', duration: '150 perc' }
    ]
  },
  {
    id: '3',
    title: 'AI az üzletben',
    description: 'Hogyan integráld a mesterséges intelligenciát a vállalati munkafolyamatokba a hatékonyság növelése érdekében.',
    level: 'Középhaladó',
    accessType: 'premium',
    duration: '15 óra',
    rating: 4.7,
    students: 620,
    price: '39.900 Ft',
    category: 'Akadémia',
    imageUrl: 'https://picsum.photos/seed/course3/800/600',
    features: ['Munkafolyamat elemzés', 'AI eszközök kiválasztása', 'ROI számítás', 'Implementáció'],
    status: 'active',
    publishDate: '2026-03-25',
    expiryDate: '',
    modules: 10,
    curriculum: [
      { title: 'AI stratégia kialakítása', duration: '90 perc' },
      { title: 'Eszközválasztás és tesztelés', duration: '120 perc' },
      { title: 'Változásmenedzsment az AI korában', duration: '150 perc' },
      { title: 'Esettanulmányok és gyakorlat', duration: '180 perc' }
    ]
  },
  {
    id: '4',
    title: 'Python Programozás AI Fejlesztőknek',
    description: 'Sajátítsd el a Python alapjait, amire szükséged lesz saját AI alkalmazások és scriptek írásához.',
    level: 'Kezdő',
    accessType: 'premium',
    duration: '30 óra',
    rating: 4.9,
    students: 2100,
    price: '19.900 Ft',
    category: 'Akadémia',
    imageUrl: 'https://picsum.photos/seed/course4/800/600',
    features: ['Python alapok', 'NumPy & Pandas', 'API integráció', 'Saját chatbot építése'],
    status: 'active',
    publishDate: '2026-03-20',
    expiryDate: '',
    modules: 15,
    curriculum: [
      { title: 'Python alapok és adattípusok', duration: '180 perc' },
      { title: 'Adatkezelés és elemzés', duration: '240 perc' },
      { title: 'Webes API-k és AI integráció', duration: '300 perc' },
      { title: 'Saját AI alkalmazás fejlesztése', duration: '360 perc' }
    ]
  }
];
