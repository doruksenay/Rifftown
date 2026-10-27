import {
  BAND_NAME_RE,
  CITY_BY_ID,
  GENRES,
  GENRE_NAMES,
  type Genre,
  INSTRUMENTS,
  type Instrument,
  LOCATION_BY_ID,
  ROLE_NAMES,
  tierName,
} from '@rifftown/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, RefreshControl, View } from 'react-native';
import {
  Avatar,
  Body,
  Button,
  Choice,
  Empty,
  Field,
  Heading,
  ListRow,
  Row,
  Screen,
  ScreenHeader,
  Small,
} from '@/components/ui';
import { api } from '@/lib/api';
import { dateTime, money } from '@/lib/format';
import { fameChangeKey } from '@/lib/fame-text';
import { ReleaseRow } from '@/components/records';
import { VenueProgress } from '@/components/progress';
import { TierText } from '@/components/tier';
import { useBand, useInvites, useRun, useSongs } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { space, useColors } from '@/theme';
import { PlaceIcon } from '@/components/art/place';

function confirmThen(title: string, message: string, ok: string, cancel: string, fn: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(message)) fn();
    return;
  }
  Alert.alert(title, message, [
    { text: cancel, style: 'cancel' },
    { text: ok, style: 'destructive', onPress: fn },
  ]);
}

export default function BandTab() {
  const band = useBand();
  const c = useColors();
  if (band.isLoading) return <Screen><View /></Screen>;
  return (
    <Screen refreshing={<RefreshControl refreshing={band.isRefetching} onRefresh={() => { band.refetch(); }} tintColor={c.pink} />}>
      {band.data ? <MyBand /> : <NoBand />}
    </Screen>
  );
}

function NoBand() {
  const { t, p } = useI18n();
  const c = useColors();
  const me = useMe();
  const invites = useInvites();
  const { run, pending } = useRun();
  const [name, setName] = useState('');
  const [genre, setGenre] = useState<Genre>('rock');
  const [role, setRole] = useState<Instrument>(me.data?.character?.mainInstrument ?? 'guitar');
  const valid = BAND_NAME_RE.test(name.trim());

  return (
    <>
      <ScreenHeader title={t('noBand')} />
      <Body color={c.inkSoft}>{t('noBandIntro')}</Body>

      {invites.data?.length ? (
        <>
          <Heading>{t('invitesForYou')}</Heading>
          {invites.data.map((inv, i) => (
            <ListRow
              key={inv.id}
              title={inv.bandName}
              subtitle={`${p(GENRE_NAMES[inv.genre])}, ${p(ROLE_NAMES[inv.role])}`}
              right={
                <Row>
                  <Button title={t('decline')} small variant="ghost" disabled={pending} onPress={() => run(() => api.post(`/invites/${inv.id}/decline`), { invalidate: ['invites', 'me'] })} />
                  <Button title={t('accept')} small disabled={pending} onPress={() => run(() => api.post(`/invites/${inv.id}/accept`), { invalidate: ['invites', 'me', 'band', 'songs'] })} />
                </Row>
              }
              last={i === invites.data!.length - 1}
            />
          ))}
        </>
      ) : null}

      <Heading>{t('createBand')}</Heading>
      <Field label={t('bandName')} value={name} onChangeText={setName} maxLength={30} />
      <Small color={c.ink} style={{ marginBottom: space.xs }}>{t('genre')}</Small>
      <Choice options={GENRES.map((g) => ({ value: g, label: p(GENRE_NAMES[g]) }))} value={genre} onChange={setGenre} />
      <Small color={c.ink} style={{ marginTop: space.lg, marginBottom: space.xs }}>{t('yourRole')}</Small>
      <Choice options={INSTRUMENTS.map((i) => ({ value: i, label: p(ROLE_NAMES[i]) }))} value={role} onChange={setRole} />
      <Button
        title={t('createBand')}
        style={{ marginTop: space.xl }}
        disabled={!valid}
        loading={pending}
        onPress={() => run(() => api.post('/bands', { name: name.trim(), genre, role }), { invalidate: ['band', 'me', 'songs'] })}
      />
    </>
  );
}

