// Makam yetkileri: her makamın şehirde dar ve tavanlı tek bir kararı vardır (sadece VIP makam sahipleri karar verir).
//
// - Belediye başkanı: konser bilet vergisi (0–%5). Vergi bilet gelirinden kesilir ve oyundan çıkar (şehir kasası);
//   başkanın cebine gitmez. Para basmaz, tersine para yutağıdır.
// - Vali: işletme ruhsat harcı (haftalık işletme gideri ×0,8–×1,2). İndirim para basmaz (yalnızca daha az para yutulur)
//   ama bedeli valinin maaşından düşer: her indirim basamağı maaşı %10 azaltır.
// - Emniyet müdürü: devriye (-1 gevşek … +2 çok sıkı). Her basamak suç başarı şansını 3 puan düşürür, soruşturmanın
//   faili bulma şansını 3 puan artırır; sıkı devriyenin bedeli şehirdeki konser seyircisinin basamak başına %1 azalmasıdır.
//
// Kararlar seçimle el değiştirir: makam sahibi değişince karar varsayılana (0) döner. NPC makam sahibi karar vermez
// (yetki varsayılanda kalır). Maaşlar hiçbir kararla artmaz. Her karar kayıtlıdır ve şehirde haber olur.
// VIP olmayanlara karar seviyesi yalnızca yönüyle (−1/0/1) gider (visibility.ts), uygulama kelimeyle gösterir.

import type { Office } from './careers';
import type { L } from './world';

export type OfficeId = Office['id'];
export type PolicyId = 'ticket_tax' | 'business_fee' | 'patrol';

export interface PolicyDef {
  id: PolicyId;
  office: OfficeId;
  /** Karar basamağı aralığı; varsayılan 0 */
  min: number;
  max: number;
  name: L;
  about: L;
}

export const POLICIES: Record<OfficeId, PolicyDef> = {
  mayor: {
    id: 'ticket_tax',
    office: 'mayor',
    min: 0,
    max: 5,
    name: { tr: 'Konser bilet vergisi', en: 'Gig ticket tax' },
    about: {
      tr: 'Şehirdeki konserlerin bilet gelirinden kesilen vergi (basamak başına %1, en fazla %5). Vergi şehir kasasına gider, başkana değil.',
      en: 'A tax on ticket revenue from gigs in the city (1% per step, up to 5%). It goes to the city, not to the mayor.',
    },
  },
  governor: {
    id: 'business_fee',
    office: 'governor',
    min: -2,
    max: 2,
    name: { tr: 'İşletme ruhsat harcı', en: 'Business licence fee' },
    about: {
      tr: 'Şehirdeki işletmelerin haftalık gideri, basamak başına %10 (en fazla ±%20). İndirimin bedeli valinin maaşından düşer.',
      en: 'Weekly running costs of businesses in the city, 10% per step (up to ±20%). Cuts are paid for out of the governor\'s salary.',
    },
  },
  police_chief: {
    id: 'patrol',
    office: 'police_chief',
    min: -1,
    max: 2,
    name: { tr: 'Devriye yoğunluğu', en: 'Patrol intensity' },
    about: {
      tr: 'Her basamak suçun tutma şansını 3 puan düşürür, soruşturmanın faili bulma şansını 3 puan artırır. Sıkı devriye şehirdeki konser seyircisini basamak başına %1 azaltır.',
      en: 'Each step lowers the odds of a crime by 3 points and raises the odds of solving one by 3 points. Tight patrols cut gig crowds in the city by 1% per step.',
    },
  },
};
export const POLICY_LIST: PolicyDef[] = Object.values(POLICIES);

/** Aynı makam sahibi kararını en fazla bu kadar oyun saatinde bir değiştirebilir (haber seli ve oyun bozanlık olmasın) */
export const POLICY_CHANGE_COOLDOWN_HOURS = 24;

export const TICKET_TAX_STEP = 0.01;
export const BUSINESS_FEE_STEP = 0.1;
/** Valinin her indirim basamağı maaşından bu oranı düşürür */
export const GOVERNOR_CUT_SALARY_STEP = 0.1;
export const PATROL_CRIME_STEP = 0.03;
export const PATROL_SOLVE_STEP = 0.03;
export const PATROL_AUDIENCE_STEP = 0.01;

/** Geçersiz ya da aralık dışı değer daima aralığa çekilir (eski kayıt, elle düzenleme) */
export const clampPolicy = (office: OfficeId, level: number) => {
  const d = POLICIES[office];
  const v = Math.round(Number(level) || 0);
  return Math.min(d.max, Math.max(d.min, v));
};

/** Konser bilet gelirinden kesilen vergi oranı (0–0,05) */
export const ticketTaxRate = (level: number) => clampPolicy('mayor', level) * TICKET_TAX_STEP;
/** İşletme gideri çarpanı (0,8–1,2) */
export const businessFeeMult = (level: number) => Math.round((1 + clampPolicy('governor', level) * BUSINESS_FEE_STEP) * 100) / 100;
/** Suç başarı şansına eklenen (eksi = zorlaşır): -0,06 … +0,03 */
export const patrolCrimeDelta = (level: number) => -clampPolicy('police_chief', level) * PATROL_CRIME_STEP;
/** Soruşturmanın faili bulma şansına eklenen: -0,03 … +0,06 */
export const patrolSolveDelta = (level: number) => clampPolicy('police_chief', level) * PATROL_SOLVE_STEP;
/** Şehirdeki konser seyircisi çarpanı: yalnızca sıkı devriyede düşer (0,98–1) */
export const patrolAttendanceMult = (level: number) => 1 - Math.max(0, clampPolicy('police_chief', level)) * PATROL_AUDIENCE_STEP;

