import { GENRES, GENRE_NAMES, type Genre, WRITE_SONG_HOURS } from '@rifftown/shared';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
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

  const submit = async () => {
    const r = await run(() => api.post('/actions', { kind: 'write_song', title: title.trim(), genre }));
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
      <Choice options={GENRES.map((g) => ({ value: g, label: p(GENRE_NAMES[g]) }))} value={genre} onChange={setGenre} />
      <Small style={{ marginTop: space.lg }}>{t('takesRealTime', { time: realDuration(WRITE_SONG_HOURS, speed, lang) })}</Small>
      <Button title={t('writeSong')} onPress={submit} loading={pending} disabled={!title.trim() || !!me.data?.action} style={{ marginTop: space.lg }} />
    </Screen>
  );
}
