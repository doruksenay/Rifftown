import { ACHIEVEMENT_BY_ID, CITY_BY_ID, HOME_BY_ID, OFFICE_BY_ID, PROFESSION_BY_ID, type PublicCharacterDto, ROLE_NAMES, SKILL_BY_ID, TATTOO_BY_ID, VIP } from '@rifftown/shared';
import { Guestbook, ProfileActions, RelationshipPanel } from '@/components/social';
import { BlogList } from '@/components/newspaper';
import { useState } from 'react';
import { TierText } from '@/components/tier';
import { useQuery } from '@tanstack/react-query';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Avatar, Body, Button, Card, ErrorView, Field, Heading, ListRow, Loading, Row, Screen, Small, Strong, Title } from '@/components/ui';
import { money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useIsVip, useMe } from '@/lib/session';
import { useGate } from '@/components/gate';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import type { StringKey } from '@/lib/strings';
import { fonts, radius, space, type, useColors } from '@/theme';
import { Bleed } from '@/components/art/hero';
import { CitySkyline } from '@/components/art/skyline';

export default function CharacterProfile() {
  const gate = useGate();
  if (gate) return gate;
  return <CharacterProfileScreen />;
}

function CharacterProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, p, locale } = useI18n();
  const me = useMe();
  const c = useColors();
  const q = useQuery({
    queryKey: ['character', id],
    queryFn: () => api.get<{ character: PublicCharacterDto }>(`/characters/${id}`).then((r) => r.character),
  });
  if (q.isLoading) return <Loading />;
  if (!q.data) return <ErrorView error={q.error} onRetry={() => q.refetch()} />;
  const ch = q.data;
  const recent = [...ch.achievements].sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt)).slice(0, 5);
  const prof = ch.profession ? PROFESSION_BY_ID[ch.profession.id] : null;
  const isMe = me.data?.character?.id === ch.id;
  const family = [
    ch.partner ? t('partnerLine', { stage: t(`partnerStage_${ch.partner.stage}` as StringKey), name: ch.partner.name }) : null,
    ch.children.length ? t('childrenLine', { names: ch.children.map((k) => k.name).join(', ') }) : null,
    ch.tattoos.length ? t('tattoosLine', { list: ch.tattoos.map((x) => (TATTOO_BY_ID[x] ? p(TATTOO_BY_ID[x].name) : x)).join(', ') }) : null,
  ].filter(Boolean) as string[];
  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: ch.name }} />
      <Bleed>
        <CitySkyline cityId={ch.cityId ?? 'on-the-road'} height={120} />
      </Bleed>
      <View style={{ alignItems: 'center', marginTop: -60, gap: space.xs }}>
        <View style={{ borderRadius: 120, borderWidth: 4, borderColor: c.paper, backgroundColor: c.paper }}>
          <Avatar name={ch.name} color={ch.avatarColor} uri={ch.avatarUrl} size={112} />
        </View>
        <Title style={{ textAlign: 'center', marginTop: space.md }}>{ch.name}</Title>
        {ch.headline ? <Body style={{ textAlign: 'center' }}>{ch.headline}</Body> : null}
        <Row style={{ flexWrap: 'wrap', justifyContent: 'center', marginTop: space.xs }}>
          {ch.isVip ? <Badge text={t('vipMember')} color={c.pink} /> : null}
          {ch.npc ? <Badge text={t('npcMusician')} color={c.blue} /> : null}
          {ch.jailed ? <Badge text={t('jailedProfile')} color={c.danger} /> : null}
        </Row>
        <Small style={{ textAlign: 'center' }}>
          {`${ch.cityId ? p(CITY_BY_ID[ch.cityId].name) : t('onTheRoad')} · ${t('memberSince', { date: new Date(ch.createdAt).toLocaleDateString(locale) })}`}
        </Small>
        {ch.friendsCount ? <Small style={{ textAlign: 'center' }}>{t('friendsN', { n: ch.friendsCount })}</Small> : null}
      </View>

      {!isMe && !ch.npc ? <ProfileActions id={ch.id} name={ch.name} /> : null}

      <Row style={{ marginTop: space.xl, gap: space.sm }}>
        <Stat label={t('achievements')} value={t('achievementPointsN', { n: ch.achievementPoints })} />
        <Stat label={t('tabBand')} value={ch.band ? ch.band.name : '—'} />
        {ch.convictions > 0 ? <Stat label={t('convictions')} value={String(ch.convictions)} /> : null}
      </Row>

      {ch.bio ? (
        <>
          <Heading>{t('about')}</Heading>
          <Body>{ch.bio}</Body>
        </>
      ) : null}

      {family.length ? (
        <View style={{ marginTop: space.lg, gap: space.xs }}>
          {ch.partner ? (
            <ListRow title={family[0]} right="›" onPress={() => router.push(`/character/${ch.partner!.characterId}`)} last />
          ) : null}
          {family.slice(ch.partner ? 1 : 0).map((line) => (
            <Body key={line}>{line}</Body>
          ))}
        </View>
      ) : null}

      {!isMe && !ch.npc ? <RelationshipPanel id={ch.id} name={ch.name} /> : null}

      {ch.band ? (
        <>
          <Heading>{t('tabBand')}</Heading>
          <ListRow title={ch.band.name} subtitle={p(ROLE_NAMES[ch.band.role])} onPress={() => router.push(`/band/${ch.band!.id}`)} right="›" last />
        </>
      ) : null}

      {prof || ch.offices.length || ch.home ? (
        <>
          <Heading>{t('career')}</Heading>
          {prof ? <ListRow title={p(prof.name)} subtitle={p(prof.ranks[ch.profession!.rank] ?? prof.ranks[0])} last={!ch.offices.length && !ch.home} /> : null}
          {ch.offices.map((o, i) => (
            <ListRow
              key={`${o.cityId}-${o.office}`}
              title={OFFICE_BY_ID[o.office] ? p(OFFICE_BY_ID[o.office].name) : o.office}
              subtitle={p(CITY_BY_ID[o.cityId].name)}
              last={i === ch.offices.length - 1 && !ch.home}
            />
          ))}
          {ch.home && HOME_BY_ID[ch.home.homeId] ? (
            <ListRow title={t('home')} subtitle={`${p(HOME_BY_ID[ch.home.homeId].name)}, ${p(CITY_BY_ID[ch.home.cityId].name)}`} last />
          ) : null}
        </>
      ) : null}

      {recent.length ? (
        <>
          <Heading>{t('recentAchievements')}</Heading>
          {recent.map((a, i) => {
            const def = ACHIEVEMENT_BY_ID[a.id];
            if (!def) return null;
            return (
              <ListRow
                key={a.id}
                left={<Badge text={String(def.points)} color={c.pink} />}
                title={p(def.name)}
                subtitle={p(def.about)}
                last={i === recent.length - 1}
              />
            );
          })}
        </>
      ) : null}

      <Heading>{t('skills')}</Heading>
      {ch.topSkills.map((s, i) => (
        <ListRow
          key={s.skill}
          title={SKILL_BY_ID[s.skill] ? p(SKILL_BY_ID[s.skill].name) : s.skill}
          right={<TierText scale="skill" value={s.level} />}
          last={i === ch.topSkills.length - 1}
        />
      ))}
      {!isMe && !ch.npc ? <SendMoney name={ch.name} /> : null}
      {!ch.npc ? <BlogList id={ch.id} /> : null}
      {!ch.npc ? <Guestbook id={ch.id} canSign={!isMe} /> : null}
    </Screen>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <View style={{ borderWidth: 1.5, borderColor: color, borderRadius: radius.ticket, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text style={{ fontFamily: fonts.bodyBold, fontSize: type.caption, color }}>{text}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ flex: 1, padding: space.md }}>
      <Small>{label}</Small>
      <Strong numberOfLines={1}>{value}</Strong>
    </Card>
  );
}

