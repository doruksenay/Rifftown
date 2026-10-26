// Ruh hâlini etkileyen geçici durumlar (moodlet'ler): "Harika konser ▲▲ · 18 sa daha"

import { MOODLET_BY_ID, type MoodletDto } from '@rifftown/shared';
import { Text, View } from 'react-native';
import { Small } from '@/components/ui';
import { duration } from '@/lib/format';
import { useI18n } from '@/lib/i18n';
import { useIsVip } from '@/lib/session';
import { fonts, radius, space, type, useColors } from '@/theme';

/** Etkinin gücü kelime yerine okla: ▲ küçük, ▲▲ orta, ▲▲▲ büyük (VIP sayıyı da görür) */
const arrows = (v: number) => {
  const n = Math.abs(v) >= 20 ? 3 : Math.abs(v) >= 10 ? 2 : 1;
  return (v >= 0 ? '▲' : '▼').repeat(n);
};

export function MoodletList({ moodlets }: { moodlets: MoodletDto[] }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const vip = useIsVip();
  if (!moodlets.length) return null;
  const sorted = [...moodlets].sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect));
  return (
    <View style={{ marginTop: space.xs, marginBottom: space.md }}>
      <Small style={{ marginBottom: space.xs }}>{t('moodletsTitle')}</Small>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
        {sorted.map((m) => {
          const def = MOODLET_BY_ID[m.id];
          if (!def) return null;
          const good = m.effect >= 0;
          const col = good ? c.blue : c.danger;
          const left = m.endsAt ? new Date(m.endsAt).getTime() - Date.now() : 0;
          return (
            <View
              key={m.id}
              accessible
              accessibilityLabel={`${p(def.name)}: ${p(def.about)}`}
              style={{
                borderWidth: 1.5,
                borderColor: col,
                borderRadius: radius.pill,
                paddingHorizontal: space.sm + 2,
                paddingVertical: 3,
                flexDirection: 'row',
                gap: 6,
                alignItems: 'baseline',
              }}
            >
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: type.caption, color: c.ink }}>{p(def.name)}</Text>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: type.caption, color: col }}>
                {vip ? `${good ? '+' : ''}${Math.round(m.effect)}` : arrows(m.effect)}
              </Text>
              {left > 0 ? (
                <Text style={{ fontFamily: fonts.body, fontSize: type.caption, color: c.inkSoft }}>
                  {t('moodletEndsIn', { time: duration(left, lang) })}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
