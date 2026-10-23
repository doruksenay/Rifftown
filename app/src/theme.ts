// Rifftown görsel dili (BRAND.md): neon bir müzik şehri.
// Marka renkleri: Neon Cyan #00E5FF, Hot Pink #FF2EB6, Electric Purple #8A2BFF,
// Sky Blue #3B82FF, Midnight Indigo #1A0E4B, Soft Off-White #F8F9FF.
// Başlıklar yuvarlak hatlı Fredoka, metinler Nunito ile. Köşeler yumuşak, ana düğmeler pembe→mor degrade.
// Açık temada küçük metinde kullanılan renkler okunurluk için (WCAG AA) markanın biraz koyu tonlarıdır.

import { useColorScheme } from 'react-native';

/** Markanın değişmeyen renkleri (logo, degrade, simge) */
export const brand = {
  cyan: '#00E5FF',
  pink: '#FF2EB6',
  purple: '#8A2BFF',
  sky: '#3B82FF',
  indigo: '#1A0E4B',
  offWhite: '#F8F9FF',
};

/** Ana düğme ve vurgu degradesi: Hot Pink → Electric Purple */
export const gradients = {
  primary: [brand.pink, brand.purple] as const,
  /** Gösterge çubukları: Neon Cyan → Sky Blue */
  progress: [brand.cyan, brand.sky] as const,
  /** Üst seviyeler (DESTANSI, süperstar…): Cyan → Pink → Purple, logodaki "town" gibi */
  epic: [brand.cyan, brand.pink, brand.purple] as const,
};

export const palette = {
  light: {
    paper: brand.offWhite, // zemin
    surface: '#FFFFFF', // kartlar
    ink: brand.indigo, // ana metin
    inkSoft: '#6B6394',
    line: '#E4E1F3',
    pink: '#D9119A', // vurgu metni (Hot Pink'in okunur tonu)
    blue: '#2563EB', // bağlantı, ilerleme, seçili (Sky Blue'nun okunur tonu)
    onBlue: '#FFFFFF', // seçili öğe ve mavi zemin üstündeki metin
    purple: '#7A1FF0',
    danger: '#D92D4F',
    onInk: '#FFFFFF',
    shadow: '#1A0E4B',
  },
  dark: {
    paper: '#110933',
    surface: '#1C1150',
    ink: brand.offWhite,
    inkSoft: '#A9A3D6',
    line: '#33296E',
    pink: brand.pink,
    blue: brand.cyan,
    onBlue: brand.indigo,
    purple: '#A866FF',
    danger: '#FF5C7A',
    onInk: brand.indigo,
    shadow: '#000000',
  },
};

export type Palette = typeof palette.light;

export function useColors(): Palette {
  return useColorScheme() === 'dark' ? palette.dark : palette.light;
}

export const fonts = {
  display: 'Fredoka_700Bold',
  displayMedium: 'Fredoka_600SemiBold',
  body: 'Nunito_500Medium',
  bodyMedium: 'Nunito_700Bold',
  bodyBold: 'Nunito_800ExtraBold',
};

/** 4'ün katları; ritim için tek ölçek. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 36 };

/** Tip ölçeği. Fredoka geniş bir yazı olduğu için başlıklar biraz küçük tutulur. */
export const type = {
  caption: 12,
  small: 14,
  body: 16,
  lead: 20,
  title: 26,
  display: 34,
  hero: 52,
};

/** Yumuşak, yuvarlak köşeler: rozetler küçük, kartlar büyük, düğmeler hap şeklinde. */
export const radius = { ticket: 8, control: 12, card: 18, pill: 999 };
