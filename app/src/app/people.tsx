// Oyuncular: bulunduğun şehirdeki oyuncular ve isimle arama. Her satır profile açılır.

import { CITY_BY_ID, ROLE_NAMES, type Instrument } from '@rifftown/shared';
import { useQuery } from '@tanstack/react-query';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useGate } from '@/components/gate';
import { Avatar, Empty, ErrorView, Field, Heading, ListRow, Loading, Screen, Small } from '@/components/ui';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { space } from '@/theme';

interface Person {
  id: number;
  name: string;
  avatarColor: string;
  avatarUrl?: string | null;
  mainInstrument: Instrument | null;
  bandName?: string | null;
  cityId?: string | null;
}

export default function People() {
  const gate = useGate();
  if (gate) return gate;
  return <PeopleScreen />;
}

function PeopleScreen() {
  const { t, p } = useI18n();
  const me = useMe();
  const params = useLocalSearchParams<{ city?: string }>();
  const cityId = params.city && CITY_BY_ID[params.city] ? params.city : me.data?.character?.cityId ?? null;
  const [search, setSearch] = useState('');
  const term = search.trim();
  const people = useQuery({
    queryKey: ['people', cityId],
    enabled: !!cityId,
    queryFn: () => api.get<{ people: Person[] }>(`/cities/${cityId}/people`).then((r) => r.people),
    refetchInterval: 60000,
  });
  const found = useQuery({
    queryKey: ['peopleSearch', term],
    enabled: term.length >= 2,
    queryFn: () => api.get<{ characters: Person[] }>(`/characters?search=${encodeURIComponent(term)}`).then((r) => r.characters),
  });
  const myId = me.data?.character?.id;

  const row = (x: Person, i: number, arr: Person[], showCity = false) => {
    const bits = [
      x.mainInstrument && ROLE_NAMES[x.mainInstrument] ? p(ROLE_NAMES[x.mainInstrument]) : null,
      x.bandName ?? null,
      showCity ? (x.cityId && CITY_BY_ID[x.cityId] ? p(CITY_BY_ID[x.cityId].name) : t('onTheRoad')) : null,
    ].filter(Boolean);
    return (
      <ListRow
        key={x.id}
        left={<Avatar name={x.name} color={x.avatarColor} uri={x.avatarUrl} size={36} />}
        title={x.id === myId ? `${x.name} (${t('you')})` : x.name}
        subtitle={bits.join(' · ') || undefined}
        right="›"
        onPress={() => router.push(`/character/${x.id}`)}
        last={i === arr.length - 1}
      />
    );
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('playersTitle') }} />
      <View style={{ height: space.lg }} />
      <Field label={t('searchPlayers')} value={search} onChangeText={setSearch} autoCapitalize="none" />
      {term.length >= 2 ? (
        <>
          <Heading>{t('searchResults')}</Heading>
          {found.isLoading ? <Loading /> : found.data?.length ? found.data.map((x, i, arr) => row(x, i, arr, true)) : <Empty text={t('noPlayersFound')} />}
        </>
      ) : null}
      {cityId ? (
        <>
          <Heading>{t('playersInCity', { city: p(CITY_BY_ID[cityId].name) })}</Heading>
          {people.isLoading ? (
            <Loading />
          ) : !people.data ? (
            <ErrorView error={people.error} onRetry={() => people.refetch()} />
          ) : people.data.length ? (
            people.data.map((x, i, arr) => row(x, i, arr))
          ) : (
            <Empty text={t('noPlayersHere')} />
          )}
        </>
      ) : (
        <Small style={{ marginTop: space.lg }}>{t('err_traveling')}</Small>
      )}
    </Screen>
  );
}
