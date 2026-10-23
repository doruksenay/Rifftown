import { CITY_BY_ID, type LocationType, LOCATION_TYPE_NAMES, VENUE_RULES, isVenue } from '@rifftown/shared';
import { router } from 'expo-router';
import { RefreshControl, View } from 'react-native';
import { Body, Button, Empty, Heading, ListRow, Row, Screen, ScreenHeader, Small } from '@/components/ui';
import { dateTime, money } from '@/lib/format';
import { TierText } from '@/components/tier';
import { MayorAnnouncement } from '@/components/politics';
import { useCity } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import type { StringKey } from '@/lib/strings';
import { useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

const GROUPS: { key: StringKey; types: LocationType[] }[] = [
  { key: 'venues', types: ['bar', 'club', 'hall'] },
  { key: 'bigStages', types: ['stadium', 'festival'] },
  { key: 'learning', types: ['school', 'studio', 'recording_studio'] },
  { key: 'jobs', types: ['work'] },
  { key: 'shops', types: ['music_store', 'boutique', 'gallery', 'bookstore', 'car_dealer', 'pet_shop', 'hardware', 'stage_shop', 'flea_market'] },
  { key: 'living', types: ['hospital', 'real_estate', 'bank', 'hotel'] },
  { key: 'lifestyleGroup', types: ['restaurant', 'gym', 'tattoo'] },
  { key: 'publicLife', types: ['city_hall', 'police', 'courthouse', 'plaza', 'newspaper', 'worship', 'university', 'prison'] },
  { key: 'outdoors', types: ['park'] },
];

export default function CityTab() {
  const me = useMe();
  const { t, p, locale } = useI18n();
  const c = useColors();
  const ch = me.data!.character!;
  const city = ch.cityId ? CITY_BY_ID[ch.cityId] : null;
  const info = useCity(ch.cityId);

  if (!city) {
    return (
      <Screen>
        <ScreenHeader title={t('traveling')} />
        <Body color={c.inkSoft}>{t('err_traveling')}</Body>
      </Screen>
    );
  }

  return (
    <Screen refreshing={<RefreshControl refreshing={info.isRefetching} onRefresh={() => { info.refetch(); }} tintColor={c.pink} />}>
      <ScreenHeader
        title={p(city.name)}
        subtitle={`${p(city.country)}${info.data ? `, ${t('players', { n: info.data.playersHere })}` : ''}`}
        right={<Button title={t('travel')} small variant="secondary" onPress={() => router.push('/travel')} disabled={!!me.data?.action} />}
      />

      <MayorAnnouncement cityId={city.id} />

      {GROUPS.map((g) => {
        const locs = city.locations.filter((l) => g.types.includes(l.type) && !l.business);
        return (
          <View key={g.key}>
            <Heading>{t(g.key)}</Heading>
            {locs.map((l, i) => {
              let sub = p(LOCATION_TYPE_NAMES[l.type]);
              if (isVenue(l.type)) sub = `${sub}, ${t('capacity', { n: VENUE_RULES[l.type].capacity })}`;
              if (l.type === 'work' && l.jobTitle) sub = t('jobPay', { title: p(l.jobTitle), pay: money(l.hourlyPay ?? 0) });
              return (
                <ListRow
                  key={l.id}
                  title={p(l.name)}
                  subtitle={sub}
                  right={ch.locationId === l.id ? <Small color={c.pink}>{t('here')}</Small> : '›'}
                  onPress={() => router.push(`/location/${l.id}`)}
                  last={i === locs.length - 1}
                />
              );
            })}
          </View>
        );
      })}

      <Heading>{t('businessesGroup')}</Heading>
      {city.locations
        .filter((l) => l.business)
        .map((l, i, arr) => {
          const owned = info.data?.businesses.find((b) => b.locationId === l.id);
          return (
            <ListRow
              key={l.id}
              title={owned ? owned.name : p(l.name)}
              subtitle={`${p(LOCATION_TYPE_NAMES[l.type])}, ${owned ? t('ownerShort', { name: owned.ownerName }) : t('licenceForSale')}`}
              right={ch.locationId === l.id ? <Small color={c.pink}>{t('here')}</Small> : '›'}
              onPress={() => router.push(`/location/${l.id}`)}
              last={i === arr.length - 1}
            />
          );
        })}

      <Heading>{t('upcomingGigs')}</Heading>
      {info.data?.upcomingGigs.length ? (
        info.data.upcomingGigs.map((g, i, arr) => (
          <ListRow
            key={g.id}
            title={g.bandName}
            subtitle={`${p(city.locations.find((l) => l.id === g.locationId)?.name ?? city.name)}, ${dateTime(g.startsAt, locale)}`}
            onPress={() => router.push(`/gig/${g.id}`)}
            last={i === arr.length - 1}
          />
        ))
      ) : (
        <Empty text={t('noUpcomingGigs')} />
      )}

      <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Heading>{t('topBands')}</Heading>
        <Button title={t('leaderboard')} variant="ghost" small onPress={() => router.push('/leaderboard')} />
      </Row>
      {info.data?.topBands.length ? (
        info.data.topBands.map((b, i, arr) => (
          <ListRow key={b.id} title={b.name} right={<TierText scale="fame" value={b.fame} />} onPress={() => router.push(`/band/${b.id}`)} last={i === arr.length - 1} />
        ))
      ) : (
        <Empty text={t('noFame')} />
      )}
    </Screen>
  );
}
