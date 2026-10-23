// Sayısal değerleri kelimeyle ve seviyesine göre renkle gösterir.
// Düşük seviyeler soluk, orta seviyeler koyu, üst seviyeler pembe.
// En üst kalite seviyesi (DESTANSI / EPIC) logodaki gibi neon iki renkle (cyan gölge + pembe) yazılır.

import { type ScaleName, tierOf } from '@rifftown/shared';
import { Text, type TextStyle, View } from 'react-native';
import { useI18n } from '@/lib/i18n';
import { useIsVip } from '@/lib/session';
import { brand, fonts, type Palette, space, type, useColors } from '@/theme';

/** Ruh hâli ve sağlıkta düşük seviye "soluk" değil "tehlikeli" demektir. */
const ALARM_SCALES: ScaleName[] = ['mood', 'health'];

export function tierColor(scale: ScaleName, value: number, c: Palette): string {
  const t = tierOf(scale, value);
  const f = t.count > 1 ? t.index / (t.count - 1) : 1;
  if (ALARM_SCALES.includes(scale)) return f < 0.3 ? c.danger : f >= 0.75 ? c.blue : c.ink;
  if (f < 0.3) return c.inkSoft;
  if (f < 0.6) return c.ink;
  return c.pink;
}

/** Çubuk rengi: normalde mavi, üst seviyelerde pembe; ruh hâli/sağlık düşükse tehlike rengi */
function barColor(scale: ScaleName, value: number, c: Palette): string {
  const col = tierColor(scale, value, c);
  return col === c.pink || col === c.danger ? col : c.blue;
}

type Size = 'small' | 'body' | 'title' | 'hero';
const SIZE: Record<Size, { font: string; size: number }> = {
  small: { font: fonts.bodyBold, size: type.small },
  body: { font: fonts.bodyBold, size: type.body },
  title: { font: fonts.display, size: type.title },
  hero: { font: fonts.display, size: type.hero },
};

export function TierText({
  scale,
  value,
  size = 'small',
  style,
}: {
  scale: ScaleName;
  value: number;
  size?: Size;
  style?: TextStyle;
}) {
  const c = useColors();
  const { lang } = useI18n();
  const vip = useIsVip();
  const t = tierOf(scale, value);
  const label = t.name[lang];
  // VIP üyeler kelimenin yanında kesin sayıyı da görür
  const exact = vip ? (Math.round(value * 10) / 10).toLocaleString(lang === 'en' ? 'en-GB' : 'tr-TR') : null;
  const num = exact ? (
    <Text style={{ fontFamily: fonts.body, fontSize: Math.max(12, SIZE[size].size * 0.4), color: c.inkSoft }}>{` ${exact}`}</Text>
  ) : null;
  const s = SIZE[size];
  const base: TextStyle = { fontFamily: s.font, fontSize: s.size, lineHeight: s.size * (size === 'hero' ? 1.1 : 1.3) };

  // DESTANSI: neon cyan gölge üstünde pembe yazı
  if (scale === 'quality' && t.isTop) {
    const offset = size === 'hero' || size === 'title' ? 3 : 1.5;
    return (
      <View accessible accessibilityLabel={label} style={{ alignSelf: 'flex-start' }}>
        <Text aria-hidden style={[base, { color: brand.cyan, position: 'absolute', left: offset, top: offset }, style]}>
          {label}
        </Text>
        <Text style={[base, { color: c.pink }, style]}>{label}</Text>
        {num}
      </View>
    );
  }
  if (num && (size === 'hero' || size === 'title')) {
    return (
      <View style={{ alignSelf: 'flex-start' }}>
        <Text style={[base, { color: tierColor(scale, value, c) }, style]}>{label}</Text>
        {num}
      </View>
    );
  }
  return (
    <Text style={[base, { color: tierColor(scale, value, c) }, style]}>
      {label}
      {num}
    </Text>
  );
}

/** Kelimeli gösterge: seviye adı + o seviyenin içindeki ilerleme çubuğu */
export function TierMeter({
  label,
  scale,
  value,
  whole = false,
}: {
  label: string;
  scale: ScaleName;
  value: number;
  /** true: çubuk 0–100 arası tüm değeri gösterir (ruh hâli, sağlık). false: seviye içi ilerleme. */
  whole?: boolean;
}) {
  const c = useColors();
  const t = tierOf(scale, value);
  const pct = whole ? Math.max(0, Math.min(1, value / 100)) : t.isTop ? 1 : t.progress;
  return (
    <View style={{ marginBottom: space.md }} accessible accessibilityLabel={`${label}: ${t.name.tr}`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: space.xs }}>
        <Text style={{ fontFamily: fonts.body, fontSize: type.small, color: c.ink, flexShrink: 1 }}>{label}</Text>
        <TierText scale={scale} value={value} />
      </View>
      <View style={{ height: 6, backgroundColor: c.line, borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: barColor(scale, value, c) }} />
      </View>
    </View>
  );
}
