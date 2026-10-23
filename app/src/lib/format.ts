import { type Lang, gameHoursToMs } from '@rifftown/shared';

export const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

/** Gerçek süreyi okunur biçimde yazar: "2 sa 5 dk", "45 sn". */
export function duration(ms: number, lang: Lang): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const u = lang === 'en' ? { d: 'd', h: 'h', m: 'min', s: 's' } : { d: 'g', h: 'sa', m: 'dk', s: 'sn' };
  if (d > 0) return `${d} ${u.d} ${h} ${u.h}`;
  if (h > 0) return m > 0 ? `${h} ${u.h} ${m} ${u.m}` : `${h} ${u.h}`;
  if (m > 0) return m >= 5 || sec === 0 ? `${m} ${u.m}` : `${m} ${u.m} ${sec} ${u.s}`;
  return `${sec} ${u.s}`;
}

/** Oyun saatinin gerçek karşılığı */
export const realDuration = (gameHours: number, speed: number, lang: Lang) =>
  duration(gameHoursToMs(gameHours, speed), lang);

/** Geri sayım: 1:05:09 ya da 05:09 */
export function countdown(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export const stars = (fame: number) => {
  const v = Math.round(Math.max(0, Math.min(100, fame)) / 10) / 2;
  return '★'.repeat(Math.floor(v)) + (v % 1 ? '½' : '') || '—';
};

export const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

export function dateTime(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
}
