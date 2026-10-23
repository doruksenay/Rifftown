// Suç, soruşturma, mahkeme ve cezaevi bileşenleri. Mekân ekranlarında ve ana ekranda kullanılır.

import {
  CRIME_BY_ID,
  type CaseDto,
  type CrimeOptionsResponse,
  INVESTIGATE_HOURS,
  type JusticeResponse,
  type LocationType,
  type Severity,
  crimesAt,
  isPolice,
} from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { HoursAction } from '@/components/action-form';
import { VipUpsell } from '@/components/careers';
import { Avatar, Body, Button, Card, Choice, Empty, Heading, ListRow, Row, Small, Strong } from '@/components/ui';
import { api } from '@/lib/api';
import { duration, money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import type { StringKey } from '@/lib/strings';
import { useIsVip, useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

type T = (k: StringKey, v?: Record<string, string | number>) => string;

export function useJustice(cityId: string | null | undefined) {
  return useQuery({
    queryKey: ['justice', cityId],
    queryFn: () => api.get<JusticeResponse>(`/justice/${cityId}`),
    enabled: !!cityId,
    refetchInterval: 30000,
  });
}

/** Başarı şansı: VIP yüzde görür, diğerleri kelime */
export function chanceText(chance: number, vip: boolean, t: T) {
  if (vip) return t('chanceExact', { n: Math.round(chance * 100) });
  return chance < 0.35 ? t('chanceLow') : chance < 0.65 ? t('chanceMid') : t('chanceHigh');
}

/** Bu mekânda işlenebilecek suçlar */
export function CrimeOptions({ locationId, zone }: { locationId: string; zone: LocationType }) {
  const { t, p } = useI18n();
  const c = useColors();
  const vip = useIsVip();
  const me = useMe();
  const { run, pending } = useRun();
  const has = crimesAt(zone).length > 0;
  const q = useQuery({
    queryKey: ['crime', locationId],
    queryFn: () => api.get<CrimeOptionsResponse>(`/crime/options?locationId=${locationId}`),
    enabled: has,
  });
  if (!has || !q.data) return null;
  const busy = !!me.data?.action || !!me.data?.character?.jailedUntil;
  return (
    <View>
      <Heading>{t('crimes')}</Heading>
      <Small style={{ marginBottom: space.sm }}>
        {t('crimeIntro')} {t('policeOnDuty', { n: q.data.policeOnDuty })}
      </Small>
      {q.data.options.map((o, i) => {
        const def = CRIME_BY_ID[o.id];
        return (
          <ListRow
            key={o.id}
            title={p(def.name)}
            subtitle={`${p(def.about)} ${t('crimeDetails', { min: money(o.loot[0]), max: money(o.loot[1]), h: o.sentenceHours })}`}
            right={
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Small color={o.blocked ? c.danger : c.ink}>{o.blocked ? t(`err_${o.blocked}` as StringKey) : chanceText(o.chance, vip, t)}</Small>
                <Button
                  title={t('tryIt')}
                  small
                  variant="secondary"
                  disabled={!!o.blocked || busy || pending}
                  onPress={async () => {
                    const r = await run(() => api.post('/actions', { kind: 'crime', crime: o.id, locationId }), { invalidate: ['me'] });
                    if (r) router.navigate('/');
                  }}
                />
              </View>
            }
            last={i === q.data!.options.length - 1}
          />
        );
      })}
    </View>
  );
}

/** Emniyet: soruşturma ve şehrin suç durumu */
export function PoliceDesk({ locationId, cityId }: { locationId: string; cityId: string }) {
  const { t } = useI18n();
  const c = useColors();
  const me = useMe();
  const vip = useIsVip();
  const j = useJustice(cityId);
  const ch = me.data!.character!;
  const police = isPolice(ch.profession?.id);
  const needsVip = police && ch.profession?.id !== 'police' && !vip;
  return (
    <View>
      <Heading>{t('investigate')}</Heading>
      {j.data ? (
        <Small style={{ marginBottom: space.sm }}>
          {t('unsolvedCrimes', { n: j.data.unsolvedCount })} · {t('policeOnDuty', { n: j.data.policeOnDuty })}
        </Small>
      ) : null}
      <Body color={c.inkSoft} style={{ marginBottom: space.md }}>{t('investigateIntro')}</Body>
      {!police ? (
        <Small>{t('policeOnly')}</Small>
      ) : needsVip ? (
        <VipUpsell text={t('err_vip_required')} />
      ) : (
        <HoursAction options={[INVESTIGATE_HOURS]} build={() => ({ kind: 'investigate', locationId })} label={t('investigate')} />
      )}
    </View>
  );
}

function caseSubtitle(k: CaseDto, t: T, lang: 'tr' | 'en') {
  const who = k.arrestedBy ? t('arrestedByName', { name: k.arrestedBy }) : t('caughtInAct');
  if (k.status === 'pending') return `${who}, ${t('caseDueIn', { time: duration(new Date(k.dueAt).getTime() - Date.now(), lang) })}`;
  const verdict = k.status === 'convicted' ? t('convictedLine', { h: k.sentenceHours ?? 0 }) : t('acquittedLine');
  return `${verdict}, ${k.judgeName ? t('judgedBy', { name: k.judgeName }) : t('courtAuto')}`;
}

/** Adliye: bekleyen davalar ve kararlar */
export function Courtroom({ cityId }: { cityId: string }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const vip = useIsVip();
  const j = useJustice(cityId);
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const [severity, setSeverity] = useState<Severity>('normal');
  const ch = me.data!.character!;
  const judge = ch.profession?.id === 'judge' && vip;
  const rule = (id: number, verdict: 'guilty' | 'innocent') =>
    run(() => api.post<{ bonus: number }>(`/cases/${id}/rule`, { verdict, severity }), { invalidate: ['me'] }).then((r) => {
      if (r) qc.invalidateQueries({ queryKey: ['justice', cityId] });
    });

  return (
    <View>
      <Heading>{t('justice')}</Heading>
      <Body color={c.inkSoft}>{t('courtIntro')}</Body>
      {!judge ? <Small style={{ marginTop: space.sm }}>{t('judgeOnly')}</Small> : null}

      <Heading>{t('pendingCases')}</Heading>
      {judge && j.data?.pendingCases.length ? (
        <View style={{ marginBottom: space.sm }}>
          <Small color={c.ink} style={{ marginBottom: space.xs }}>{t('sentenceSeverity')}</Small>
          <Choice<Severity>
            options={[
              { value: 'light', label: t('sevLight') },
              { value: 'normal', label: t('sevNormal') },
              { value: 'harsh', label: t('sevHarsh') },
            ]}
            value={severity}
            onChange={setSeverity}
          />
        </View>
      ) : null}
      {j.data?.pendingCases.length ? (
        j.data.pendingCases.map((k, i, arr) => (
          <ListRow
            key={k.id}
            title={`${k.suspectName}: ${CRIME_BY_ID[k.crime] ? p(CRIME_BY_ID[k.crime].name) : k.crime}`}
            subtitle={caseSubtitle(k, t, lang)}
            right={
              judge && k.suspectId !== ch.id ? (
                <Row>
                  <Button title={t('verdictInnocent')} small variant="ghost" disabled={pending} onPress={() => rule(k.id, 'innocent')} />
                  <Button title={t('verdictGuilty')} small disabled={pending} onPress={() => rule(k.id, 'guilty')} />
                </Row>
              ) : undefined
            }
            last={i === arr.length - 1}
          />
        ))
      ) : (
        <Empty text={t('noPendingCases')} />
      )}

      {j.data?.recentCases.length ? (
        <>
          <Heading>{t('recentVerdicts')}</Heading>
          {j.data.recentCases.map((k, i, arr) => (
            <ListRow
              key={k.id}
              title={`${k.suspectName}: ${CRIME_BY_ID[k.crime] ? p(CRIME_BY_ID[k.crime].name) : k.crime}`}
              subtitle={caseSubtitle(k, t, lang)}
              onPress={() => router.push(`/character/${k.suspectId}`)}
              last={i === arr.length - 1}
            />
          ))}
        </>
      ) : null}
    </View>
  );
}

/** Cezaevi: mahkûm listesi */
export function Prison({ cityId }: { cityId: string }) {
  const { t, lang } = useI18n();
  const c = useColors();
  const j = useJustice(cityId);
  return (
    <View>
      <Body color={c.inkSoft}>{t('prisonIntro')}</Body>
      <Heading>{t('inmates')}</Heading>
      {j.data?.inmates.length ? (
        j.data.inmates.map((m, i, arr) => (
          <ListRow
            key={m.characterId}
            left={<Avatar name={m.name} color={m.avatarColor} size={32} />}
            title={m.name}
            subtitle={m.inCustody ? t('awaitingTrial') : t('outIn', { time: duration(new Date(m.until).getTime() - Date.now(), lang) })}
            onPress={() => router.push(`/character/${m.characterId}`)}
            last={i === arr.length - 1}
          />
        ))
      ) : (
        <Empty text={t('noInmates')} />
      )}
    </View>
  );
}

/** Ana ekranda: cezaevindeyken durum ve kefalet */
export function JailBanner() {
  const { t, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const { run, pending } = useRun();
  const ch = me.data?.character;
  if (!ch?.jailedUntil) return null;
  const bail = me.data!.bailCost;
  return (
    <Card style={{ marginTop: space.lg, borderColor: c.danger, borderWidth: 1.5 }}>
      <Strong color={c.danger}>{t('jailedTitle')}</Strong>
      <Body style={{ marginTop: space.xs }}>
        {ch.inCustody ? t('inCustodyText') : t('servingText', { time: duration(new Date(ch.jailedUntil).getTime() - Date.now(), lang) })}
      </Body>
      {bail ? (
        <Button
          title={t('payBail', { money: money(bail) })}
          variant="secondary"
          small
          style={{ alignSelf: 'flex-start', marginTop: space.md }}
          disabled={pending || ch.money < bail}
          onPress={() => run(() => api.post('/jail/bail'), { success: t('bailPaid'), invalidate: ['me'] })}
        />
      ) : null}
    </Card>
  );
}
