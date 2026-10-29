// Kesin sayılar VIP'e özeldir. VIP olmayan oyunculara giden her yanıtta beceri, kalite, aşinalık,
// şöhret, ruh hâli ve sağlık değerleri seviye içinde kaba adımlara yuvarlanır (bkz. blurValue).
// Tek bir yanıt kancasıyla uygulandığı için yeni eklenen ekranlar da kendiliğinden korunur.
// Oyun hesapları her zaman veritabanındaki ham sayılarla yapılır; bu dosya sadece gösterimi etkiler.

import { type ScaleName, blurValue } from '@rifftown/shared';
import type { FastifyInstance } from 'fastify';

type Rule = { scale: ScaleName; map?: boolean };

/** Anahtar adı → ölçek. map: true ise değer { id: sayı } biçiminde bir nesnedir. */
const KEY_RULES: Record<string, Rule[]> = {
  skills: [{ scale: 'skill', map: true }],
  level: [{ scale: 'skill' }],
  skill: [{ scale: 'skill' }], // grup üyesinin rol becerisi (sayıysa); beceri kimliği metindir, dokunulmaz
  mood: [{ scale: 'mood' }],
  baseMood: [{ scale: 'mood' }],
  energy: [{ scale: 'energy' }],
  inspiration: [{ scale: 'inspiration' }],
  health: [{ scale: 'health' }],
  quality: [{ scale: 'quality' }],
  recordingQuality: [{ scale: 'quality' }],
  score: [{ scale: 'quality' }],
  myFamiliarity: [{ scale: 'familiarity' }],
  familiarity: [{ scale: 'familiarity' }, { scale: 'familiarity', map: true }],
  fame: [{ scale: 'fame' }, { scale: 'fame', map: true }],
  press: [{ scale: 'press' }, { scale: 'press', map: true }],
  // Profesörün götürebileceği en yüksek seviye bir beceri değeridir
  maxLevel: [{ scale: 'skill' }],
  // Karakter nitelikleri (attributes.ts): { charm: sayı, ... }
  attributes: [{ scale: 'attribute', map: true }],
  // İlişki sayaçları (takılma, flört, ilişki ekranı): kelime ölçeğindeki gibi bulanık (playtest Y-5)
  friendship: [{ scale: 'friendship' }],
  romance: [{ scale: 'romance' }],
};

/** Beceri ya da arkadaşlık artışı (`gain`): yalnızca gainText'in basamağı (hiç / çok az / biraz / epey / çok).
 *  Başlangıç becerisi bilindiği için kesin artışlar toplanınca kesin beceri bulunuyordu (12 + 2,98 + 5,54). */
export function blurGain(v: number): number {
  if (!(v > 0)) return 0;
  return v < 0.5 ? 0.1 : v < 1.5 ? 0.5 : v < 3 ? 1.5 : 3;
}

/** Şöhret değişimi: uygulamadaki fameChangeKey basamakları (çok arttı ≥1,5 / arttı / aynı / düştü / çok düştü) */
export function blurFameDelta(v: number): number {
  if (v === 0) return 0;
  const a = Math.abs(v);
  return Math.sign(v) * (a >= 1.5 ? 1.5 : 0.5);
}

/** Diğer bütün `...Delta` alanları (ruh hâli, sağlık, enerji, ilham değişimi): 5'lik adımlarla sıfıra doğru.
 *  Başlangıç değeri (ruh hâli 80, sağlık 100) bilindiğinden kesin değişimler toplanınca kesin değer çıkıyordu. */
export const blurDelta = (v: number) => Math.sign(v) * Math.floor(Math.abs(v) / 5) * 5;

/** Bu anahtarlarda VIP olmayanlara 10'luk adımlarla */
const COARSE_10 = new Set(['wear', 'morale', 'attributeRoom']);
/** Bu anahtarlarda 5'lik adımlarla aşağı, sıfırdan büyükse en az 1 (şarkıya ilhamın katkısı: ilhamın kesin değerini
 *  ele vermesin; uygulama kelimeyle gösterir) */
const COARSE_5 = new Set(['inspirationBonus']); // attributeRoom: nitelik toplamının tavana kalanı (toplamı ele vermesin)
/** Bu anahtarlarda VIP olmayanlara yalnızca işaret (-1, 0, 1) gider */
// policyLevel, oldLevel, newLevel: makam kararlarının basamağı (civic-powers.ts); VIP olmayan yalnızca yönünü görür
const SIGN_ONLY = new Set(['flow', 'pressDelta', 'impact', 'policyLevel', 'oldLevel', 'newLevel']);

