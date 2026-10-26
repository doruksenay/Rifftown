// Plak şirketi: şirket kur, gruplara sözleşme teklif et, pazarlık; grup lideri teklifleri yanıtlar.

import { LABEL_ADVANCE_MAX, LABEL_BAND_SHARE_RANGE, LABEL_CONTRACT_WEEKS, LABEL_FOUND_PRICE } from '@rifftown/shared';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useGate } from '@/components/gate';
import { Body, Button, Card, Choice, Empty, Field, Heading, Row, Screen, Small, Strong } from '@/components/ui';
import { api } from '@/lib/api';
import { money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import type { StringKey } from '@/lib/strings';
import { space, useColors } from '@/theme';

interface Contract {
  id: number;
  label: string;
  band: { id: number; name: string };
  bandShare: number;
  advance: number;
  recouped: number;
  weeks: number;
  status: string;
  myTurn: boolean;
  side: 'label' | 'band';
  endsAt: string | null;
}
interface LabelsResponse {
  labels: { id: number; name: string; cityId: string; owner: string; roster: number }[];
  mine: { label: { id: number; name: string; till: number; totalRevenue: number; upkeepDue: string } | null; contracts: Contract[] };
}

const SHARES = [0.3, 0.4, 0.45, 0.5, 0.6];

export default function LabelScreen() {
  const gate = useGate();
  if (gate) return gate;
  return <Label />;
}

function Terms({ value, onChange }: { value: { bandShare: number; advance: string; weeks: number }; onChange: (v: { bandShare: number; advance: string; weeks: number }) => void }) {
  const { t } = useI18n();
  return (
    <View style={{ gap: space.sm }}>
      <Small>{t('labelShare')}</Small>
      <Choice options={SHARES.map((s) => ({ value: s, label: `%${Math.round(s * 100)}` }))} value={value.bandShare} onChange={(bandShare) => onChange({ ...value, bandShare })} />
      <Field label={t('labelAdvance', { max: money(LABEL_ADVANCE_MAX) })} value={value.advance} onChangeText={(advance) => onChange({ ...value, advance })} keyboardType="number-pad" />
      <Small>{t('labelWeeks')}</Small>
      <Choice options={[4, 12, 26, 52].map((w) => ({ value: w, label: t('weeksN', { n: w }) }))} value={value.weeks} onChange={(weeks) => onChange({ ...value, weeks })} />
    </View>
  );
}

function Label() {
  const { t } = useI18n();
  const c = useColors();
  const { run, pending } = useRun();
  const q = useQuery({ queryKey: ['labels'], queryFn: () => api.get<LabelsResponse>('/labels') });
  const [name, setName] = useState('');
  const [bandId, setBandId] = useState('');
  const [terms, setTerms] = useState({ bandShare: 0.45, advance: '0', weeks: 12 });
  const [counterFor, setCounterFor] = useState<number | null>(null);
  const mine = q.data?.mine;
  const body = () => ({ bandShare: terms.bandShare, advance: Math.max(0, Math.floor(Number(terms.advance) || 0)), weeks: terms.weeks });
  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('labelTitle') }} />
      <Body color={c.inkSoft} style={{ marginTop: space.lg }}>{t('labelIntro', { min: Math.round(LABEL_BAND_SHARE_RANGE[0] * 100), max: Math.round(LABEL_BAND_SHARE_RANGE[1] * 100) })}</Body>

      {mine?.contracts.length ? (
        <>
          <Heading>{t('contracts')}</Heading>
          {mine.contracts.map((k) => (
            <Card key={k.id} style={{ marginBottom: space.sm }}>
              <Strong>{k.side === 'label' ? k.band.name : k.label}</Strong>
              <Small>{t('contractTerms', { share: Math.round(k.bandShare * 100), advance: money(k.advance), weeks: k.weeks })}</Small>
              <Small>{t(`contract_${k.status}` as StringKey)}</Small>
              {k.status === 'active' && k.advance > 0 ? <Small>{t('contractRecouped', { a: money(k.recouped), b: money(k.advance) })}</Small> : null}
              {k.myTurn ? (
                <>
                  <Row style={{ marginTop: space.sm }}>
                    <Button small title={t('accept')} disabled={pending} onPress={() => run(() => api.post(`/contracts/${k.id}/accept`), { invalidate: ['labels', 'me'] })} />
                    <Button small variant="secondary" title={t('counterOffer')} onPress={() => setCounterFor(counterFor === k.id ? null : k.id)} />
                    <Button small variant="ghost" title={t('decline')} disabled={pending} onPress={() => run(() => api.post(`/contracts/${k.id}/decline`), { invalidate: ['labels'] })} />
                  </Row>
                  {counterFor === k.id ? (
                    <View style={{ marginTop: space.sm }}>
                      <Terms value={terms} onChange={setTerms} />
                      <Button small title={t('sendCounter')} disabled={pending} onPress={() => run(() => api.post(`/contracts/${k.id}/counter`, body()), { invalidate: ['labels'] })} />
                    </View>
                  ) : null}
                </>
              ) : null}
            </Card>
          ))}
        </>
      ) : null}

      {mine?.label ? (
        <>
          <Heading>{mine.label.name}</Heading>
          <Card>
            <Body>{t('labelTill', { money: money(mine.label.till) })}</Body>
            <Small>{t('labelRevenue', { money: money(mine.label.totalRevenue) })}</Small>
          </Card>
          <Heading>{t('labelOffer')}</Heading>
          <Field label={t('labelBandId')} value={bandId} onChangeText={setBandId} keyboardType="number-pad" />
          <Terms value={terms} onChange={setTerms} />
          <Button title={t('sendOffer')} loading={pending} disabled={!Number(bandId)} onPress={() => run(() => api.post('/labels/mine/offers', { bandId: Number(bandId), ...body() }), { invalidate: ['labels'] })} />
          <Row style={{ marginTop: space.md }}>
            <Button small variant="secondary" title={t('depositTill')} onPress={() => run(() => api.post('/labels/mine/till', { amount: 1000 }), { invalidate: ['labels', 'me'] })} />
            <Button small variant="secondary" title={t('withdrawTill')} onPress={() => run(() => api.post('/labels/mine/till', { amount: -1000 }), { invalidate: ['labels', 'me'] })} />
          </Row>
        </>
      ) : (
        <>
          <Heading>{t('foundLabel')}</Heading>
          <Small>{t('foundLabelHint', { money: money(LABEL_FOUND_PRICE) })}</Small>
          <Field label={t('labelName')} value={name} onChangeText={setName} maxLength={32} />
          <Button title={t('foundLabel')} loading={pending} disabled={name.trim().length < 2} onPress={() => run(() => api.post('/labels', { name: name.trim() }), { invalidate: ['labels', 'me'] })} />
        </>
      )}

      <Heading>{t('labelsList')}</Heading>
      {q.data?.labels.length ? (
        q.data.labels.map((l) => <Body key={l.id}>{`${l.name} · ${l.owner} · ${t('rosterN', { n: l.roster })}`}</Body>)
      ) : (
        <Empty text={t('noLabels')} />
      )}
      <Small style={{ marginTop: space.md }}>{t('labelWeeksRange', { a: LABEL_CONTRACT_WEEKS[0], b: LABEL_CONTRACT_WEEKS[1] })}</Small>
    </Screen>
  );
}
