// Nesiller: yetişkin bir çocukla devam etmek (mirası devret). Hem yaşayan karakter (isteyerek devir: emeklilik) hem de
// karakteri ölmüş kullanıcı (yeni karakter yerine mirasçı) bu ekranı kullanır. Bütün kurallar sunucuda; ekran yalnızca
// seçenekleri gösterir. Reşit olmayan çocuk seçilemez.

import {
  CITIES,
  GENRES,
  GENRE_NAMES,
  type Genre,
  type HeirsResponse,
  INSTRUMENTS,
  ITEM_BY_ID,
  type Instrument,
  ROLE_NAMES,
  defaultStartAllocation,
} from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Redirect, Stack, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { confirmThen } from '@/components/careers';
import { Body, Button, Card, Choice, ErrorView, Field, Heading, ListRow, Loading, Row, Screen, Small, Strong, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { itemDisplayName } from '@/lib/item-text';
import { useMe, useSession } from '@/lib/session';
import type { StringKey } from '@/lib/strings';
import { space, useColors } from '@/theme';

export default function Succession() {
  const { ready, token } = useSession();
  const me = useMe();
  if (!ready || me.isLoading) return <Loading />;
  if (!token) return <Redirect href="/login" />;
  if (!me.data) return <ErrorView error={me.error} onRetry={() => me.refetch()} />;
  return <SuccessionScreen />;
}

function SuccessionScreen() {
  const { t, p, err } = useI18n();
  const c = useColors();
  const qc = useQueryClient();
  const toast = useToast();
  const me = useMe();
  const { run, pending } = useRun();
  const heirs = useQuery({ queryKey: ['heirs'], queryFn: () => api.get<HeirsResponse>('/family/heirs') });
  const [childId, setChildId] = useState<number | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [cityId, setCityId] = useState<string | null>(null);
  const [instrument, setInstrument] = useState<Instrument>(me.data?.character?.mainInstrument ?? 'guitar');
  const [genre, setGenre] = useState<Genre>('rock');
  const [picks, setPicks] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  if (heirs.isLoading) return <Loading />;
  if (!heirs.data) return <ErrorView error={heirs.error} onRetry={() => heirs.refetch()} />;
  const h = heirs.data;
  const child = h.children.find((k) => k.childId === childId) ?? null;
  const city = cityId ?? me.data?.character?.cityId ?? 'istanbul';
  const heirName = (name ?? child?.defaultName ?? '').trim();
  const refresh = () => qc.invalidateQueries({ queryKey: ['heirs'] });
  const blockerText = (code: string, coParent?: string) =>
    code === 'consent_needed' ? t('heirBlock_consent_needed', { name: coParent ?? '' }) : t(`heirBlock_${code}` as StringKey);

  const submit = () =>
    confirmThen(t('successionTitle'), t('heirConfirmText', { name: h.predecessor.name, heir: heirName }), t('heirConfirm'), t('cancel'), async () => {
      setBusy(true);
      try {
        await api.post('/succession', {
          childId,
          name: heirName,
          cityId: city,
          mainInstrument: instrument,
          favoriteGenre: genre,
          startAttributes: defaultStartAllocation(instrument),
          heirlooms: picks,
        });
        toast(t('heirDone', { name: heirName }));
        qc.clear();
        router.replace('/');
      } catch (e) {
        toast(err(e), 'error');
      } finally {
        setBusy(false);
      }
    });

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('successionTitle') }} />
      <Body color={c.inkSoft} style={{ marginTop: space.lg }}>
        {h.mode === 'death' ? t('successionIntroDeath', { name: h.predecessor.name }) : t('successionIntro', { name: h.predecessor.name })}
      </Body>
      <Small style={{ marginTop: space.sm }}>{t('successionRules')}</Small>
      <Small style={{ marginTop: space.sm }}>{t('lineageFamily', { name: h.familyName, n: h.generation })}</Small>
      <Strong style={{ marginTop: space.md }}>
        {h.inheritance > 0 ? t('heirInheritance', { money: money(h.inheritance) }) : t('heirInheritanceNone')}
      </Strong>
      {h.blocker ? (
        <Card style={{ marginTop: space.md, borderColor: c.danger }}>
          <Body>{t('heirBlockedUntil', { reason: t(`err_${h.blocker}` as StringKey) })}</Body>
        </Card>
      ) : null}

      {h.incomingConsents.length ? (
        <>
          <Heading>{t('heirChildren')}</Heading>
          {h.incomingConsents.map((r) => (
            <Card key={r.childId} style={{ marginBottom: space.sm }}>
              <Body>{t('heirIncoming', { from: r.from, name: r.name })}</Body>
              <Row style={{ marginTop: space.sm }}>
                <Button title={t('heirApprove')} small disabled={pending} onPress={async () => { await run(() => api.post(`/family/children/${r.childId}/heir-consent`, { accept: true }), { invalidate: [] }); refresh(); }} />
                <Button title={t('heirRefuse')} small variant="secondary" disabled={pending} onPress={async () => { await run(() => api.post(`/family/children/${r.childId}/heir-consent`, { accept: false }), { invalidate: [] }); refresh(); }} />
              </Row>
            </Card>
          ))}
        </>
      ) : null}

      <Heading>{t('heirChildren')}</Heading>
      {h.children.length ? (
        h.children.map((k, i) => (
          <View key={k.childId}>
            <ListRow
              title={k.heirCharacterId ? t('childIsCharacter', { name: k.name }) : k.name}
              subtitle={`${t('heirChildLine', { age: k.age, stage: t(`childStage_${k.stage}` as StringKey) })}${k.blocker ? ` · ${blockerText(k.blocker, k.coParent?.name)}` : ''}`}
              onPress={k.heirCharacterId ? () => router.push(`/character/${k.heirCharacterId}`) : undefined}
              right={
                !k.blocker && !h.blocker ? (
                  <Button title={childId === k.childId ? t('heirPicked') : t('heirPick')} small variant={childId === k.childId ? 'primary' : 'secondary'} onPress={() => { setChildId(k.childId); setName(null); }} />
                ) : k.blocker === 'consent_needed' && !k.consentRequested ? (
                  <Button title={t('heirAskConsent')} small variant="secondary" disabled={pending} onPress={async () => { await run(() => api.post(`/family/children/${k.childId}/heir-request`), { invalidate: [], success: t('heirConsentRequested') }); refresh(); }} />
                ) : undefined
              }
              last={i === h.children.length - 1}
            />
            {k.consentGiven && k.coParent ? <Small>{t('heirConsentGiven', { name: k.coParent.name })}</Small> : null}
            {k.blocker === 'consent_needed' && k.consentRequested ? <Small>{t('heirConsentRequested')}</Small> : null}
          </View>
        ))
      ) : (
        <Body color={c.inkSoft}>{t('heirNoChildren')}</Body>
      )}

      {child ? (
        <>
          <Field label={t('heirName')} value={name ?? child.defaultName} onChangeText={setName} maxLength={24} autoCorrect={false} />

          <Heading>{t('startCity')}</Heading>
          <Choice options={CITIES.map((ct) => ({ value: ct.id, label: p(ct.name) }))} value={city} onChange={setCityId} />

          <Heading>{t('mainInstrument')}</Heading>
          <Choice options={INSTRUMENTS.map((x) => ({ value: x, label: p(ROLE_NAMES[x]) }))} value={instrument} onChange={setInstrument} />

          <Heading>{t('favoriteGenre')}</Heading>
          <Choice options={GENRES.map((g) => ({ value: g, label: p(GENRE_NAMES[g]) }))} value={genre} onChange={setGenre} />

          <Heading>{t('heirlooms', { n: h.heirloomLimit })}</Heading>
          <Small style={{ marginBottom: space.sm }}>{t('heirloomsHint')}</Small>
          {h.heirlooms.length ? (
            h.heirlooms.map((it, i) => {
              const def = ITEM_BY_ID[it.itemId];
              const on = picks.includes(it.id);
              return (
                <ListRow
                  key={it.id}
                  title={def ? itemDisplayName(def, p, it) : it.itemId}
                  right={
                    <Button
                      title={on ? '✓' : '+'}
                      small
                      variant={on ? 'primary' : 'secondary'}
                      disabled={!on && picks.length >= h.heirloomLimit}
                      accessibilityLabel={def ? itemDisplayName(def, p, it) : it.itemId}
                      onPress={() => setPicks(on ? picks.filter((x) => x !== it.id) : [...picks, it.id])}
                    />
                  }
                  last={i === h.heirlooms.length - 1}
                />
              );
            })
          ) : (
            <Body color={c.inkSoft}>{t('heirNoHeirlooms')}</Body>
          )}

          <Button title={t('heirConfirm')} variant="danger" onPress={submit} loading={busy} disabled={!!h.blocker || heirName.length < 3} style={{ marginTop: space.xxl }} />
        </>
      ) : null}
    </Screen>
  );
}
