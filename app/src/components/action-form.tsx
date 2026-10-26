import { ENERGY_FREE_KINDS, type StartActionRequest, energyAfter, tierName } from '@rifftown/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Body, Button, Choice, Row, Small } from '@/components/ui';
import { api } from '@/lib/api';
import { money, realDuration } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useGameSpeed, useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

/** Süre seçip süreli bir eylem başlatan ortak form. */
export function HoursAction({
  options,
  build,
  price,
  earnings,
  label,
  disabled,
  goHome = true,
}: {
  options: readonly number[];
  build: (hours: number) => StartActionRequest;
  /** seçilen süreye göre ücret */
  price?: (hours: number) => number;
  earnings?: (hours: number) => number;
  label: string;
  disabled?: boolean;
  goHome?: boolean;
}) {
  const { t, lang } = useI18n();
  const speed = useGameSpeed();
  const me = useMe();
  const c = useColors();
  const { run, pending } = useRun();
  const [hours, setHours] = useState<number>(options[Math.min(1, options.length - 1)]);
  const cost = price?.(hours) ?? 0;
  const jailed = !!me.data?.character?.jailedUntil && build(hours).kind !== 'rest';
  const busy = !!me.data?.action;
  const broke = (me.data?.character?.money ?? 0) < cost;
  // Bitince enerji ne olur; yetmiyorsa iş başlamaz (dinlenme, tedavi, yolculuk serbest)
  const kind = build(hours).kind;
  const free = ENERGY_FREE_KINDS.includes(kind);
  const energyLeft = energyAfter(kind, hours, me.data?.character?.energy ?? 100);
  const tooTired = !free && energyLeft < 0;

  const start = async () => {
    const r = await run(() => api.post('/actions', build(hours)), { invalidate: ['me'] });
    if (r && goHome) router.navigate('/');
  };

  return (
    <View style={{ gap: space.md }}>
      <Small color={c.ink}>{t('chooseDuration')}</Small>
      <Choice
        options={options.map((h) => ({ value: h, label: t('hours', { n: h }), hint: realDuration(h, speed, lang) }))}
        value={hours}
        onChange={setHours}
      />
      <Row style={{ justifyContent: 'space-between' }}>
        <Body>
          {earnings ? `${t('earn')}: ${money(earnings(hours))}` : `${t('cost')}: ${cost ? money(cost) : t('free')}`}
        </Body>
        <Small>{t('takesRealTime', { time: realDuration(hours, speed, lang) })}</Small>
      </Row>
      {!free ? (
        <Small color={tooTired ? c.danger : c.inkSoft}>
          {tooTired ? t('tooTiredHint') : t('energyAfter', { tier: tierName('energy', energyLeft, lang) })}
        </Small>
      ) : null}
      {broke ? <Small color={c.danger}>{t('err_not_enough_money')}</Small> : null}
      {busy ? <Small color={c.inkSoft}>{t('err_busy')}</Small> : jailed ? <Small color={c.danger}>{t('err_in_jail')}</Small> : null}
      <Button title={label} onPress={start} loading={pending} disabled={disabled || busy || broke || jailed || tooTired} />
    </View>
  );
}