/** Makam maaşı karar sonrası: hiçbir karar maaşı artırmaz; valinin indirimi maaşından düşer */
export const officeSalary = (base: number, office: OfficeId, level: number) =>
  office === 'governor' ? Math.round(base * (1 - Math.max(0, -clampPolicy('governor', level)) * GOVERNOR_CUT_SALARY_STEP)) : base;

/** Kararın yönü: kelimeyle gösterim için (-1, 0, 1). VIP olmayanlara sunucu da yalnızca bunu gönderir. */
export const policyDirection = (level: number) => Math.sign(Math.round(Number(level) || 0)) as -1 | 0 | 1;

/** Kararın kelimeyle adı (yönden): uygulama ve haberler bunu kullanır */
export const POLICY_WORDS: Record<PolicyId, Record<-1 | 0 | 1, L>> = {
  ticket_tax: {
    [-1]: { tr: 'vergi yok', en: 'no tax' },
    0: { tr: 'vergi yok', en: 'no tax' },
    1: { tr: 'bilet vergisi var', en: 'ticket tax in force' },
  },
  business_fee: {
    [-1]: { tr: 'indirimli', en: 'reduced' },
    0: { tr: 'normal', en: 'standard' },
    1: { tr: 'zamlı', en: 'raised' },
  },
  patrol: {
    [-1]: { tr: 'gevşek', en: 'light' },
    0: { tr: 'normal', en: 'normal' },
    1: { tr: 'sıkı', en: 'tight' },
  },
};

/** VIP'e kesin değer: "%3", "×1,1", "+2" */
export function policyExact(id: PolicyId, level: number, lang: 'tr' | 'en'): string {
  const n = (v: number) => (lang === 'tr' ? String(v).replace('.', ',') : String(v));
  if (id === 'ticket_tax') return `%${Math.round(ticketTaxRate(level) * 100)}`;
  if (id === 'business_fee') return `×${n(businessFeeMult(level))}`;
  return level > 0 ? `+${level}` : String(level);
}

/**
 * Şehir haberi (kelimeyle; kesin sayı yok, VIP olmayan da okuyabilir): {who} kararı verdi ya da seçimle sıfırlandı.
 * change: yükseldi (1), düştü (-1); reset: makam el değiştirdi ve karar varsayılana döndü.
 */
export function policyNews(id: PolicyId, change: 'up' | 'down' | 'reset', who: string, city: L): { tr: { title: string; body: string }; en: { title: string; body: string } } {
  const T: Record<PolicyId, Record<'up' | 'down' | 'reset', { tr: [string, string]; en: [string, string] }>> = {
    ticket_tax: {
      up: {
        tr: ['{city}: konser biletlerine vergi zammı', 'Belediye başkanı {who} konser bilet vergisini artırdı. Vergi şehir kasasına gidiyor.'],
        en: ['{city}: gig ticket tax goes up', 'Mayor {who} raised the gig ticket tax. The money goes to the city.'],
      },
      down: {
        tr: ['{city}: konser bilet vergisi indi', 'Belediye başkanı {who} konser bilet vergisini düşürdü.'],
        en: ['{city}: gig ticket tax comes down', 'Mayor {who} lowered the gig ticket tax.'],
      },
      reset: {
        tr: ['{city}: bilet vergisi kalktı', 'Belediye başkanlığı el değiştirdi; konser bilet vergisi varsayılana döndü.'],
        en: ['{city}: ticket tax scrapped', 'The mayor\'s office changed hands; the gig ticket tax is back to the default.'],
      },
    },
    business_fee: {
      up: {
        tr: ['{city}: işletme harçlarına zam', 'Vali {who} işletme ruhsat harcını artırdı.'],
        en: ['{city}: business fees go up', 'Governor {who} raised the business licence fee.'],
      },
      down: {
        tr: ['{city}: işletmelere harç indirimi', 'Vali {who} işletme ruhsat harcını düşürdü; indirimin bedeli valinin maaşından.'],
        en: ['{city}: business fees cut', 'Governor {who} cut the business licence fee, paid for out of the governor\'s own salary.'],
      },
      reset: {
        tr: ['{city}: işletme harcı normale döndü', 'Valilik el değiştirdi; işletme ruhsat harcı varsayılana döndü.'],
        en: ['{city}: business fee back to normal', 'The governorship changed hands; the business licence fee is back to the default.'],
      },
    },
    patrol: {
      up: {
        tr: ['{city}: sokaklarda devriye arttı', 'Emniyet müdürü {who} devriyeleri sıklaştırdı. Suçlular zor günler bekliyor; konserlere gelen biraz azalabilir.'],
        en: ['{city}: more patrols on the streets', 'Police chief {who} stepped up patrols. Hard times for criminals; gig crowds may thin a little.'],
      },
      down: {
        tr: ['{city}: devriye azaldı', 'Emniyet müdürü {who} devriyeleri seyreltti.'],
        en: ['{city}: fewer patrols', 'Police chief {who} scaled patrols back.'],
      },
      reset: {
        tr: ['{city}: devriye normale döndü', 'Emniyet müdürlüğü el değiştirdi; devriye yoğunluğu varsayılana döndü.'],
        en: ['{city}: patrols back to normal', 'The police chief\'s office changed hands; patrol intensity is back to the default.'],
      },
    },
  };
  const fill = (s: string, lang: 'tr' | 'en') => s.replace(/\{who\}/g, who).replace(/\{city\}/g, city[lang]);
  const t = T[id][change];
  return {
    tr: { title: fill(t.tr[0], 'tr'), body: fill(t.tr[1], 'tr') },
    en: { title: fill(t.en[0], 'en'), body: fill(t.en[1], 'en') },
  };
}
