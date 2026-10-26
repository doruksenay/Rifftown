import { GENRES, GENRE_NAMES, type Genre, TEMPOS, TEMPO_NAMES, type Tempo, WRITE_SONG_HOURS, energyAfter, subgenresOf } from '@rifftown/shared';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { TierMeter } from '@/components/tier';
import { Body, Button, Choice, Field, Heading, Screen, Small } from '@/components/ui';
import { useGate } from '@/components/gate';
import { api } from '@/lib/api';
import { realDuration } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useGameSpeed, useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

export default function WriteSong() {
  const gate = useGate();
  if (gate) return gate;
  return <WriteSongScreen />;
}

function WriteSongScreen() {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const speed = useGameSpeed();
  const { run, pending } = useRun();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<Genre>((me.data?.band?.genre as Genre) ?? 'rock');
  const [subgenre, setSubgenre] = useState<string>('');
  const [tempo, setTempo] = useState<Tempo>('mid');
  const subs = subgenresOf(genre);
  const pickGenre = (g: Genre) => {
    setGenre(g);
    setSubgenre('');
  };

  const tooTired = energyAfter('write_song', WRITE_SONG_HOURS, me.data?.character?.energy ?? 100) < 0;
  const submit = async () => {
    const r = await run(() => api.post('/actions', { kind: 'write_song', title: title.trim(), genre, subgenre: subgenre || null, tempo }));
    if (r) router.navigate('/');
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('writeSong') }} />
      <Body color={c.inkSoft} style={{ marginVertical: space.lg }}>
        {t('writeIntro')}
      </Body>
      <Field label={t('songTitle')} value={title} onChangeText={setTitle} maxLength={40} />
      <Heading style={{ marginTop: 0 }}>{t('genre')}</Heading>
      <Choice options={GENRES.map((g) => ({ value: g, label: p(GENRE_NAMES[g]) }))} value={genre} onChange={pickGenre} />
      <Heading>{t('subgenre')}</Heading>
      <Choice
        options={[{ value: '', label: t('subgenreNone') }, ...subs.map((s) => ({ value: s.id, label: p(s.name), hint: p(TEMPO_NAMES[s.tempo]) }))]}
        value={subgenre}
        onChange={(v) => {
          setSubgenre(v);
          const def = subs.find((s) => s.id === v);
          if (def) setTempo(def.tempo);
        }}
      />
      <Heading>{t('tempo')}</Heading>
      <Choice options={TEMPOS.map((x) => ({ value: x, label: p(TEMPO_NAMES[x]) }))} value={tempo} onChange={setTempo} />
      <Small style={{ marginTop: space.sm }}>{t('subgenreHint')}</Small>
      <Small>{t('songFatigueHint')}</Small>
      <View style={{ marginTop: space.lg }}>
        <TierMeter label={t('inspiration')} scale="inspiration" value={me.data?.character?.inspiration ?? 0} whole />
        <Small>{t('inspirationHint')}</Small>
      </View>
      <Small style={{ marginTop: space.md }}>{t('takesRealTime', { time: realDuration(WRITE_SONG_HOURS, speed, lang) })}</Small>
      {tooTired ? <Small color={c.danger}>{t('tooTiredHint')}</Small> : null}
      <Button title={t('writeSong')} onPress={submit} loading={pending} disabled={!title.trim() || !!me.data?.action || tooTired} style={{ marginTop: space.lg }} />
    </Screen>
  );
}