/** VIP avantajı: başka bir oyuncuya para göndermek */
function SendMoney({ name }: { name: string }) {
  const { t } = useI18n();
  const vip = useIsVip();
  const me = useMe();
  const { run, pending } = useRun();
  const [amount, setAmount] = useState('');
  const n = Number.parseInt(amount, 10);
  const valid = Number.isInteger(n) && n >= 1 && n <= VIP.maxTransfer && n <= (me.data?.character?.money ?? 0);
  return (
    <>
      <Heading>{t('sendMoney')}</Heading>
      {vip ? (
        <>
          <Field
            label={t('amount')}
            hint={t('transferLimit', { money: money(VIP.maxTransfer) })}
            value={amount}
            onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            inputMode="numeric"
          />
          <Button
            title={t('sendMoney')}
            variant="secondary"
            disabled={!valid}
            loading={pending}
            onPress={async () => {
              const r = await run(() => api.post('/transfer', { toName: name, amount: n }), {
                success: t('moneySent', { name, money: money(n) }),
                invalidate: ['me'],
              });
              if (r) setAmount('');
            }}
          />
        </>
      ) : (
        <>
          <Small style={{ marginBottom: space.sm }}>{t('transferLocked')}</Small>
          <Button title={t('vipSeeMore')} small variant="secondary" style={{ alignSelf: 'flex-start' }} onPress={() => router.push('/vip')} />
        </>
      )}
    </>
  );
}
