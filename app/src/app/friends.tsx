// Arkadaş listesi ve bekleyen istekler.

import { CITY_BY_ID, type FriendsResponse, type PersonDto, tierName } from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import { useGate } from '@/components/gate';
import { Avatar, Button, Empty, ErrorView, Heading, ListRow, Loading, Row, Screen } from '@/components/ui';
import { api } from '@/lib/api';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import type { StringKey } from '@/lib/strings';

export default function Friends() {
  const gate = useGate();
  if (gate) return gate;
  return <FriendsScreen />;
}

function FriendsScreen() {
  const { t, p, lang } = useI18n();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const q = useQuery({ queryKey: ['friends'], queryFn: () => api.get<FriendsResponse>('/friends') });
  if (q.isLoading) return <Loading />;
  if (!q.data) return <ErrorView error={q.error} onRetry={() => q.refetch()} />;
  const { friends, incoming, outgoing } = q.data;
  const refresh = () => qc.invalidateQueries({ queryKey: ['friends'] });
  const where = (x: PersonDto) => (x.cityId && CITY_BY_ID[x.cityId] ? p(CITY_BY_ID[x.cityId].name) : t('onTheRoad'));
  const avatar = (x: PersonDto) => <Avatar name={x.name} color={x.avatarColor} uri={x.avatarUrl} size={36} />;
  const open = (x: PersonDto) => router.push(`/character/${x.characterId}`);

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('friendsTitle') }} />
      {incoming.length ? (
        <>
          <Heading>{t('friendRequests')}</Heading>
          {incoming.map((x, i) => (
            <ListRow
              key={x.characterId}
              left={avatar(x)}
              title={x.name}
              subtitle={where(x)}
              onPress={() => open(x)}
              right={
                <Row>
                  <Button title="✕" small variant="ghost" accessibilityLabel={t('decline')} disabled={pending} onPress={async () => {
                    if (await run(() => api.post(`/friends/${x.characterId}/answer`, { accept: false }), { invalidate: [] })) refresh();
                  }} />
                  <Button title={t('accept')} small disabled={pending} onPress={async () => {
                    if (await run(() => api.post(`/friends/${x.characterId}/answer`, { accept: true }), { invalidate: [] })) refresh();
                  }} />
                </Row>
              }
              last={i === incoming.length - 1}
            />
          ))}
        </>
      ) : null}

      <Heading>{t('friendsN', { n: friends.length })}</Heading>
      {friends.length ? (
        friends.map((f, i) => (
          <ListRow
            key={f.characterId}
            left={avatar(f)}
            title={f.name}
            subtitle={[f.stage !== 'none' ? t(`stage_${f.stage}` as StringKey) : tierName('friendship', f.friendship, lang), where(f)].join(' · ')}
            onPress={() => open(f)}
            right={<Button title="✉" small variant="ghost" accessibilityLabel={t('sendMessage')} onPress={() => router.push(`/messages/${f.characterId}`)} />}
            last={i === friends.length - 1}
          />
        ))
      ) : (
        <Empty text={t('noFriends')} />
      )}

      {outgoing.length ? (
        <>
          <Heading>{t('sentRequests')}</Heading>
          {outgoing.map((x, i) => (
            <ListRow key={x.characterId} left={avatar(x)} title={x.name} subtitle={where(x)} onPress={() => open(x)} right="›" last={i === outgoing.length - 1} />
          ))}
        </>
      ) : null}
    </Screen>
  );
}
