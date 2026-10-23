// Meslek kartları ve VIP etiketi. Mekân ekranlarında ve meslekler sayfasında kullanılır.

import {
  CITY_BY_ID,
  HOUR_OPTIONS,
  LOCATION_BY_ID,
  type Lang,
  type L,
  type Profession,
  RANK_HOURS,
  type Requirement,
  SKILL_BY_ID,
  careerPay,
  professionsAt,
  tierName,
  unmetRequirement,
  type LocationType,
} from '@rifftown/shared';
import { router } from 'expo-router';
import { Alert, Platform, Text, View } from 'react-native';
import { HoursAction } from '@/components/action-form';
import { Body, Button, Card, Heading, Row, Small, Strong } from '@/components/ui';
import { api } from '@/lib/api';
import { money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import type { StringKey } from '@/lib/strings';
import { useIsVip, useMe } from '@/lib/session';
import { fonts, radius, space, type, useColors } from '@/theme';

type T = (k: StringKey, v?: Record<string, string | number>) => string;

export function VipTag() {
  const c = useColors();
  return (
    <View style={{ borderWidth: 1.5, borderColor: c.pink, borderRadius: radius.ticket, paddingHorizontal: 6, paddingVertical: 1 }}>
      <Text style={{ fontFamily: fonts.bodyBold, fontSize: type.caption, color: c.pink }}>VIP</Text>
    </View>
  );
}

export function requirementText(reqs: Requirement[], t: T, p: (l: L) => string, lang: Lang) {
  return reqs
    .map((r) =>
      t('needItem', {
        skills: r.anyOf.map((id) => (SKILL_BY_ID[id] ? p(SKILL_BY_ID[id].name) : id)).join(` ${t('or')} `),
        tier: tierName('skill', r.min, lang),
      }),
    )
    .join('; ');
}

export function confirmThen(title: string, message: string, ok: string, cancel: string, fn: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(message)) fn();
    return;
  }
  Alert.alert(title, message, [
    { text: cancel, style: 'cancel' },
    { text: ok, style: 'destructive', onPress: fn },
  ]);
}

/** Bir meslek: şartları, ücreti ve duruma göre "Mesleğe gir" ya da "Mesai yap". */
export function ProfessionCard({ prof, locationId }: { prof: Profession; locationId?: string }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const vip = useIsVip();
  const { run, pending } = useRun();
  const ch = me.data!.character!;
  const city = ch.cityId ? CITY_BY_ID[ch.cityId] : null;
  const mine = ch.profession?.id === prof.id;
  const rank = mine ? ch.profession!.rank : 0;
  const unmet = unmetRequirement(prof, ch.skills);
  const locked = prof.vip && !vip;
  const atZone = !!locationId && LOCATION_BY_ID[locationId]?.type === prof.zone;

  return (
    <Card style={{ marginBottom: space.md, borderColor: mine ? c.blue : c.line }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Strong>{p(prof.name)}</Strong>
          <Small>{mine ? p(prof.ranks[rank]) : t('hourlyPay', { pay: money(careerPay(prof, 0, city?.costMult ?? 1)) })}</Small>
        </View>
        {prof.vip ? <VipTag /> : null}
      </Row>
      <Small style={{ marginTop: space.sm }}>{p(prof.about)}</Small>
      <Small style={{ marginTop: space.xs }} color={unmet ? c.danger : c.inkSoft}>
        {t('needs', { list: requirementText(prof.requires, t, p, lang) })}
      </Small>

      {mine ? (
        <View style={{ marginTop: space.md }}>
          <Small color={c.ink}>
            {rank < 3
              ? t('rankNext', { rank: p(prof.ranks[rank + 1]), hours: Math.ceil(RANK_HOURS[rank + 1] - ch.profession!.hours) })
              : t('rankTop')}
          </Small>
          {atZone ? (
            <View style={{ marginTop: space.md }}>
              <HoursAction
                options={HOUR_OPTIONS.work}
                build={(hours) => ({ kind: 'work', locationId: locationId!, hours })}
                earnings={(h) => careerPay(prof, rank, city?.costMult ?? 1) * h}
                label={t('workShift')}
                disabled={locked}
              />
            </View>
          ) : null}
          <Button
            title={t('quitCareer')}
            variant="ghost"
            small
            style={{ alignSelf: 'flex-start', paddingHorizontal: 0, marginTop: space.sm }}
            onPress={() => confirmThen(t('quitCareer'), t('quitConfirm'), t('confirm'), t('cancel'), () => run(() => api.post('/career/quit'), { invalidate: ['me'] }))}
          />
        </View>
      ) : atZone ? (
        <View style={{ marginTop: space.md, gap: space.xs }}>
          {locked ? <Small color={c.pink}>{t('vipRequiredHint')}</Small> : null}
          <Button
            title={t('joinCareer')}
            variant="secondary"
            small
            disabled={!!unmet || locked || pending || !!me.data?.action}
            onPress={() =>
              run(() => api.post('/career/join', { professionId: prof.id, locationId }), {
                success: t('joined', { job: p(prof.name) }),
                invalidate: ['me'],
              })
            }
          />
        </View>
      ) : null}
    </Card>
  );
}

/** Bir mekânda çalışılabilen meslekler */
export function ProfessionsHere({ locationId, zone }: { locationId: string; zone: LocationType }) {
  const { t } = useI18n();
  const list = professionsAt(zone);
  if (!list.length) return null;
  return (
    <View>
      <Heading>{t('professionsHere')}</Heading>
      {list.map((prof) => (
        <ProfessionCard key={prof.id} prof={prof} locationId={locationId} />
      ))}
    </View>
  );
}

export function VipUpsell({ text }: { text: string }) {
  const { t } = useI18n();
  const c = useColors();
  return (
    <Card style={{ borderColor: c.pink, marginTop: space.md }}>
      <Body>{text}</Body>
      <Button title={t('vipSeeMore')} small variant="secondary" style={{ alignSelf: 'flex-start', marginTop: space.sm }} onPress={() => router.push('/vip')} />
    </Card>
  );
}
