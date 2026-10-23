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
  health: [{ scale: 'health' }],
  quality: [{ scale: 'quality' }],
  recordingQuality: [{ scale: 'quality' }],
  score: [{ scale: 'quality' }],
  myFamiliarity: [{ scale: 'familiarity' }],
  familiarity: [{ scale: 'familiarity' }, { scale: 'familiarity', map: true }],
  fame: [{ scale: 'fame' }, { scale: 'fame', map: true }],
};

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
    } else if (k === 'chance' && typeof v === 'number') {
      // Suç başarı şansı: VIP olmayanlara onda bir adımlarla
      out[k] = Math.round(v * 10) / 10;
    } else if (k === 'totalFame' && typeof v === 'number') {
      out[k] = Math.round(v);
    } else {
      out[k] = blurNode(v, depth + 1);
    }
  }
  return out;
}

export const blurForNonVip = (payload: unknown) => blurNode(payload);

/** /api altındaki yanıtlara uygulanır. VIP ve yöneticiler ham sayıları görür.
 *  Kanca doğrudan /api kapsamına eklenmelidir (register ile değil), yoksa alt rotalara uygulanmaz. */
export function addVisibilityHook(app: FastifyInstance) {
  app.addHook('preSerialization', async (req, _reply, payload) => {
    const u = req.user;
    if (!u || u.isVip || u.isAdmin) return payload;
    return blurForNonVip(payload);
  });
}
