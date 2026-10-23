// Emlakçı: ev kiralama ve bırakma.

import { CITY_BY_ID, HOMES, HOME_BY_ID, LOCATION_BY_ID, rentFor } from '@rifftown/shared';
import { View } from 'react-native';
import { VipTag, confirmThen } from '@/components/careers';
import { Body, Button, Card, Heading, ListRow, Small, Strong } from '@/components/ui';
import { api } from '@/lib/api';
import { duration, money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useIsVip, useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

export function RealEstate({ locationId }: { locationId: string }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const vip = useIsVip();
  const { run, pending } = useRun();
  const city = CITY_BY_ID[LOCATION_BY_ID[locationId].cityId];
  const ch = me.data!.character!;
  const home = ch.home;
  const busy = !!me.data?.action || !!ch.jailedUntil;

  return (
    <View style={{ marginTop: space.lg }}>
      <Body color={c.inkSoft}>{t('realEstateIntro')}</Body>

      <Heading>{t('currentHome')}</Heading>
      {home && HOME_BY_ID[home.homeId] ? (
        <Card>
          <Strong>{`${p(HOME_BY_ID[home.homeId].name)}, ${p(CITY_BY_ID[home.cityId].name)}`}</Strong>
          <Small>{`${t('perWeek', { money: money(home.rent) })}, ${t('nextRent', { time: duration(new Date(home.paidUntil).getTime() - Date.now(), lang) })}`}</Small>
          {home.cityId !== city.id ? <Small color={c.pink} style={{ marginTop: space.xs }}>{t('homeElsewhere', { city: p(CITY_BY_ID[home.cityId].name) })}</Small> : null}
          <Button
            title={t('leaveHome')}
            variant="ghost"
            small
            style={{ alignSelf: 'flex-start', paddingHorizontal: 0, marginTop: space.sm }}
            disabled={pending}
            onPress={() =>
              confirmThen(t('leaveHome'), `${t('leaveHome')}?`, t('confirm'), t('cancel'), () =>
                run(() => api.post('/homes/leave'), { success: t('leftHome'), invalidate: ['me', 'tutorial'] }),
              )
            }
          />
        </Card>
      ) : (
        <Small>{t('noHome')}</Small>
      )}

      <Heading>{t('home')}</Heading>
      {HOMES.map((h, i) => {
        const rent = rentFor(h, city.costMult);
        const mine = home?.homeId === h.id && home.cityId === city.id;
        return (
          <ListRow
            key={h.id}
            title={p(h.name)}
            subtitle={`${p(h.about)} ${t('homeBonus', { n: h.restBonus, h: h.healthPerHour })}`}
            right={
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Strong>{t('perWeek', { money: money(rent) })}</Strong>
                {h.vip ? <VipTag /> : null}
                {mine ? (
                  <Small color={c.blue}>{t('youAreHere')}</Small>
                ) : (
                  <Button
                    title={t('rentHome')}
                    small
                    variant="secondary"
                    disabled={busy || pending || ch.money < rent || (!!h.vip && !vip)}
                    onPress={() =>
                      run(() => api.post('/homes/rent', { homeId: h.id, locationId }), {
                        success: t('rented', { home: p(h.name) }),
                        invalidate: ['me', 'tutorial'],
                      })
                    }
                  />
                )}
              </View>
            }
            last={i === HOMES.length - 1}
          />
        );
      })}
    </View>
  );
}
