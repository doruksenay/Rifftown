import { CITY_BY_ID, type GigDto, LOCATION_BY_ID, ROLE_NAMES } from '@rifftown/shared';
import { useQuery } from '@tanstack/react-query';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { TierText } from '@/components/tier';
import { fameChangeKey } from '@/lib/fame-text';
import { Body, Button, Card, ErrorView, Heading, ListRow, Loading, Screen, Small } from '@/components/ui';
import { useGate } from '@/components/gate';
import { api } from '@/lib/api';
import { dateTime, duration, money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { fonts, space, type, useColors } from '@/theme';

export default function GigScreen() {
  const gate = useGate();
  if (gate) return gate;
  return <GigScreenScreen />;
}

function GigScreenScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, p, locale, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const { run, pending } = useRun();
  const [sharing, setSharing] = useState(false);
  const q = useQuery({
    queryKey: ['gig', id],
    queryFn: () => api.get<{ gig: GigDto; songs: { id: number; title: string; quality: number }[] }>(`/gigs/${id}`),
    refetchInterval: (query) => (query.state.data?.gig.status === 'scheduled' ? 10000 : false),
  });
  if (q.isLoading) return <Loading />;
  if (!q.data) return <ErrorView error={q.error} onRetry={() => q.refetch()} />;
  const { gig, songs } = q.data;
  const loc = LOCATION_BY_ID[gig.locationId];
  const isLeader = me.data?.band?.id === gig.bandId && me.data?.band?.isLeader;
  const r = gig.result;

  // Eleştiriyi sohbette paylaş: grubun üyesiysen grup sohbetine, değilsen bulunduğun şehrin sohbetine
  const share = async () => {
    if (!r?.review) return;
    const myBand = me.data?.band?.id === gig.bandId;
    const channel = myBand ? `band:${gig.bandId}` : me.data?.character?.cityId ? `city:${me.data.character.cityId}` : null;
    if (!channel) return;
    setSharing(true);
    await run(() => api.post('/chat', { channel, text: `${gig.bandName}, ${p(loc.name)}: ${r.review![lang]}`.slice(0, 300) }), {
      success: t('shared'),
      invalidate: [],
    });
    setSharing(false);
  };

  const cancel = () => {
    const go = async () => {
      const ok = await run(() => api.del(`/gigs/${gig.id}`), { invalidate: ['band', 'me', 'gig', 'city'] });
      if (ok) router.back();
    };
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(t('cancelGigConfirm'))) go();
      return;
    }
    Alert.alert(t('cancelGig'), t('cancelGigConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('confirm'), style: 'destructive', onPress: go },
    ]);
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: p(loc.name) }} />
      <View style={{ paddingTop: space.lg }}>
        <Body style={{ fontFamily: fonts.display, fontSize: type.display, lineHeight: type.display * 1.15 }}>{gig.bandName}</Body>
        <Small>{p(CITY_BY_ID[gig.cityId].name)}</Small>
        <Small>{dateTime(gig.startsAt, locale)}</Small>
      </View>

      {gig.status === 'scheduled' ? (
        <Card style={{ marginTop: space.lg }}>
          <Body>{t('startsIn', { time: duration(new Date(gig.startsAt).getTime() - Date.now(), lang) })}</Body>
          {gig.sessionRoles.length ? (
            <Small>{`${t('sessionMusicians')}: ${gig.sessionRoles.map((r0) => p(ROLE_NAMES[r0])).join(', ')}`}</Small>
          ) : null}
        </Card>
      ) : null}

      {r ? (
        <>
          <Heading>{t('gigResult')}</Heading>
          <TierText scale="quality" value={r.quality} size="hero" />
          {r.review ? (
            <Body style={{ marginTop: space.md, fontFamily: fonts.bodyMedium, fontSize: type.lead, lineHeight: type.lead * 1.4 }}>
              {r.review[lang]}
            </Body>
          ) : null}
          <View style={{ marginTop: space.lg, gap: 2 }}>
            <Body>{t('attendance', { n: r.attendance })}</Body>
            <Body>{t('revenue', { money: money(r.revenue) })}</Body>
            <Body>{t('perMember', { money: money(r.perMember) })}</Body>
            <Body color={r.fameDelta >= 0 ? c.blue : c.pink}>{t(fameChangeKey(r.fameDelta))}</Body>
          </View>
          <Small style={{ marginTop: space.sm }}>{t('present', { a: r.presentCount, b: r.memberCount })}</Small>
          {r.review ? (
            <Button title={t('shareToChat')} variant="secondary" small style={{ alignSelf: 'flex-start', marginTop: space.lg }} loading={sharing} onPress={share} />
          ) : null}
        </>
      ) : null}

      <Heading>{t('setlist')}</Heading>
      {gig.setlist.map((sid, i) => {
        const s = songs.find((x) => x.id === sid);
        return (
          <ListRow
            key={sid}
            left={<Small>{String(i + 1)}</Small>}
            title={s?.title ?? '—'}
            subtitle={r?.bestSongId === sid ? t('songOfNight') : undefined}
            right={s ? <TierText scale="quality" value={s.quality} /> : undefined}
            last={i === gig.setlist.length - 1}
          />
        );
      })}

      {isLeader && gig.status === 'scheduled' ? (
        <Button title={t('cancelGig')} variant="danger" style={{ marginTop: space.xl }} loading={pending} onPress={cancel} />
      ) : null}
    </Screen>
  );
}
