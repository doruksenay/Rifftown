// Başarımlar: kategoriye göre, açılanlar renkli, gizliler kazanılana kadar kapalı.

import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORY_NAMES,
  type AchievementCategory,
  type AchievementsResponse,
  TOTAL_ACHIEVEMENT_POINTS,
} from '@rifftown/shared';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { RefreshControl, Text, View } from 'react-native';
import { useGate } from '@/components/gate';
import { Heading, ListRow, Meter, Screen, Small } from '@/components/ui';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { fonts, space, type, useColors } from '@/theme';

const CATS = Object.keys(ACHIEVEMENT_CATEGORY_NAMES) as AchievementCategory[];

export default function Achievements() {
  const gate = useGate();
  if (gate) return gate;
  return <AchievementsScreen />;
}

function AchievementsScreen() {
  const { t, p, locale } = useI18n();
  const c = useColors();
  const q = useQuery({ queryKey: ['achievements'], queryFn: () => api.get<AchievementsResponse>('/achievements') });
  const unlocked = new Map((q.data?.unlocked ?? []).map((u) => [u.id, u.unlockedAt]));
  const points = q.data?.points ?? 0;

  return (
    <Screen edges={[]} refreshing={<RefreshControl refreshing={q.isRefetching} onRefresh={() => { q.refetch(); }} tintColor={c.pink} />}>
      <Stack.Screen options={{ title: t('achievements') }} />
      <View style={{ marginTop: space.lg }}>
        <Small style={{ marginBottom: space.sm }}>
          {t('achievementsProgress', { n: unlocked.size, total: ACHIEVEMENTS.length, points, max: TOTAL_ACHIEVEMENT_POINTS })}
        </Small>
        <Meter
          label={t('achievements')}
          value={points}
          max={TOTAL_ACHIEVEMENT_POINTS}
          color={c.pink}
          right={t('achievementPointsN', { n: points })}
        />
      </View>
      {CATS.map((cat) => {
        const list = ACHIEVEMENTS.filter((a) => a.category === cat);
        return (
          <View key={cat}>
            <Heading>{p(ACHIEVEMENT_CATEGORY_NAMES[cat])}</Heading>
            {list.map((a, i) => {
              const at = unlocked.get(a.id);
              const hidden = a.secret && !at;
              return (
                <ListRow
                  key={a.id}
                  left={
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: at ? c.pink : 'transparent',
                        borderWidth: 1.5,
                        borderColor: at ? c.pink : c.line,
                      }}
                    >
                      <Text style={{ fontFamily: fonts.display, fontSize: type.small, color: at ? c.onInk : c.inkSoft }}>{hidden ? '?' : a.points}</Text>
                    </View>
                  }
                  title={hidden ? t('secretAchievement') : p(a.name)}
                  subtitle={
                    hidden ? t('secretHint') : at ? `${p(a.about)} ${t('unlockedOn', { date: new Date(at).toLocaleDateString(locale) })}` : p(a.about)
                  }
                  right={at ? <Small color={c.pink}>✓</Small> : undefined}
                  last={i === list.length - 1}
                />
              );
            })}
          </View>
        );
      })}
    </Screen>
  );
}
