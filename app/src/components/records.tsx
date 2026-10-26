// Kayıt stüdyosu ve yayın satırı.

import {
  CITY_BY_ID,
  GOLD_UNITS,
  LOCATION_BY_ID,
  PLATINUM_UNITS,
  RECORDING_PRICE_PER_HOUR,
  RECORD_HOURS,
  RELEASE_NAMES,
  DIRECTOR_NAMES,
  PRODUCERS,
  PRODUCER_NAMES,
  type ProducerTier,
  VIDEO_DIRECTORS,
  VIDEO_HOURS,
  VIDEO_PRICE,
  type VideoDirector,
  type ReleaseDto,
  priceFor,
  tierName,
} from '@rifftown/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { HoursAction } from '@/components/action-form';
import { Body, Button, Choice, Empty, Heading, ListRow, Small } from '@/components/ui';
import { money } from '@/lib/format';
import { useBand } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { space, useColors } from '@/theme';

export function RecordingStudio({ locationId }: { locationId: string }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const band = useBand();
  const city = CITY_BY_ID[LOCATION_BY_ID[locationId].cityId];
  const songs = band.data?.songs ?? [];
  const [songId, setSongId] = useState<number | null>(null);
  const [producer, setProducer] = useState<ProducerTier | ''>('');
  const [director, setDirector] = useState<VideoDirector>('none');
  const isLeader = band.data?.leaderId !== undefined && band.data.members.some((m) => m.isLeader);
  const selected = songId ?? songs[0]?.id ?? null;
  const releasesButton = (
    <Button title={t('releasesAndCharts')} variant="secondary" onPress={() => router.push('/releases')} style={{ marginTop: space.xl }} />
  );
  if (!band.data) {
    return (
      <View style={{ marginTop: space.lg }}>
        <Body color={c.inkSoft}>{t('recordIntro')}</Body>
        <Empty text={t('err_no_band')} action={<Button title={t('createBand')} variant="secondary" onPress={() => router.navigate('/band')} />} />
      </View>
    );
  }
  if (!songs.length) return <Empty text={t('noBandSongs')} action={releasesButton} />;
  return (
    <View style={{ marginTop: space.lg }}>
      <Body color={c.inkSoft}>{t('recordIntro')}</Body>
      <Heading>{t('repertoire')}</Heading>
      <Choice
        options={songs.map((s) => ({
          value: s.id,
          label: s.title,
          hint: s.recordingQuality != null ? t('recordedAs', { q: tierName('quality', s.recordingQuality, lang) }) : t('notRecorded'),
        }))}
        value={selected}
        onChange={setSongId}
      />
      <View style={{ height: space.xl }} />
      <Heading>{t('producer')}</Heading>
      <Choice
        options={[
          { value: '' as ProducerTier | '', label: t('producerBand') },
          ...(Object.keys(PRODUCERS) as ProducerTier[]).map((k) => ({ value: k as ProducerTier | '', label: p(PRODUCER_NAMES[k]), hint: money(priceFor(PRODUCERS[k].fee, city, 1)) })),
        ]}
        value={producer}
        onChange={setProducer}
      />
      <Small style={{ marginVertical: space.sm }}>{t('producerHint')}</Small>
      <HoursAction
        options={[RECORD_HOURS]}
        build={() => ({ kind: 'record', songId: selected!, locationId, producer: producer || null })}
        price={(h) => priceFor(RECORDING_PRICE_PER_HOUR, city, h) + (producer ? priceFor(PRODUCERS[producer].fee, city, 1) : 0)}
        label={t('recordHere')}
        disabled={!selected}
      />
      {isLeader && songs.find((s) => s.id === selected)?.recordingQuality != null ? (
        <>
          <Heading>{t('musicVideo')}</Heading>
          <Small style={{ marginBottom: space.sm }}>{t('musicVideoHint')}</Small>
          <Choice
            options={(Object.keys(VIDEO_DIRECTORS) as VideoDirector[]).map((k) => ({ value: k, label: p(DIRECTOR_NAMES[k]), hint: money(priceFor(VIDEO_DIRECTORS[k].fee, city, 1)) }))}
            value={director}
            onChange={setDirector}
          />
          <View style={{ height: space.md }} />
          <HoursAction
            options={[VIDEO_HOURS]}
            build={() => ({ kind: 'video', songId: selected!, locationId, director })}
            price={() => priceFor(VIDEO_PRICE, city, 1) + priceFor(VIDEO_DIRECTORS[director].fee, city, 1)}
            label={t('shootVideo')}
            disabled={!selected}
          />
        </>
      ) : null}
      {releasesButton}
    </View>
  );
}

export function ReleaseRow({ r, last, showBand = false }: { r: ReleaseDto; last?: boolean; showBand?: boolean }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const badge = r.totalUnits >= PLATINUM_UNITS ? t('platinumRecord') : r.totalUnits >= GOLD_UNITS ? t('goldRecord') : null;
  const meta = [
    t('releaseMeta', { kind: p(RELEASE_NAMES[r.kind]), q: tierName('quality', r.quality, lang), weeks: r.weeksOnSale }),
    t('releaseSold', { n: r.totalUnits.toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR'), money: money(r.totalRevenue) }),
    r.bestPosition ? t('bestChartPos', { n: r.bestPosition }) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <ListRow
      title={showBand ? `${r.bandName}: ${r.title}` : r.title}
      subtitle={meta}
      right={badge ? <Small color={c.pink}>{badge}</Small> : undefined}
      last={last}
    />
  );
}
