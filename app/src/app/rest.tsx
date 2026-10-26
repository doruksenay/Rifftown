import { HOME_BY_ID, HOTEL_HEALTH_PER_HOUR, HOTEL_REST_BONUS, HOUR_OPTIONS } from '@rifftown/shared';
import { Stack } from 'expo-router';
import { HoursAction } from '@/components/action-form';
import { Body, Screen, Small } from '@/components/ui';
import { useMe } from '@/lib/session';
import { useGate } from '@/components/gate';
import { useI18n } from '@/lib/i18n';
import { space, useColors } from '@/theme';

export default function Rest() {
  const gate = useGate();
  if (gate) return gate;
  return <RestScreen />;
}

function RestScreen() {
  const { t } = useI18n();
  const c = useColors();
  const ch = useMe().data!.character!;
  const atHome = !ch.jailedUntil && !!ch.home && ch.home.cityId === ch.cityId && !!HOME_BY_ID[ch.home.homeId];
  // Sunucudaki kuralın aynısı: evin bu şehirde değilse ve otelde kalıyorsan otel konforu
  const atHotel = !ch.jailedUntil && !atHome && !!ch.hotel && ch.hotel.cityId === ch.cityId && new Date(ch.hotel.until).getTime() > Date.now();
  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('rest') }} />
      <Body color={c.inkSoft} style={{ marginTop: space.lg }}>
        {t('restIntro')}
      </Body>
      <Small color={atHome || atHotel ? c.blue : c.inkSoft} style={{ marginTop: space.sm, marginBottom: space.lg }}>
        {atHome
          ? `${t('restAtHome')} ${t('homeBonus', { n: HOME_BY_ID[ch.home!.homeId].restBonus, h: HOME_BY_ID[ch.home!.homeId].healthPerHour })}`
          : atHotel
            ? `${t('restAtHotel')} ${t('homeBonus', { n: HOTEL_REST_BONUS, h: HOTEL_HEALTH_PER_HOUR })}`
            : t('restOnCouch')}
      </Small>
      <HoursAction options={HOUR_OPTIONS.rest} build={(hours) => ({ kind: 'rest', hours })} label={t('rest')} />
    </Screen>
  );
}