function blurNode(node: unknown, depth = 0): unknown {
  if (depth > 12 || node === null || typeof node !== 'object') return node;
  if (Array.isArray(node)) return node.map((x) => blurNode(x, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    const rules = KEY_RULES[k];
    if (rules && typeof v === 'number') {
      const r = rules.find((x) => !x.map);
      out[k] = r ? blurValue(r.scale, v) : v;
    } else if (rules && v && typeof v === 'object' && !Array.isArray(v)) {
      const r = rules.find((x) => x.map);
      out[k] = r
        ? Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([id, n]) => [id, typeof n === 'number' ? blurValue(r.scale, n) : n]))
        : blurNode(v, depth + 1);
    } else if (k === 'gain' && typeof v === 'number') {
      out[k] = blurGain(v);
    } else if (k === 'fameDelta' && typeof v === 'number') {
      out[k] = blurFameDelta(v);
    } else if (k.endsWith('Delta') && !SIGN_ONLY.has(k) && typeof v === 'number') {
      out[k] = blurDelta(v);
    } else if (COARSE_5.has(k) && typeof v === 'number') {
      out[k] = v <= 0 ? 0 : v < 5 ? 1 : Math.floor(v / 5) * 5;
    } else if (k === 'chance' && typeof v === 'number') {
      // Suç başarı şansı: VIP olmayanlara sadece düşük / orta / yüksek (uygulamadaki eşiklerle aynı)
      out[k] = v < 0.35 ? 0.2 : v < 0.65 ? 0.5 : 0.8;
    } else if (COARSE_10.has(k) && typeof v === 'number') {
      // Yıpranma ve moral: VIP olmayanlara 10'luk adımlarla
      out[k] = Math.floor(v / 10) * 10;
    } else if (SIGN_ONLY.has(k) && typeof v === 'number') {
      // Etkinin yalnızca yönü gösterilir (setlist sırası, basın etkisi vb.)
      out[k] = Math.sign(v);
    } else if (k === 'dueDays' && typeof v === 'number') {
      // Doğuma kalan süre: VIP olmayanlara beşer günlük adımlarla
      out[k] = Math.ceil(v / 5) * 5;
    } else if (k === 'lessonRate' && typeof v === 'number') {
      // Ders verimi: VIP olmayanlara yarımlık adımlarla (öğretmenin rütbesi ve ilişki seviyesi tam okunamasın)
      out[k] = Math.floor(v * 2) / 2;
    } else if (k === 'maxBandShare' && typeof v === 'number') {
      // Liderin sözleşme hukukunu ele vermesin: yüzde puanına aşağı yuvarlanır
      out[k] = Math.floor(v * 100 + 1e-6) / 100;
    } else if (k === 'totalFame' && typeof v === 'number') {
      out[k] = Math.round(v);
    } else {
      out[k] = blurNode(v, depth + 1);
    }
  }
  return out;
}

export const blurForNonVip = (payload: unknown) => blurNode(payload);

/** Bulanıklaştırılan sayısal anahtarlar (görünürlük testi). `...Delta` ile biten her anahtar da bulanıktır. */
export const BLURRED_NUMERIC_KEYS: ReadonlySet<string> = new Set([
  ...Object.keys(KEY_RULES), ...COARSE_10, ...COARSE_5, ...SIGN_ONLY,
  'gain', 'chance', 'dueDays', 'lessonRate', 'maxBandShare', 'totalFame',
]);
export const isBlurredKey = (k: string) => BLURRED_NUMERIC_KEYS.has(k) || k.endsWith('Delta');

/** Bilerek kesin gönderilen sayısal alanlar: para ve fiyatlar (oyuncunun kendi bakiyesi, tam gösterilir), kimlikler,
 *  sayaçlar, süreler ve zamanlar, oyunun ilan ettiği sabitler, harcanan bakiye olan XP. Bunların hiçbiri bir ölçeğin
 *  kesin değerini ele vermez. Yeni bir sayısal alan bu listeye ya da bulanık kurallara eklenmeden görünürlük testi geçmez. */
export const EXACT_NUMERIC_KEYS: ReadonlySet<string> = new Set([
  // kimlikler
  'id', 'actionId', 'authorId', 'bandId', 'bestSongId', 'characterId', 'fromId', 'toId', 'gigId', 'leaderId', 'songId',
  'setlist', 'weekId', 'step', 'generation', 'caseId', 'scandalId', 'suspectId', 'releaseId',
  // para (oyuncunun kendi parası ve gelir kalemleri tam gösterilir; tasarım: "para olarak tam gösterilir")
  'money', 'bank', 'cost', 'fee', 'price', 'pay', 'reward', 'revenue', 'perMember', 'cityTax', 'ownerShare', 'crewFee',
  'productionCost', 'inheritance', 'fine', 'totalRevenue', 'share', 'loot', 'sessionCut',
  // eşyanın dükkânda ilan edilen bonusu (+3 / +7 ...), plak satış adedi (listeler herkese açık)
  'bonus', 'totalUnits', 'weeksOnSale', 'units', 'lastWeekUnits', 'position', 'lastPosition', 'bestPosition',
  // sayaçlar ve süreler
  'achievementPoints', 'points', 'age', 'attendance', 'completed', 'convictions', 'friendsCount', 'hours', 'memberCount',
  'members', 'n', 'pendingInvites', 'pendingTrades', 'playersHere', 'policeOnDuty', 'presentCount', 'progress', 'target',
  'total', 'toursDone', 'unreadMessages', 'unreadNotifications', 'unsolvedCount', 'heirloomLimit', 'players', 'qty',
  'sentenceHours',
  // oyunun sabitleri ve eylem parametreleri
  'costMult', 'fraction', 'tipFactor', 'gameSpeed', 'focus',
  // XP harcanan bir bakiyedir (tasarım: tam sayı gösterilir)
  'xp', 'xpDay', 'xpDayCap', 'xpWeek', 'xpWeekCap',
]);

/** /api altındaki yanıtlara uygulanır. VIP ve yöneticiler ham sayıları görür.
 *  Kanca doğrudan /api kapsamına eklenmelidir (register ile değil), yoksa alt rotalara uygulanmaz. */
export function addVisibilityHook(app: FastifyInstance) {
  app.addHook('preSerialization', async (req, _reply, payload) => {
    const u = req.user;
    if (!u || u.isVip || u.isAdmin) return payload;
    return blurForNonVip(payload);
  });
}

