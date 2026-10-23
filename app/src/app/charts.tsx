// Haftalık satış listeleri: şehir ve dünya, single ve albüm. Geçmiş haftalar VIP avantajı.

import { CITIES, type ChartResponse, RELEASE_NAMES, type ReleaseKind } from '@rifftown/shared';
import { useQuery } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, Text, View } from 'react-native';
import { VipUpsell } from '@/components/careers';
import { useGate } from '@/components/gate';
import { Choice, Empty, ListRow, Screen, Small } from '@/components/ui';
import { api } from '@/lib/api';
import { duration } from '@/lib/format';
import { useI18n } from '@/lib/i18n';
import { useIsVip, useMe } from '@/lib/session';
import { fonts, space, type, useColors } from '@/theme';

export default function Charts() {
  const gate = useGate();
  if (gate) return gate;
  return <ChartsScreen />;
}

function ChartsScreen() {
  const { t, p, lang, locale } = useI18n();
  const c = useColors();
  const me = useMe();
  const vip = useIsVip();
  const [scope, setScope] = useState<string>(me.data?.character?.cityId ?? 'world');
  const [kind, setKind] = useState<ReleaseKind>('single');
  const [week, setWeek] = useState<number | null>(null);
  const q = useQuery({
    queryKey: ['chart', scope, kind, week],
    queryFn: () => api.get<ChartResponse>(`/charts?scope=${scope}&kind=${kind}${week ? `&week=${week}` : ''}`),
  });
  const myBand = me.data?.band?.id;
  const nf = (n: number) => n.toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR');

  return (
    <Screen edges={[]} refreshing={<RefreshControl refreshing={q.isRefetching} onRefresh={() => { q.refetch(); }} tintColor={c.pink} />}>
      <Stack.Screen options={{ title: t('charts') }} />
      <View style={{ marginTop: space.lg, gap: space.sm }}>
        <Choice<ReleaseKind>
          options={(['single', 'album'] as const).map((k) => ({ value: k, label: p(RELEASE_NAMES[k]) }))}
          value={kind}
          onChange={setKind}
        />
        <Choice<string>
          options={[{ value: 'world', label: t('chartWorld') }, ...CITIES.map((ct) => ({ value: ct.id, label: p(ct.name) }))]}
          value={scope}
          onChange={setScope}
        />
      </View>

      {q.data?.weeks.length ? (
        <View style={{ marginTop: space.md }}>
          {vip && q.data.weeks.length > 1 ? (
            <Choice<number>
              options={q.data.weeks.map((w) => ({ value: w.id, label: new Date(w.endedAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) }))}
              value={week ?? q.data.weeks[0].id}
              onChange={setWeek}
            />
          ) : q.data.weekEndedAt ? (
            <Small>{t('chartWeekOf', { date: new Date(q.data.weekEndedAt).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) })}</Small>
          ) : null}
        </View>
      ) : null}
      {q.data?.nextWeekEndsAt ? (
        <Small style={{ marginTop: space.xs }}>{t('chartClosesIn', { time: duration(new Date(q.data.nextWeekEndsAt).getTime() - Date.now(), lang) })}</Small>
      ) : null}

      <View style={{ marginTop: space.lg }}>
        {q.data?.entries.length ? (
          q.data.entries.map((e, i, arr) => {
            const move = e.lastPosition == null ? t('newEntry') : e.lastPosition > e.position ? '▲' : e.lastPosition < e.position ? '▼' : '=';
            return (
              <ListRow
                key={e.releaseId}
                left={
                  <Text style={{ fontFamily: fonts.display, fontSize: type.title, width: 36, textAlign: 'right', color: e.position <= 3 ? c.pink : c.ink }}>{e.position}</Text>
                }
                title={e.title}
                subtitle={`${e.bandName} · ${t('unitsN', { n: nf(e.units) })}`}
                right={<Small color={e.bandId === myBand ? c.pink : c.inkSoft}>{move}</Small>}
                onPress={() => router.push(`/band/${e.bandId}`)}
                last={i === arr.length - 1}
              />
            );
          })
        ) : (
          <Empty text={t('chartEmpty')} />
        )}
      </View>
      {!vip ? <VipUpsell text={t('chartHistoryVip')} /> : null}
    </Screen>
  );
}
