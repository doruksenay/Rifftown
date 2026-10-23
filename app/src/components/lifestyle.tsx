// Yaşam mekânları: restoran, otel, banka, dövme stüdyosu, spor salonu, atölye, festival.

import {
  CITY_BY_ID,
  FESTIVAL_MIN_FAME,
  type FestivalDto,
  GYM_PRICE_PER_HOUR,
  HOTEL_NIGHT_OPTIONS,
  HOTEL_PRICE_PER_NIGHT,
  HOUR_OPTIONS,
  ITEM_BY_ID,
  LOCATION_BY_ID,
  MEALS,
  RECIPES,
  TATTOOS,
  TATTOO_BY_ID,
  TATTOO_REMOVAL_PRICE,
  priceFor,
  tierName,
} from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { HoursAction } from '@/components/action-form';
import { Body, Button, Card, Choice, Empty, Field, Heading, ListRow, Row, Small, Strong } from '@/components/ui';
import { api } from '@/lib/api';
import { duration, money } from '@/lib/format';
import { useInventory, useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

const cityOf = (locationId: string) => CITY_BY_ID[LOCATION_BY_ID[locationId].cityId];

function useBusy() {
  const me = useMe();
  return !!me.data?.action || !!me.data?.character?.jailedUntil;
}

// ---------- Restoran ----------

export function Restaurant({ locationId, menuMult = 1 }: { locationId: string; menuMult?: number }) {
  const { t, p } = useI18n();
  const c = useColors();
  const me = useMe();
  const busy = useBusy();
  const { run, pending } = useRun();
  const city = cityOf(locationId);
  return (
    <View style={{ marginTop: space.lg }}>
      <Body color={c.inkSoft}>{t('restaurantIntro')}</Body>
      <View style={{ height: space.md }} />
      {MEALS.map((m, i) => {
        const price = Math.max(1, Math.round(m.price * city.costMult * menuMult));
        return (
          <ListRow
            key={m.id}
            title={p(m.name)}
            subtitle={t('mealEffect', { m: m.mood, h: m.health })}
            right={
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Strong>{money(price)}</Strong>
                <Button
                  title={t('eat')}
                  small
                  variant="secondary"
                  disabled={busy || pending || (me.data?.character?.money ?? 0) < price}
                  onPress={() => run(() => api.post('/meals', { locationId, mealId: m.id }), { success: t('ate'), invalidate: ['me'] })}
                />
              </View>
            }
            last={i === MEALS.length - 1}
          />
        );
      })}
    </View>
  );
}

// ---------- Otel ----------

export function Hotel({ locationId }: { locationId: string }) {
  const { t, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const busy = useBusy();
  const { run, pending } = useRun();
  const [nights, setNights] = useState<number>(1);
  const city = cityOf(locationId);
  const price = Math.round(HOTEL_PRICE_PER_NIGHT * city.costMult * nights);
  const stay = me.data?.character?.hotel;
  return (
    <View style={{ marginTop: space.lg, gap: space.md }}>
      <Body color={c.inkSoft}>{t('hotelIntro')}</Body>
      {stay && stay.cityId === city.id ? (
        <Small color={c.blue}>{t('hotelUntil', { time: duration(new Date(stay.until).getTime() - Date.now(), lang) })}</Small>
      ) : null}
      <Choice options={HOTEL_NIGHT_OPTIONS.map((n) => ({ value: n, label: t('nights', { n }) }))} value={nights} onChange={setNights} />
      <Row style={{ justifyContent: 'space-between' }}>
        <Body>{`${t('cost')}: ${money(price)}`}</Body>
        <Button
          title={t('book')}
          disabled={busy || pending || (me.data?.character?.money ?? 0) < price}
          onPress={() => run(() => api.post('/hotel', { locationId, nights }), { invalidate: ['me'] })}
        />
      </Row>
    </View>
  );
}

// ---------- Banka ----------

export function Bank({ locationId }: { locationId: string }) {
  const { t } = useI18n();
  const c = useColors();
  const me = useMe();
  const busy = useBusy();
  const { run, pending } = useRun();
  const [amount, setAmount] = useState('');
  const n = Number.parseInt(amount, 10) || 0;
  const ch = me.data!.character!;
  return (
    <View style={{ marginTop: space.lg }}>
      <Body color={c.inkSoft}>{t('bankIntro')}</Body>
      <Card style={{ marginVertical: space.lg }}>
        <Strong>{t('balance', { money: money(ch.bank) })}</Strong>
        <Small>{`${t('money')}: ${money(ch.money)}`}</Small>
      </Card>
      <Field label={t('amountLabel')} value={amount} onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" inputMode="numeric" />
      <Row>
        <Button
          title={t('deposit')}
          style={{ flex: 1 }}
          disabled={busy || pending || n < 1 || n > ch.money}
          onPress={async () => {
            if (await run(() => api.post('/bank/deposit', { locationId, amount: n }), { invalidate: ['me'] })) setAmount('');
          }}
        />
        <Button
          title={t('withdrawMoney')}
          variant="secondary"
          style={{ flex: 1 }}
          disabled={busy || pending || n < 1 || n > ch.bank}
          onPress={async () => {
            if (await run(() => api.post('/bank/withdraw', { locationId, amount: n }), { invalidate: ['me'] })) setAmount('');
          }}
        />
      </Row>
    </View>
  );
}

// ---------- Dövme ----------

export function TattooStudio({ locationId }: { locationId: string }) {
  const { t, p } = useI18n();
  const c = useColors();
  const me = useMe();
  const busy = useBusy();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const mine = useQuery({ queryKey: ['tattoos'], queryFn: () => api.get<{ tattoos: { id: number; tattooId: string }[] }>('/tattoos').then((r) => r.tattoos) });
  const done = () => qc.invalidateQueries({ queryKey: ['tattoos'] });
  return (
    <View style={{ marginTop: space.lg }}>
      <Body color={c.inkSoft}>{t('tattooIntro', { money: money(TATTOO_REMOVAL_PRICE) })}</Body>
      <View style={{ height: space.md }} />
      {TATTOOS.map((d, i) => (
        <ListRow
          key={d.id}
          title={p(d.name)}
          right={
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <Strong>{money(d.price)}</Strong>
              <Button
                title={t('getTattoo')}
                small
                variant="secondary"
                disabled={busy || pending || (me.data?.character?.money ?? 0) < d.price}
                onPress={async () => {
                  if (await run(() => api.post('/tattoos', { locationId, tattooId: d.id }), { success: t('tattooDone'), invalidate: ['me'] })) done();
                }}
              />
            </View>
          }
          last={i === TATTOOS.length - 1}
        />
      ))}
      {mine.data?.length ? (
        <>
          <Heading>{t('myTattoos')}</Heading>
          {mine.data.map((m, i, arr) => (
            <ListRow
              key={m.id}
              title={TATTOO_BY_ID[m.tattooId] ? p(TATTOO_BY_ID[m.tattooId].name) : m.tattooId}
              right={
                <Button
                  title={t('removeTattoo')}
                  small
                  variant="ghost"
                  disabled={busy || pending}
                  onPress={async () => {
                    if (await run(() => api.del(`/tattoos/${m.id}?locationId=${locationId}`), { invalidate: ['me'] })) done();
                  }}
                />
              }
              last={i === arr.length - 1}
            />
          ))}
        </>
      ) : null}
    </View>
  );
}

// ---------- Spor salonu ----------

export function Gym({ locationId }: { locationId: string }) {
  const { t, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const city = cityOf(locationId);
  const fit = me.data?.character?.skills.fitness;
  return (
    <View style={{ marginTop: space.lg, gap: space.md }}>
      <Body color={c.inkSoft}>{t('gymIntro')}</Body>
      {typeof fit === 'number' ? <Small color={c.blue}>{`${t('skills')}: ${tierName('skill', fit, lang)}`}</Small> : null}
      <HoursAction
        options={HOUR_OPTIONS.workout}
        build={(hours) => ({ kind: 'workout', hours, locationId })}
        price={(h) => priceFor(GYM_PRICE_PER_HOUR, city, h)}
        label={t('workout')}
      />
    </View>
  );
}

// ---------- Atölye ----------

export function Workshop({ locationId }: { locationId: string }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const inv = useInventory();
  const busy = useBusy();
  const { run, pending } = useRun();
  const have = (id: string) => (inv.data ?? []).filter((i) => i.itemId === id && !i.listed).length;
  const skill = me.data?.character?.skills.craftsmanship ?? 0;
  return (
    <View>
      <Heading>{t('workshop')}</Heading>
      <Body color={c.inkSoft}>{t('workshopIntro')}</Body>
      <Small style={{ marginTop: space.xs }}>{`${t('skills')}: ${tierName('skill', skill, lang)}`}</Small>
      <View style={{ height: space.md }} />
      {RECIPES.map((r, i) => {
        const mats = Object.entries(r.materials);
        const ready = mats.every(([id, n]) => have(id) >= n);
        return (
          <ListRow
            key={r.id}
            title={p(r.name)}
            subtitle={`${t('needs', { list: mats.map(([id, n]) => `${n}× ${p(ITEM_BY_ID[id].name)} (${t('youHave', { n: have(id) })})`).join(', ') })} · ${t('craftRange', { min: r.bonus[0], max: r.bonus[1] })}`}
            right={
              <Button
                title={t('craftIt')}
                small
                variant={ready ? 'primary' : 'secondary'}
                disabled={!ready || busy || pending}
                onPress={async () => {
                  const res = await run(() => api.post('/actions', { kind: 'craft', recipe: r.id, locationId }), { invalidate: ['me', 'inventory'] });
                  if (res) router.navigate('/');
                }}
              />
            }
            last={i === RECIPES.length - 1}
          />
        );
      })}
    </View>
  );
}

// ---------- Festival ----------

export function FestivalPanel({ cityId }: { cityId: string }) {
  const { t, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const q = useQuery({ queryKey: ['festivals'], queryFn: () => api.get<{ festivals: FestivalDto[] }>('/festivals').then((r) => r.festivals) });
  const f = q.data?.find((x) => x.cityId === cityId && x.status !== 'done') ?? q.data?.find((x) => x.cityId === cityId);
  const isLeader = !!me.data?.band?.isLeader;
  const left = (iso: string) => duration(new Date(iso).getTime() - Date.now(), lang);
  return (
    <View style={{ marginTop: space.lg }}>
      <Body color={c.inkSoft}>{t('festivalIntro')}</Body>
      {!f ? (
        <Empty text={t('noFestival')} />
      ) : (
        <>
          <Card style={{ marginTop: space.lg }}>
            <Strong>
              {f.status === 'open' ? t('applyUntil', { time: left(f.applyUntil) }) : f.status === 'scheduled' ? t('festivalStarts', { time: left(f.startsAt) }) : t('festivalDone')}
            </Strong>
            {f.status === 'open' ? <Small>{t('festivalNeedFame', { tier: tierName('fame', FESTIVAL_MIN_FAME, lang) })}</Small> : null}
            {f.status === 'open' && isLeader ? (
              <Button
                title={f.myBandApplied ? t('applied') : t('applyFestival')}
                style={{ marginTop: space.md, alignSelf: 'flex-start' }}
                small
                disabled={f.myBandApplied || pending}
                onPress={async () => {
                  if (await run(() => api.post(`/festivals/${f.id}/apply`))) qc.invalidateQueries({ queryKey: ['festivals'] });
                }}
              />
            ) : null}
          </Card>
          <Heading>{f.status === 'open' ? t('applicants') : t('lineup')}</Heading>
          {f.lineup.length ? (
            f.lineup.map((b, i, arr) => (
              <ListRow
                key={b.bandId}
                title={b.bandName}
                subtitle={`${tierName('fame', b.fame, lang)}${b.npc ? ` · ${t('npcBand')}` : ''}`}
                right={b.selected && b.slot ? <Small color={c.pink}>{t('slotN', { n: b.slot })}</Small> : undefined}
                onPress={() => router.push(`/band/${b.bandId}`)}
                last={i === arr.length - 1}
              />
            ))
          ) : (
            <Empty text={t('noFestival')} />
          )}
        </>
      )}
    </View>
  );
}
