// Oyuncu işletmesi paneli: satılık ruhsat, sahibinin yönetim ekranı, çalışanın mesaisi ve iş teklifi.

import { BUSINESS_HOUR_OPTIONS, type BusinessDto, MAX_GIG_SHARE, MENU_MULT_RANGE, WAGE_RANGE } from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { HoursAction } from '@/components/action-form';
import { confirmThen } from '@/components/careers';
import { Body, Button, Card, Choice, Field, Heading, ListRow, Row, Small, Strong, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { duration, money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import type { StringKey } from '@/lib/strings';
import { useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

export function useBusiness(locationId: string) {
  return useQuery({
    queryKey: ['business', locationId],
    queryFn: () => api.get<{ business: BusinessDto }>(`/businesses/${locationId}`).then((r) => r.business),
  });
}

export function BusinessPanel({ locationId }: { locationId: string }) {
  const { t, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const q = useBusiness(locationId);
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const b = q.data;
  if (!b) return null;
  const refresh = () => qc.invalidateQueries({ queryKey: ['business', locationId] });
  const extra = b.kind === 'bar' ? t('businessBarExtra') : t('businessRestaurantExtra');

  if (b.forSale) {
    return (
      <Card style={{ marginTop: space.lg, borderColor: c.blue }}>
        <Strong>{t('business')}</Strong>
        <Body color={c.inkSoft} style={{ marginTop: space.xs }}>{`${t('businessForSale')} ${extra}`}</Body>
        <Small style={{ marginTop: space.xs }}>{t('weeklyUpkeep', { money: money(b.upkeep) })}</Small>
        <Button
          title={t('buyBusiness', { money: money(b.price) })}
          style={{ marginTop: space.md, alignSelf: 'flex-start' }}
          small
          disabled={pending || (me.data?.character?.money ?? 0) < b.price || !!me.data?.character?.jailedUntil}
          onPress={async () => {
            if (await run(() => api.post(`/businesses/${locationId}/buy`), { invalidate: ['me', 'city'] })) refresh();
          }}
        />
      </Card>
    );
  }

  return (
    <View style={{ marginTop: space.lg }}>
      <Card>
        <Strong>{b.name}</Strong>
        <Small>{t('ownedBy', { name: b.owner!.name })}</Small>
        {b.kind === 'bar' ? <Small>{t('gigShare', { n: Math.round(b.gigShare * 100) })}</Small> : <Small>{t('menuMult', { n: b.menuMult.toFixed(2) })}</Small>}
        {!b.isOwner && b.owner ? (
          <Button title={t('profile')} variant="ghost" small style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }} onPress={() => router.push(`/character/${b.owner!.characterId}`)} />
        ) : null}
      </Card>

      {b.staffStatus === 'offered' ? (
        <Card style={{ marginTop: space.md, borderColor: c.pink }}>
          <Body>{t('jobOfferHere', { money: money(b.myWage ?? 0) })}</Body>
          <Row style={{ marginTop: space.sm }}>
            <Button title={t('decline')} small variant="ghost" onPress={async () => {
              if (await run(() => api.post(`/businesses/${locationId}/job`, { accept: false }))) refresh();
            }} />
            <Button title={t('accept')} small onPress={async () => {
              if (await run(() => api.post(`/businesses/${locationId}/job`, { accept: true }), { invalidate: ['me'] })) refresh();
            }} />
          </Row>
        </Card>
      ) : null}

      {b.staffStatus === 'hired' || b.isOwner ? (
        <View style={{ marginTop: space.lg, gap: space.sm }}>
          <Small>{b.isOwner ? t('ownerShiftHint') : t('youWorkHere', { money: money(b.myWage ?? 0) })}</Small>
          <HoursAction
            options={BUSINESS_HOUR_OPTIONS}
            build={(hours) => ({ kind: 'work', locationId, hours })}
            earnings={b.isOwner ? undefined : (h) => (b.myWage ?? 0) * h}
            label={t('workShift')}
          />
          {b.staffStatus === 'hired' ? (
            <Button
              title={t('quitJob')}
              variant="ghost"
              small
              style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
              onPress={() =>
                confirmThen(t('quitJob'), `${t('quitJob')}?`, t('confirm'), t('cancel'), async () => {
                  if (await run(() => api.del(`/businesses/${locationId}/staff/${me.data!.character!.id}`), { invalidate: ['me'] })) refresh();
                })
              }
            />
          ) : null}
        </View>
      ) : null}

      {b.isOwner ? <OwnerTools b={b} refresh={refresh} /> : null}
      <Small style={{ marginTop: space.md }}>{b.upkeepDue ? t('upkeepDue', { time: duration(new Date(b.upkeepDue).getTime() - Date.now(), lang) }) : ''}</Small>
    </View>
  );
}

function OwnerTools({ b, refresh }: { b: BusinessDto; refresh: () => void }) {
  const { t } = useI18n();
  const c = useColors();
  const toast = useToast();
  const { run, pending } = useRun();
  const [name, setName] = useState(b.name);
  const [share, setShare] = useState(b.gigShare);
  const [mult, setMult] = useState(b.menuMult);
  const [amount, setAmount] = useState('');
  const [hireName, setHireName] = useState('');
  const [wage, setWage] = useState('15');
  useEffect(() => setName(b.name), [b.name]);
  const n = Number.parseInt(amount, 10) || 0;
  const shares = [0, 0.05, 0.1, 0.15, 0.2, 0.25, MAX_GIG_SHARE];
  const mults = [MENU_MULT_RANGE[0], 1, 1.2, 1.4, MENU_MULT_RANGE[1]];

  const hire = async () => {
    const found = await api.get<{ characters: { id: number; name: string }[] }>(`/characters?search=${encodeURIComponent(hireName.trim())}`).catch(() => null);
    const target = found?.characters.find((x) => x.name.toLocaleLowerCase('tr') === hireName.trim().toLocaleLowerCase('tr'));
    if (!target) return toast(t('characterNotFound'), 'error');
    if (await run(() => api.post(`/businesses/${b.locationId}/staff`, { characterId: target.id, wage: Number.parseInt(wage, 10) || 0 }))) {
      setHireName('');
      refresh();
    }
  };

  return (
    <View>
      <Heading>{t('till')}</Heading>
      <Card>
        <Strong>{t('tillAmount', { money: money(b.till ?? 0) })}</Strong>
        <Small>{`${t('weeklyUpkeep', { money: money(b.upkeep) })} · ${t('totalRevenue', { money: money(b.totalRevenue ?? 0) })}`}</Small>
      </Card>
      <View style={{ height: space.md }} />
      <Field label={t('amountLabel')} value={amount} onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" inputMode="numeric" />
      <Row>
        <Button title={t('takeFromTill')} small style={{ flex: 1 }} disabled={n < 1 || n > (b.till ?? 0) || pending} onPress={async () => {
          if (await run(() => api.post(`/businesses/${b.locationId}/till`, { amount: n }), { invalidate: ['me'] })) {
            setAmount('');
            refresh();
          }
        }} />
        <Button title={t('putInTill')} small variant="secondary" style={{ flex: 1 }} disabled={n < 1 || pending} onPress={async () => {
          if (await run(() => api.post(`/businesses/${b.locationId}/till`, { amount: -n }), { invalidate: ['me'] })) {
            setAmount('');
            refresh();
          }
        }} />
      </Row>

      <Heading>{t('settings')}</Heading>
      <Field label={t('businessName')} value={name} onChangeText={setName} maxLength={32} />
      {b.kind === 'bar' ? (
        <>
          <Small color={c.ink} style={{ marginBottom: space.xs }}>{t('gigShare', { n: Math.round(share * 100) })}</Small>
          <Choice options={shares.map((s) => ({ value: s, label: `%${Math.round(s * 100)}` }))} value={share} onChange={setShare} />
        </>
      ) : (
        <>
          <Small color={c.ink} style={{ marginBottom: space.xs }}>{t('menuMult', { n: mult.toFixed(2) })}</Small>
          <Choice options={mults.map((m) => ({ value: m, label: `×${m.toFixed(1)}` }))} value={mult} onChange={setMult} />
        </>
      )}
      <Button
        title={t('save')}
        variant="secondary"
        small
        style={{ marginTop: space.md, alignSelf: 'flex-start' }}
        disabled={pending || (name === b.name && share === b.gigShare && mult === b.menuMult)}
        onPress={async () => {
          if (await run(() => api.patch(`/businesses/${b.locationId}`, { name, gigShare: share, menuMult: mult }), { success: t('saved'), invalidate: ['city'] })) refresh();
        }}
      />

      <Heading>{t('staff')}</Heading>
      {b.staff?.length ? (
        b.staff.map((s, i, arr) => (
          <ListRow
            key={s.characterId}
            title={s.name}
            subtitle={`${money(s.wage)}/h${s.status === 'offered' ? ` · ${t('offered')}` : ''}`}
            onPress={() => router.push(`/character/${s.characterId}`)}
            right={
              <Button title={t('fire')} small variant="ghost" disabled={pending} onPress={() =>
                confirmThen(t('fire'), `${t('fire')}: ${s.name}?`, t('confirm'), t('cancel'), async () => {
                  if (await run(() => api.del(`/businesses/${b.locationId}/staff/${s.characterId}`))) refresh();
                })
              } />
            }
            last={i === arr.length - 1}
          />
        ))
      ) : (
        <Small>{t('noStaff')}</Small>
      )}
      <View style={{ height: space.md }} />
      <Field label={t('hireByName')} value={hireName} onChangeText={setHireName} autoCapitalize="words" autoCorrect={false} />
      <Field label={`${t('wagePerHour')} (${WAGE_RANGE[0]}–${WAGE_RANGE[1]} $)`} value={wage} onChangeText={(v) => setWage(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" inputMode="numeric" />
      <Button title={t('offerJob')} variant="secondary" small style={{ alignSelf: 'flex-start' }} disabled={!hireName.trim() || pending} onPress={hire} />

      {b.log?.length ? (
        <>
          <Heading>{t('businessLog')}</Heading>
          {b.log.map((l, i, arr) => (
            <ListRow
              key={`${l.createdAt}-${i}`}
              title={`${t(`log_${l.kind}` as StringKey)}${l.name ? ` · ${l.name}` : ''}`}
              right={<Small color={l.amount >= 0 ? c.blue : c.danger}>{`${l.amount >= 0 ? '+' : ''}${money(l.amount)}`}</Small>}
              last={i === arr.length - 1}
            />
          ))}
        </>
      ) : null}

      <Button
        title={t('sellBusiness')}
        variant="ghost"
        style={{ marginTop: space.xl, alignSelf: 'flex-start', paddingHorizontal: 0 }}
        onPress={() =>
          confirmThen(t('sellBusiness'), `${t('sellBusiness')}?`, t('confirm'), t('cancel'), async () => {
            if (await run(() => api.post(`/businesses/${b.locationId}/sell`), { invalidate: ['me', 'city'] })) refresh();
          })
        }
      />
    </View>
  );
}
