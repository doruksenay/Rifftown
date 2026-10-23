import { CITY_BY_ID, GENRE_NAMES, LOCATION_BY_ID, type PublicBandDto, ROLE_NAMES } from '@rifftown/shared';
import { useQuery } from '@tanstack/react-query';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Avatar, Empty, ErrorView, Heading, ListRow, Loading, Screen, ScreenHeader, Small } from '@/components/ui';
import { useGate } from '@/components/gate';
import { api } from '@/lib/api';
import { dateTime } from '@/lib/format';
import { ReleaseRow } from '@/components/records';
import { TierText } from '@/components/tier';
import { useI18n } from '@/lib/i18n';

export default function BandProfile() {
  const gate = useGate();
  if (gate) return gate;
  return <BandProfileScreen />;
}

function BandProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, p, locale } = useI18n();
  const q = useQuery({
    queryKey: ['public-band', id],
    queryFn: () => api.get<{ band: PublicBandDto }>(`/bands/${id}`).then((r) => r.band),
  });
  if (q.isLoading) return <Loading />;
  if (!q.data) return <ErrorView error={q.error} onRetry={() => q.refetch()} />;
  const b = q.data;
  const fame = Object.entries(b.fame).filter(([, f]) => f > 0).sort((x, y) => y[1] - x[1]);
  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: b.name }} />
      <ScreenHeader title={b.name} subtitle={b.npc ? `${p(GENRE_NAMES[b.genre])} · ${t('npcBand')}` : p(GENRE_NAMES[b.genre])} />
      {b.npc ? <Small>{t('npcBandHint')}</Small> : null}
      <Heading>{t('members')}</Heading>
      {b.members.map((m, i) => (
        <ListRow
          key={m.characterId}
          left={<Avatar name={m.name} color={m.avatarColor} uri={m.avatarUrl} />}
          title={m.name}
          subtitle={`${p(ROLE_NAMES[m.role])}${m.isLeader ? `, ${t('leader')}` : ''}`}
          onPress={() => router.push(`/character/${m.characterId}`)}
          last={i === b.members.length - 1}
        />
      ))}
      <Heading>{t('fame')}</Heading>
      {fame.length ? (
        fame.map(([cityId, f], i) => <ListRow key={cityId} title={p(CITY_BY_ID[cityId].name)} right={<TierText scale="fame" value={f} />} last={i === fame.length - 1} />)
      ) : (
        <Empty text={t('noFame')} />
      )}
      {b.releases.length ? (
        <>
          <Heading>{t('releases')}</Heading>
          {b.releases.map((r, i) => <ReleaseRow key={r.id} r={r} last={i === b.releases.length - 1} />)}
        </>
      ) : null}
      <Heading>{t('pastGigs')}</Heading>
      {b.pastGigs.length ? (
        b.pastGigs.map((g, i) => (
          <ListRow
            key={g.id}
            title={p(LOCATION_BY_ID[g.locationId].name)}
            subtitle={`${dateTime(g.startsAt, locale)}${g.result ? `, ${t('attendance', { n: g.result.attendance })}` : ''}`}
            onPress={() => router.push(`/gig/${g.id}`)}
            last={i === b.pastGigs.length - 1}
          />
        ))
      ) : (
        <Empty text={t('noUpcomingGigs')} />
      )}
    </Screen>
  );
}
