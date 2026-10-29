// Basit içerik filtresi: sohbet, özel mesaj, ziyaretçi defteri ve profil yazılarında küfür ve hakaretleri yıldızlar;
// ad, grup adı, işletme adı gibi kalıcı adlarda ise reddedilir. Yöneticinin moderasyonunun ve şikâyet sisteminin yerini tutmaz,
// sadece ilk filtre katmanıdır (App Store ve Google Play kullanıcı içeriği kuralları bunu ister).

// ---------- Ortak metin temizleyici ----------
// Oyuncunun yazdığı her serbest metin (sohbet, mesaj, defter, profil, şarkı/tur/eşya adı, haber, blog, pano, not, şikâyet)
// buradan geçer; eskiden sohbet temizlenmiyor, profil ve mesaj ayrı kopyalarla temizleniyordu (playtest O-5, O-6).

/** C0/C1 kontrol karakterleri (NUL dahil); çok satırlı metinde \n kalır */
const CONTROL_MULTI = /[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/g;
const CONTROL_SINGLE = /[\u0000-\u001f\u007f-\u009f]/g;
/** Görünmez ve yön değiştiren karakterler (ad taklidi, ters yazı): sıfır genişlikli boşluklar, LRM/RLM, gömme ve
 *  yalıtım işaretleri, kelime birleştirici, BOM, yumuşak tire, satır/paragraf ayırıcı, Arapça harf işareti */
const INVISIBLE = /[\u00ad\u061c\u180e\u200b-\u200f\u2028-\u202e\u2060-\u2064\u2066-\u206f\ufeff\ufff9-\ufffb]/g;
/** Bir harfin üstüne en fazla bu kadar birleşik işaret (aksan) kalır; "zalgo" metin satırları taşırmasın */
export const MAX_COMBINING_MARKS = 3;
const ZALGO = new RegExp(`(\\p{M}{${MAX_COMBINING_MARKS}})\\p{M}+`, 'gu');

/** Kontrol, görünmez ve yön değiştiren karakterleri atar, birleşik işaret yığınlarını kırpar.
 *  singleLine: satır sonları da atılır (ad, başlık). Çok satırlıda üç ve fazla boş satır ikiye iner. */
export function cleanText(v: string, singleLine = false): string {
  const x = v
    .replace(singleLine ? CONTROL_SINGLE : CONTROL_MULTI, '')
    .replace(INVISIBLE, '')
    .replace(ZALGO, '$1');
  return singleLine ? x.trim() : x.replace(/\n{3,}/g, '\n\n').trim();
}

/** Metinde NUL ya da veritabanına yazılamayacak eşleşmemiş vekil (surrogate) karakter var mı */
export function hasUnsafeChars(v: string): boolean {
  return /\u0000|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/.test(v);
}

/** Ayrı kelime olarak geçtiğinde yakalananlar (kısa ve başka kelimelerin içinde geçebilecek olanlar) */
const WORDS = [
  // Türkçe
  'amk', 'aq', 'amq', 'sik', 'sikik', 'siktir', 'sikerim', 'sokarım', 'göt', 'götveren', 'piç', 'ibne', 'gavat', 'yavşak',
  'kahpe', 'pezevenk', 'puşt', 'oç', 'mk', 'amına', 'amını', 'ananı', 'ananın', 'avradını',
  // İngilizce
  'fuck', 'fucker', 'fucking', 'shit', 'cunt', 'bitch', 'whore', 'slut', 'dick', 'cock', 'pussy', 'asshole', 'bastard',
  'fag', 'faggot', 'retard', 'nigga', 'nigger', 'kike', 'spic', 'twat', 'wanker',
];
/** Kelimenin içinde geçse de yakalananlar (başka masum kelimelerde geçmeyecek kadar belirgin olanlar) */
const STEMS = ['orospu', 'yarrak', 'amcık', 'sikiş', 'siktiğ', 'motherfuck', 'fuck', 'nigger', 'faggot'];

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's', '!': 'i' };

/** Karşılaştırma için normalleştirir: küçük harf (Türkçe), leet harfler, tekrar eden harfler */
export function normalizeForFilter(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/[013457@$!]/g, (ch) => LEET[ch] ?? ch)
    .replace(/(\p{L})\1+/gu, '$1');
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const WORD_RE = new RegExp(`(?<![\\p{L}\\p{N}])(${WORDS.map(escape).join('|')})(?![\\p{L}\\p{N}])`, 'giu');
const STEM_RE = new RegExp(`(${STEMS.map(escape).join('|')})`, 'giu');

export function containsProfanity(text: string): boolean {
  const n = normalizeForFilter(text);
  WORD_RE.lastIndex = 0;
  STEM_RE.lastIndex = 0;
  return WORD_RE.test(n) || STEM_RE.test(n);
}

/** Küfürleri yıldızlar. Önce harf konumları korunarak denenir; tekrar eden harflerle yazılmışsa normalleştirilmiş metin döner. */
export function maskProfanity(text: string): string {
  if (!containsProfanity(text)) return text;
  const mask = (source: string, base: string) => {
    const out = source.split('');
    let hit = false;
    for (const re of [WORD_RE, STEM_RE]) {
      re.lastIndex = 0;
      for (const m of base.matchAll(re)) {
        hit = true;
        for (let i = m.index!; i < m.index! + m[0].length; i++) out[i] = '*';
      }
    }
    return hit ? out.join('') : null;
  };
  const lowered = text.toLocaleLowerCase('tr-TR').replace(/[013457@$!]/g, (ch) => LEET[ch] ?? ch);
  if (lowered.length === text.length) {
    const r = mask(text, lowered);
    if (r) return r;
  }
  const n = normalizeForFilter(text);
  return mask(n, n) ?? n;
}
