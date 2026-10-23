import { CITIES, GENRE_NAMES, type LeaderboardResponse } from '@rifftown/shared';
import { useQuery } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Choice, Empty, ListRow, Screen } from '@/components/ui';
import { useGate } from '@/components/gate';
import { api } from '@/lib/api';
import { TierText } from '@/components/tier';
import { useI18n } from '@/lib/i18n';
import { fonts, space, type, useColors } from '@/theme';

export default function Leaderboard() {
  const gate = useGate();
  if (gate) return gate;
  return <LeaderboardScreen />;
}

function LeaderboardScreen() {
  const { t, p } = useI18n();
  const c = useColors();
  const [cityId, setCityId] = useState<string>('all');
  const q = useQuery({
    queryKey: ['leaderboard', cityId],
    queryFn: () => api.get<LeaderboardResponse>(`/leaderboard${cityId === 'all' ? '' : `?cityId=${cityId}`}`),
  });

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('leaderboard') }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: space.lg }}>
        <Choice
          wrap={false}
          options={[{ value: 'all', label: t('world') }, ...CITIES.map((ct) => ({ value: ct.id, label: p(ct.name) }))]}
          value={cityId}
          onChange={setCityId}
        />
      </ScrollView>
      {q.data?.bands.length ? (
        q.data.bands.map((b, i, arr) => (
          <ListRow
            key={b.id}
            left={
              <View style={{ width: 36 }}>
                <Text style={{ fontFamily: fonts.display, fontSize: type.lead, color: i < 3 ? c.pink : c.inkSoft }}>{i + 1}</Text>
              </View>
            }
            title={b.name}
            subtitle={b.npc ? `${p(GENRE_NAMES[b.genre])} · ${t('npcBand')}` : p(GENRE_NAMES[b.genre])}
            right={cityId === 'all' ? undefined : <TierText scale="fame" value={b.fame} />}
            onPress={() => router.push(`/band/${b.id}`)}
            last={i === arr.length - 1}
          />
        ))
      ) : (
        <Empty text={t('noFame')} />
      )}
    </Screen>
  );
}
