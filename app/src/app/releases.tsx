// Grubun yayınları ve yeni single / albüm çıkarma.

import { RELEASE_NAMES, RELEASE_RULES, type ReleaseKind, tierName } from '@rifftown/shared';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { useGate } from '@/components/gate';
import { ReleaseRow } from '@/components/records';
import { Body, Button, Choice, Empty, Field, Heading, ListRow, Screen, Small } from '@/components/ui';
import { api } from '@/lib/api';
import { duration, money } from '@/lib/format';
import { useBand, useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

export default function Releases() {
  const gate = useGate();
  if (gate) return gate;
  return <ReleasesScreen />;
}

function ReleasesScreen() {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const band = useBand();
  const { run, pending } = useRun();
  const [kind, setKind] = useState<ReleaseKind>('single');
  const [title, setTitle] = useState('');
  const [picked, setPicked] = useState<number[]>([]);

  const b = band.data;
  const header = <Stack.Screen options={{ title: t('releases') }} />;
  if (!b) {
    return (
      <Screen edges={[]}>
        {header}
        <Empty text={t('err_no_band')} action={<Button title={t('createBand')} variant="secondary" onPress={() => router.navigate('/band')} />} />
      </Screen>
    );
  }
  const isLeader = b.leaderId === me.data?.character?.id;
  const rules = RELEASE_RULES[kind];
  const recorded = b.songs.filter((s) => s.recordingQuality != null);
  const waitUntil = b.nextReleaseAt[kind];
  const toggle = (id: number) => setPicked((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
  const valid =
    title.trim().length >= 1 && picked.length >= rules.minSongs && picked.length <= rules.maxSongs && !waitUntil && (me.data?.character?.money ?? 0) >= rules.pressingCost;

  return (
    <Screen edges={[]} refreshing={<RefreshControl refreshing={band.isRefetching} onRefresh={() => { band.refetch(); }} tintColor={c.pink} />}>
      {header}
      <Button title={t('seeCharts')} variant="secondary" style={{ marginTop: space.lg }} onPress={() => router.push('/charts')} />

      <Heading>{t('releases')}</Heading>
      {b.releases.length ? b.releases.map((r, i) => <ReleaseRow key={r.id} r={r} last={i === b.releases.length - 1} />) : <Empty text={t('noReleases')} />}

      <Heading>{t('newRelease')}</Heading>
      {!isLeader ? (
        <Small>{t('onlyLeaderReleases')}</Small>
      ) : (
        <View>
          <Choice<ReleaseKind>
            options={(['single', 'album'] as const).map((k) => ({ value: k, label: p(RELEASE_NAMES[k]) }))}
            value={kind}
            onChange={(k) => {
              setKind(k);
              setPicked([]);
            }}
          />
          <Small style={{ marginTop: space.sm }}>
            {t('releaseRules', { min: rules.minSongs, max: rules.maxSongs, cost: money(rules.pressingCost), weeks: rules.weeks })}
          </Small>
          {waitUntil ? (
            <Small color={c.danger}>{t('nextReleaseIn', { kind: p(RELEASE_NAMES[kind]), time: duration(new Date(waitUntil).getTime() - Date.now(), lang) })}</Small>
          ) : null}
          <View style={{ height: space.lg }} />
          <Field label={t('releaseTitle')} value={title} onChangeText={setTitle} maxLength={40} />
          <Small color={c.ink} style={{ marginBottom: space.xs }}>{t('chooseTracks', { n: picked.length })}</Small>
          {recorded.length ? (
            recorded.map((s, i) => (
              <ListRow
                key={s.id}
                title={s.title}
                subtitle={t('recordedAs', { q: tierName('quality', s.recordingQuality!, lang) })}
                right={<Body color={picked.includes(s.id) ? c.pink : c.inkSoft}>{picked.includes(s.id) ? '●' : '○'}</Body>}
                onPress={() => toggle(s.id)}
                last={i === recorded.length - 1}
              />
            ))
          ) : (
            <Empty text={t('noRecordedSongs')} />
          )}
          <Button
            title={`${t('publish')} (${money(rules.pressingCost)})`}
            style={{ marginTop: space.lg }}
            disabled={!valid}
            loading={pending}
            onPress={async () => {
              const r = await run(() => api.post('/releases', { kind, title: title.trim(), songIds: picked }), {
                success: t('releasedOk', { title: title.trim() }),
                invalidate: ['band', 'me'],
              });
              if (r) {
                setTitle('');
                setPicked([]);
              }
            }}
          />
        </View>
      )}
    </Screen>
  );
}
