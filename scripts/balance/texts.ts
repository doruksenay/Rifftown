// Metin çeşitliliği (madde 9): gerçek gigReview ile 200 sentetik konser. Cümleler kalıba indirgenir (sayı, mekân,
// şehir, şarkı ve rakip adı yer tutucuya çevrilir) ve tekrar oranı ölçülür.
import fs from 'node:fs';
import { gigReview, CITY_BY_ID, LOCATION_BY_ID, STAGE_EVENTS, VENUE_RULES } from '@rifftown/shared';
import { rng } from './lib/env';

const r = rng(9001);
const SONGS = ['Gece Yarısı', 'Kırık Saz', 'Neon', 'Eski Liman', 'Son Tren', 'Mavi', 'Yağmur', 'Dönüş'];
const RIVALS = ['Kızıl Tilkiler', 'Gece Kuşları', 'Mor Dalga'];

function career(cityPlan: (i: number) => string, label: string) {
  const sentences: string[][] = [];
  let gigId = 100;
  for (let i = 0; i < 200; i++) {
    gigId += 1 + Math.floor(r() * 25); // araya başka grupların konserleri girer
    const quality = Math.round(Math.max(5, Math.min(97, 25 + i * 0.25 + (r() * 20 - 10))));
    const venue = i < 60 ? 'bar' : i < 150 ? 'club' : 'hall';
    const cityId = cityPlan(i);
    const cap = VENUE_RULES[venue].capacity;
    const fill = Math.min(1, 0.15 + i / 220 + r() * 0.2);
    const ev = r() < 0.35 ? STAGE_EVENTS[Math.floor(r() * 6)] : null;
    const review = gigReview({
      cityId,
      events: ev ? [{ id: ev.id, outcome: r() < 0.6 ? 'success' : 'fail', name: ev.name }] : [],
      press: r() < 0.15 ? 65 : r() < 0.1 ? 5 : 20,
      rival: r() < 0.25 ? { name: RIVALS[Math.floor(r() * 3)], quality: quality + Math.round(r() * 30 - 15) } : null,
      quality,
      attendance: Math.round(cap * fill),
      capacity: cap,
      presentCount: r() < 0.05 ? 2 : 3,
      memberCount: 3,
      venue: LOCATION_BY_ID[`${cityId}-${venue}`].name,
      city: CITY_BY_ID[cityId].name,
      bestSong: SONGS[Math.floor(r() * SONGS.length)],
      seed: gigId,
      legendary: quality >= 90 && r() < 0.05,
    });
    const venueName = LOCATION_BY_ID[`${cityId}-${venue}`].name.tr;
    const norm = review.tr
      .split(venueName)
      .join('{mekân}')
      .split(CITY_BY_ID[cityId].name.tr)
      .join('{şehir}');
    let n = norm;
    for (const s of SONGS) n = n.split(s).join('{şarkı}');
    for (const s of RIVALS) n = n.split(s).join('{rakip}');
    n = n.replace(/\d+/g, '#');
    sentences.push(n.split(/(?<=[.!?…])\s+/).filter(Boolean));
  }
  const seen = new Set<string>();
  let total = 0;
  let after10 = 0;
  let after10New = 0;
  let reviewsAllRepeat = 0;
  const firstSeenAt: number[] = [];
  sentences.forEach((list, i) => {
    let fresh = 0;
    for (const s of list) {
      total++;
      const isNew = !seen.has(s);
      if (isNew) {
        seen.add(s);
        firstSeenAt.push(i);
        fresh++;
      }
      if (i >= 10) {
        after10++;
        if (isNew) after10New++;
      }
    }
    if (i >= 10 && fresh === 0) reviewsAllRepeat++;
  });
  const fullSeen = new Set(sentences.map((x) => x.join(' ')));
  return {
    label,
    reviews: sentences.length,
    sentences: total,
    distinctSentences: seen.size,
    repeatRate: Math.round((1 - seen.size / total) * 1000) / 1000,
    newSentenceRateAfter10: Math.round((after10New / after10) * 1000) / 1000,
    reviewsWithNoNewSentenceAfter10: Math.round((reviewsAllRepeat / 190) * 1000) / 1000,
    distinctFullReviews: fullSeen.size,
    newSentencesByBlock: [0, 10, 25, 50, 100, 150].map((from, k, arr) => {
      const to = arr[k + 1] ?? 200;
      return { from, to, newSentences: firstSeenAt.filter((x) => x >= from && x < to).length };
    }),
    examples: sentences.slice(0, 3).map((x) => x.join(' ')),
  };
}

const out = {
  oneCity: career(() => 'istanbul', 'Tek şehir (İstanbul), 200 konser'),
  touring: career((i) => ['istanbul', 'ankara', 'izmir', 'berlin', 'london'][i % 5], 'Beş şehir dönüşümlü, 200 konser'),
};
fs.mkdirSync('scripts/balance/out', { recursive: true });
fs.writeFileSync('scripts/balance/out/texts.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
