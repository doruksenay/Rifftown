import { CITIES, ITEM_BY_ID, type TravelMode, travelOptions } from '@rifftown/shared';
import { Stack, router } from 'expo-router';
import { View } from 'react-native';
import { Body, Button, Heading, Row, Screen, Small, Strong } from '@/components/ui';
import { useGate } from '@/components/gate';
import { api } from '@/lib/api';
import { money, realDuration } from '@/lib/format';
import { useInventory, useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useGameSpeed, useMe } from '@/lib/session';
import { space, useColors } from '@/theme';
import { CitySkyline } from '@/components/art/skyline';

export default function Travel() {
  const gate = useGate();
  if (gate) return gate;
  return <TravelScreen />;
}

function TravelScreen() {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const speed = useGameSpeed();
  const { run, pending } = useRun();
  const ch = me.data!.character!;
  const from = ch.cityId;
  const countries = [...new Map(CITIES.map((ct) => [ct.countryCode, ct.country])).entries()];
  const inv = useInventory();
  const car = (inv.data ?? []).find((i) => i.equipped && ITEM_BY_ID[i.itemId]?.slot === 'vehicle');
  const speedOf = car ? ITEM_BY_ID[car.itemId].speed : undefined;

  const go = async (toCityId: string, mode: TravelMode) => {
    const r = await run(() => api.post('/actions', { kind: 'travel', toCityId, mode }));
    if (r) router.navigate('/');
  };

  if (!from) {
    return (
      <Screen edges={[]}>
        <Stack.Screen options={{ title: t('travel') }} />
        <Body style={{ marginTop: space.lg }}>{t('err_traveling')}</Body>
      </Screen>
    );
  }

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('travelTitle') }} />
      {countries.map(([code, country]) => (
        <View key={code}>
          <Heading>{p(country)}</Heading>
          {CITIES.filter((ct) => ct.countryCode === code).map((ct) => {
            const opts = travelOptions(from, ct.id, speedOf);
            return (
              <View key={ct.id} style={{ paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: c.line }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Row style={{ flex: 1 }}>
                    <View style={{ width: 84, height: 48, borderRadius: 10, overflow: 'hidden' }}>
                      <CitySkyline cityId={ct.id} height={48} />
                    </View>
                    <Strong>{p(ct.name)}</Strong>
                  </Row>
                  {ct.id === from ? <Small color={c.pink}>{t('youAreHere')}</Small> : null}
                </Row>
                {opts.length ? (
                  <Row style={{ marginTop: space.sm, flexWrap: 'wrap' }}>
                    {opts.map((o) => (
                      <Button
                        key={o.mode}
                        small
                        variant={o.mode === 'plane' ? 'primary' : 'secondary'}
                        title={`${t(o.mode)}: ${realDuration(o.hours, speed, lang)}, ${money(o.cost)}`}
                        disabled={ch.money < o.cost || !!me.data?.action || pending}
                        onPress={() => go(ct.id, o.mode)}
                      />
                    ))}
                  </Row>
                ) : null}
              </View>
            );
          })}
        </View>
      ))}
    </Screen>
  );
}