function MyBand() {
  const { t, p, locale, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const band = useBand().data!;
  const songs = useSongs();
  const { run, pending } = useRun();
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<Instrument>('drums');
  const myId = me.data!.character!.id;
  const isLeader = band.leaderId === myId;
  const myRole = band.members.find((m) => m.characterId === myId)?.role;
  const notInBand = (songs.data ?? []).filter((s) => s.authorId === myId && !s.inBand);
  const fame = Object.entries(band.fame)
    .filter(([, f]) => f > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <>
      <ScreenHeader
        title={band.name}
        subtitle={p(GENRE_NAMES[band.genre])}
        right={<Button title={t('bandChat')} small variant="secondary" onPress={() => router.navigate({ pathname: '/chat', params: { channel: 'band' } })} />}
      />

      <Heading>{t('members')}</Heading>
      {band.members.map((m, i) => (
        <ListRow
          key={m.characterId}
          left={<Avatar name={m.name} color={m.avatarColor} uri={m.avatarUrl} />}
          title={m.name}
          subtitle={`${p(ROLE_NAMES[m.role])}: ${tierName('skill', m.skill, lang)}, ${m.cityId ? t('awayFrom', { city: p(CITY_BY_ID[m.cityId].name) }) : t('onTheRoad')}${m.isLeader ? `, ${t('leader')}` : ''}`}
          onPress={() => router.push(`/character/${m.characterId}`)}
          right={
            isLeader && m.characterId !== myId ? (
              <Button
                title={t('kick')}
                small
                variant="ghost"
                onPress={() =>
                  confirmThen(t('kick'), `${t('kick')}: ${m.name}? ${t('leaveBandFameNote')}`, t('confirm'), t('cancel'), () =>
                    run(() => api.post('/bands/mine/kick', { characterId: m.characterId }), { invalidate: ['band'] }),
                  )
                }
              />
            ) : undefined
          }
          last={i === band.members.length - 1}
        />
      ))}

      {myRole ? (
        <>
          <Small color={c.ink} style={{ marginTop: space.lg, marginBottom: space.xs }}>{t('yourRole')}</Small>
          <Choice
            options={INSTRUMENTS.map((i) => ({ value: i, label: p(ROLE_NAMES[i]) }))}
            value={myRole}
            onChange={(role) => run(() => api.post('/bands/mine/role', { role }), { invalidate: ['band', 'me'] })}
          />
        </>
      ) : null}

      {isLeader ? (
        <>
          <Heading>{t('invite')}</Heading>
          <Field label={t('inviteName')} value={inviteName} onChangeText={setInviteName} autoCorrect={false} autoCapitalize="words" />
          <Choice options={INSTRUMENTS.map((i) => ({ value: i, label: p(ROLE_NAMES[i]) }))} value={inviteRole} onChange={setInviteRole} />
          <Button
            title={t('invite')}
            variant="secondary"
            style={{ marginTop: space.md }}
            disabled={!inviteName.trim() || pending}
            onPress={async () => {
              const r = await run(() => api.post('/bands/mine/invites', { name: inviteName.trim(), role: inviteRole }), {
                success: t('invited'),
                invalidate: ['band'],
              });
              if (r) setInviteName('');
            }}
          />
          {band.pendingInvites.length ? (
            <>
              <Small style={{ marginTop: space.lg }}>{t('pendingSent')}</Small>
              {band.pendingInvites.map((inv, i) => (
                <ListRow
                  key={inv.id}
                  title={inv.name}
                  right={<Button title={t('cancel')} small variant="ghost" onPress={() => run(() => api.del(`/bands/mine/invites/${inv.id}`), { invalidate: ['band'] })} />}
                  last={i === band.pendingInvites.length - 1}
                />
              ))}
            </>
          ) : null}
        </>
      ) : null}

      <Heading>{t('repertoire')}</Heading>
      {band.songs.length ? (
        band.songs.map((s, i) => (
          <ListRow
            key={s.id}
            title={s.title}
            subtitle={`${t('songMeta', { q: tierName('quality', s.quality, lang), f: tierName('familiarity', s.myFamiliarity, lang) })} ${s.authorName}${s.recordingQuality != null ? `, ${t('recordedAs', { q: tierName('quality', s.recordingQuality, lang) })}` : ''}`}
            right={
              s.authorId === myId || isLeader ? (
                <Button title="−" small variant="ghost" accessibilityLabel={t('removeFromBand')} onPress={() => run(() => api.del(`/bands/mine/songs/${s.id}`), { invalidate: ['band', 'songs'] })} />
              ) : undefined
            }
            last={i === band.songs.length - 1}
          />
        ))
      ) : (
        <Empty text={t('noRepertoire')} action={<Button title={t('writeSong')} variant="secondary" onPress={() => router.push('/write-song')} />} />
      )}
      {notInBand.length ? (
        <View style={{ marginTop: space.md }}>
          {notInBand.map((s) => (
            <ListRow
              key={s.id}
              title={s.title}
              subtitle={t('qualityIs', { q: tierName('quality', s.quality, lang) })}
              right={<Button title={t('addToBand')} small variant="secondary" onPress={() => run(() => api.post('/bands/mine/songs', { songId: s.id }), { invalidate: ['band', 'songs'] })} />}
              last
            />
          ))}
        </View>
      ) : null}

      <Heading>{t('releases')}</Heading>
      {band.releases.length ? (
        band.releases.slice(0, 3).map((r, i, arr) => <ReleaseRow key={r.id} r={r} last={i === arr.length - 1} />)
      ) : (
        <Empty text={t('noReleases')} />
      )}
      <Row style={{ marginTop: space.sm }}>
        <Button title={t('releases')} variant="secondary" onPress={() => router.push('/releases')} style={{ flex: 1 }} />
        <Button title={t('charts')} variant="secondary" onPress={() => router.push('/charts')} style={{ flex: 1 }} />
      </Row>
      <Row style={{ marginTop: space.sm }}>
        <Button title={t('tourTitle')} variant="secondary" onPress={() => router.push('/tour')} style={{ flex: 1 }} />
        <Button title={t('labelTitle')} variant="secondary" onPress={() => router.push('/label')} style={{ flex: 1 }} />
      </Row>

      <Heading>{t('upcomingGigs')}</Heading>
      {band.upcomingGigs.length ? (
        band.upcomingGigs.map((g, i) => (
          <ListRow
            key={g.id}
            left={LOCATION_BY_ID[g.locationId] ? <PlaceIcon type={LOCATION_BY_ID[g.locationId].type} size={34} /> : undefined}
            title={p(LOCATION_BY_ID[g.locationId].name)}
            subtitle={`${p(CITY_BY_ID[g.cityId].name)}, ${dateTime(g.startsAt, locale)}`}
            onPress={() => router.push(`/gig/${g.id}`)}
            right="›"
            last={i === band.upcomingGigs.length - 1}
          />
        ))
      ) : (
        <Empty text={t('noBandGigs')} action={<Button title={t('tabCity')} variant="secondary" onPress={() => router.navigate('/city')} />} />
      )}

      <Heading>{t('fame')}</Heading>
      {fame.length ? (
        fame.map(([cityId, f], i) => (
          <View key={cityId}>
            <ListRow
              title={p(CITY_BY_ID[cityId].name)}
              subtitle={band.press?.[cityId] !== undefined ? tierName('press', band.press[cityId], lang) : undefined}
              right={<TierText scale="fame" value={f} />}
              last
            />
            <VenueProgress fame={f} />
            {i === fame.length - 1 ? null : <View style={{ height: 1, backgroundColor: c.line }} />}
          </View>
        ))
      ) : (
        <Empty text={t('noFame')} />
      )}

      {band.pastGigs.length ? (
        <>
          <Heading>{t('pastGigs')}</Heading>
          {band.pastGigs.map((g, i) => (
            <ListRow
              key={g.id}
              title={p(LOCATION_BY_ID[g.locationId].name)}
              subtitle={
                g.result
                  ? `${t('attendance', { n: g.result.attendance })}, ${tierName('quality', g.result.quality, lang)}. ${t(fameChangeKey(g.result.fameDelta))}.`
                  : undefined
              }
              right={g.result ? money(g.result.perMember) : undefined}
              onPress={() => router.push(`/gig/${g.id}`)}
              last={i === band.pastGigs.length - 1}
            />
          ))}
        </>
      ) : null}

      <Button
        title={t('leaveBand')}
        variant="ghost"
        style={{ marginTop: space.xxl, alignSelf: 'flex-start', paddingHorizontal: 0 }}
        onPress={() =>
          confirmThen(t('leaveBand'), `${t('leaveConfirm')} ${t('leaveBandFameNote')}`, t('confirm'), t('cancel'), () =>
            run(() => api.post('/bands/mine/leave'), { invalidate: ['band', 'me', 'songs'] }),
          )
        }
      />
    </>
  );
}
