import {
  ITEM_BY_ID,
  ENCORE_PLANS,
  type EncorePlan,
  MAX_STAGE_EVENTS,
  STAGE_EVENTS,
  TEMPO_NAMES,
  type GigEstimateResponse,
  GIG_LEAD_HOURS,
  VIP,
  INSTRUMENTS,
  type Instrument,
  LOCATION_BY_ID,
  MAX_SETLIST,
  SESSION_MUSICIAN,
  ROLE_NAMES,
  type VenueType,
  tierName,
} from '@rifftown/shared';
import { useQuery } from '@tanstack/react-query';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Body, Button, Choice, Empty, Heading, Row, Screen, Small, Strong } from '@/components/ui';
import { useGate } from '@/components/gate';
import { api } from '@/lib/api';
import { money, realDuration } from '@/lib/format';
import { useBand, useInventory, useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useGameSpeed, useIsVip, useMe } from '@/lib/session';
import { radius, space, useColors } from '@/theme';

export default function BookGig() {
  const gate = useGate();
  if (gate) return gate;
  return <BookGigScreen />;
}

function BookGigScreen() {
  const { locationId } = useLocalSearchParams<{ locationId: string }>();
  const loc = LOCATION_BY_ID[locationId];
  const { t, p, lang } = useI18n();
  const c = useColors();
  const speed = useGameSpeed();
  const me = useMe();
  const band = useBand();
  const { run, pending } = useRun();
  const [inHours, setInHours] = useState<number>(6);
  const [setlist, setSetlist] = useState<number[]>([]);
  const [session, setSession] = useState<Instrument[]>([]);
  const [effects, setEffects] = useState<number[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [encore, setEncore] = useState<EncorePlan>('none');
  const inv = useInventory();
  const fxItems = (inv.data ?? []).filter((i) => ITEM_BY_ID[i.itemId]?.slot === 'fx' && !i.listed);
  const vip = useIsVip();
  const estimate = useQuery({
    queryKey: ['estimate', locationId],
    queryFn: () => api.get<GigEstimateResponse>(`/gigs/estimate?locationId=${locationId}`),
    enabled: vip && !!locationId,
  });

  if (!loc || !band.data) return <Screen><Empty text={t('needBandLeader')} /></Screen>;
  const venue = loc.type as VenueType;
  const sm = SESSION_MUSICIAN[venue];
  const takenRoles = new Set(band.data.members.map((m) => m.role));
  const fee = sm.fee * session.length;
  const songs = band.data.songs;

  const toggleSong = (id: number) =>
    setSetlist((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= MAX_SETLIST ? s : [...s, id]));
  const move = (id: number, dir: -1 | 1) =>
    setSetlist((s) => {
      const i = s.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= s.length) return s;
      const next = [...s];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const toggleEvent = (id: string) =>
    setEvents((e) => (e.includes(id) ? e.filter((x) => x !== id) : e.length >= MAX_STAGE_EVENTS ? e : [...e, id]));
  const toggleRole = (r: Instrument) => setSession((s) => (s.includes(r) ? s.filter((x) => x !== r) : [...s, r]));

  const book = async () => {
    const r = await run(() => api.post('/gigs', { locationId, inHours, setlist, sessionRoles: session, effects, plan: { events, encore } }), {
      success: t('booked'),
      invalidate: ['band', 'me', 'city', 'inventory', 'venueGigs'],
    });
    if (r) router.back();
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('bookTitle') }} />
      <Body style={{ marginTop: space.lg }}>{p(loc.name)}</Body>

      <Heading>{t('when')}</Heading>
      <Choice
        options={VIP.gigLeadHours.map((h) => {
          const vipOnly = !(GIG_LEAD_HOURS as readonly number[]).includes(h);
          return {
            value: h,
            label: t('inHours', { n: h }),
            hint: vipOnly && !vip ? t('vipOnly') : realDuration(h, speed, lang),
            disabled: vipOnly && !vip,
          };
        })}
        value={inHours}
        onChange={setInHours}
      />

      <Heading>{t('estimateTitle')}</Heading>
      {vip ? (
        estimate.data ? (
          <Body>{t('estimateRange', { min: estimate.data.min, max: estimate.data.max, cap: estimate.data.capacity })}</Body>
        ) : (
          <Small>{t('loading')}</Small>
        )
      ) : (
        <View style={{ gap: space.sm }}>
          <Small>{t('estimateLocked')}</Small>
          <Button title={t('vipSeeMore')} small variant="secondary" style={{ alignSelf: 'flex-start' }} onPress={() => router.push('/vip')} />
        </View>
      )}

      <Heading>{t('setlist')}</Heading>
      <Small style={{ marginBottom: space.sm }}>{t('setlistHint')}</Small>
      {songs.length === 0 ? <Empty text={t('noRepertoire')} /> : null}
      {setlist.length >= 2 ? (
        <View style={{ marginBottom: space.md }}>
          <Small style={{ marginBottom: space.sm }}>{t('setOrderHint')}</Small>
          {setlist.map((id, i) => {
            const s = songs.find((x) => x.id === id);
            if (!s) return null;
            return (
              <Row key={id} style={{ justifyContent: 'space-between', paddingVertical: 4 }}>
                <Body style={{ flex: 1 }}>{`${i + 1}. ${s.title} · ${p(TEMPO_NAMES[s.tempo ?? 'mid'])}`}</Body>
                <Button title={t('moveUp')} small variant="ghost" disabled={i === 0} onPress={() => move(id, -1)} />
                <Button title={t('moveDown')} small variant="ghost" disabled={i === setlist.length - 1} onPress={() => move(id, 1)} />
              </Row>
            );
          })}
        </View>
      ) : null}
      {songs.map((s) => {
        const pos = setlist.indexOf(s.id);
        const on = pos >= 0;
        return (
          <Pressable
            key={s.id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            onPress={() => toggleSong(s.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.md,
              paddingVertical: space.md,
              borderBottomWidth: 1,
              borderBottomColor: c.line,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: radius.ticket,
                borderWidth: 1.5,
                borderColor: on ? c.blue : c.line,
                backgroundColor: on ? c.blue : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {on ? <Strong color={c.onBlue}>{pos + 1}</Strong> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Strong>{s.title}</Strong>
              <Small>{t('songMeta', { q: tierName('quality', s.quality, lang), f: tierName('familiarity', s.myFamiliarity, lang) })}</Small>
            </View>
          </Pressable>
        );
      })}

      <Heading>{t('sessionMusicians')}</Heading>
      <Small style={{ marginBottom: space.sm }}>{t('sessionHint', { fee: money(sm.fee), skill: tierName('skill', sm.skill, lang) })}</Small>
      <Row style={{ flexWrap: 'wrap' }}>
        {INSTRUMENTS.filter((r) => !takenRoles.has(r)).map((r) => {
          const on = session.includes(r);
          return (
            <Button
              key={r}
              small
              variant={on ? 'primary' : 'secondary'}
              title={p(ROLE_NAMES[r])}
              onPress={() => toggleRole(r)}
            />
          );
        })}
      </Row>

      <Heading>{t('stageEffects')}</Heading>
      {fxItems.length ? (
        <>
          <Small style={{ marginBottom: space.sm }}>{t('stageEffectsHint')}</Small>
          <Row style={{ flexWrap: 'wrap' }}>
            {fxItems.map((i) => {
              const on = effects.includes(i.id);
              const def = ITEM_BY_ID[i.itemId];
              return (
                <Button
                  key={i.id}
                  small
                  variant={on ? 'primary' : 'secondary'}
                  title={`${p(def.name)} +${def.bonus}`}
                  onPress={() => setEffects((e) => (on ? e.filter((x) => x !== i.id) : [...e, i.id]))}
                />
              );
            })}
          </Row>
        </>
      ) : (
        <Small>{t('noEffects')}</Small>
      )}

      <Heading>{t('performancePlan')}</Heading>
      <Small style={{ marginBottom: space.sm }}>{t('performancePlanHint')}</Small>
      <Row style={{ flexWrap: 'wrap' }}>
        {STAGE_EVENTS.map((e) => (
          <Button key={e.id} small variant={events.includes(e.id) ? 'primary' : 'secondary'} title={p(e.name)} onPress={() => toggleEvent(e.id)} />
        ))}
      </Row>
      <Heading>{t('encorePlan')}</Heading>
      <Choice
        options={ENCORE_PLANS.map((x) => ({ value: x, label: t(`encore_${x}`), hint: t(`encoreHint_${x}`) }))}
        value={encore}
        onChange={setEncore}
      />

      <Body style={{ marginTop: space.xl }}>{t('totalFee', { fee: money(fee) })}</Body>
      <Button
        title={t('confirmBooking')}
        style={{ marginTop: space.md }}
        loading={pending}
        disabled={setlist.length === 0 || (me.data?.character?.money ?? 0) < fee}
        onPress={book}
      />
    </Screen>
  );
}
