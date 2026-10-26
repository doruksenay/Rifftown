// Turne ve ekip: tur ekibi rolleri, moral, turne planı.

import { CITIES, CREW, CREW_ROLES, type CrewRole, TOUR_MAX_CITIES, TOUR_MIN_CITIES } from '@rifftown/shared';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useGate } from '@/components/gate';
import { Body, Button, Card, Choice, Empty, Field, Heading, Meter, Row, Screen, Small, Strong } from '@/components/ui';
import { api } from '@/lib/api';
import { dateTime, money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

interface TourView {
  crew: CrewRole[];
  morale: number;
  tour: { id: number; name: string; cityIds: string[]; endsAt: string; played: string[] } | null;
  toursDone: number;
}

export default function TourScreen() {
  const gate = useGate();
  if (gate) return gate;
  return <Tour />;
}

function Tour() {
  const { t, p, locale } = useI18n();
  const c = useColors();
  const me = useMe();
  const { run, pending } = useRun();
  const isLeader = !!me.data?.band?.isLeader;
  const q = useQuery({ queryKey: ['tour'], queryFn: () => api.get<TourView>('/tour'), enabled: !!me.data?.band });
  const [name, setName] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [days, setDays] = useState(14);
  if (!me.data?.band) return <Screen><Empty text={t('err_no_band')} /></Screen>;
  const v = q.data;
  const toggleCity = (id: string) => setCities((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= TOUR_MAX_CITIES ? s : [...s, id]));
  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('tourTitle') }} />
      <Body color={c.inkSoft} style={{ marginTop: space.lg }}>{t('tourIntro')}</Body>

      <Heading>{t('crewTitle')}</Heading>
      {v ? <Meter label={t('crewMorale')} value={v.morale} right={`${Math.round(v.morale)}`} color={v.morale < 30 ? c.danger : c.blue} /> : null}
      <Card style={{ gap: space.sm, marginTop: space.sm }}>
        {CREW_ROLES.map((r) => {
          const hired = v?.crew.includes(r);
          return (
            <Row key={r} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Strong>{p(CREW[r].name)}</Strong>
                <Small>{`${p(CREW[r].about)} · ${t('crewFee', { money: money(CREW[r].fee) })}`}</Small>
              </View>
              {isLeader ? (
                <Button
                  small
                  variant={hired ? 'secondary' : 'primary'}
                  title={hired ? t('fire') : t('hire')}
                  disabled={pending}
                  onPress={() => run(() => (hired ? api.del(`/crew/${r}`) : api.post(`/crew/${r}`)), { invalidate: ['tour'] })}
                />
              ) : hired ? (
                <Small color={c.blue}>✓</Small>
              ) : null}
            </Row>
          );
        })}
      </Card>
      <Small style={{ marginTop: space.sm }}>{t('crewHint')}</Small>

      <Heading>{t('tourPlan')}</Heading>
      {v?.tour ? (
        <Card>
          <Strong>{v.tour.name}</Strong>
          <Small>{t('tourEnds', { date: dateTime(v.tour.endsAt, locale) })}</Small>
          {v.tour.cityIds.map((id) => (
            <Body key={id}>{`${v.tour!.played.includes(id) ? '✓' : '·'} ${p(CITIES.find((x) => x.id === id)!.name)}`}</Body>
          ))}
        </Card>
      ) : isLeader ? (
        <View style={{ gap: space.sm }}>
          <Small>{t('tourPlanHint', { min: TOUR_MIN_CITIES, max: TOUR_MAX_CITIES })}</Small>
          <Field label={t('tourName')} value={name} onChangeText={setName} maxLength={40} />
          <Row style={{ flexWrap: 'wrap' }}>
            {CITIES.map((x) => (
              <Button key={x.id} small variant={cities.includes(x.id) ? 'primary' : 'secondary'} title={p(x.name)} onPress={() => toggleCity(x.id)} />
            ))}
          </Row>
          <Choice options={[7, 14, 21, 28].map((d) => ({ value: d, label: t('daysN', { n: d }) }))} value={days} onChange={setDays} />
          <Button
            title={t('startTour')}
            loading={pending}
            disabled={name.trim().length < 2 || cities.length < TOUR_MIN_CITIES}
            onPress={() => run(() => api.post('/tour', { name: name.trim(), cityIds: cities, days }), { invalidate: ['tour'] })}
          />
        </View>
      ) : (
        <Empty text={t('noTour')} />
      )}
      {v ? <Small style={{ marginTop: space.md }}>{t('toursDone', { n: v.toursDone })}</Small> : null}
    </Screen>
  );
}
