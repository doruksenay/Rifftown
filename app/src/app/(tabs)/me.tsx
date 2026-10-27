import { ATTRIBUTE_DEFS, CITY_BY_ID, HOME_BY_ID, ITEM_BY_ID, LOCATION_BY_ID, type Lang, OFFICE_BY_ID, PROFESSION_BY_ID, ROLE_NAMES, isEquippable } from '@rifftown/shared';
import { AccountSettings } from '@/components/legal';
import { ColorDot } from '@/components/market';
import { ProfileEditor } from '@/components/profile-editor';
import { SkillList } from '@/components/skill-list';
import { TierMeter, TierText } from '@/components/tier';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { View } from 'react-native';
import {
  Avatar,
  Button,
  Choice,
  Empty,
  Heading,
  ListRow,
  Row,
  Screen,
  Small,
  Title,
} from '@/components/ui';
import { api } from '@/lib/api';
import { money } from '@/lib/format';
import { itemBonusText, itemDisplayName } from '@/lib/item-text';
import { useInventory, useRun, useSongs } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useMe, useSession } from '@/lib/session';
import { space, useColors } from '@/theme';
import { ItemArt } from '@/components/art/items';

export default function MeTab() {
  const me = useMe();
  const songs = useSongs();
  const inv = useInventory();
  const { t, p, lang, setLang, locale } = useI18n();
  const { logout } = useSession();
  const { run, pending } = useRun();
  const qc = useQueryClient();
  const c = useColors();
  const ch = me.data!.character!;
  const band = me.data!.band;

  const changeLang = (l: Lang) => {
    setLang(l);
    api.patch('/me', { lang: l }).catch(() => {});
  };

  const mySongs = (songs.data ?? []).filter((s) => s.authorId === ch.id);
  // Yığılabilir eşyalar (sprey, malzeme, efekt) tek satırda sayısıyla gösterilir
  const invRows = (inv.data ?? []).filter(
    (it, i, arr) => it.listed || !ITEM_BY_ID[it.itemId]?.stackable || arr.findIndex((x) => x.itemId === it.itemId && !x.listed) === i,
  );

  return (
    <Screen>
      <Row style={{ paddingTop: space.lg, gap: space.lg }}>
        <Avatar name={ch.name} color={ch.avatarColor} uri={ch.avatarUrl} size={64} />
        <View style={{ flex: 1 }}>
          <Title numberOfLines={2}>{ch.name}</Title>
          {ch.headline ? <Small color={c.ink}>{ch.headline}</Small> : null}
          <Small>
            {band ? t('inBand', { band: band.name, role: p(ROLE_NAMES[band.role]) }) : t('memberSince', { date: new Date(ch.createdAt).toLocaleDateString(locale) })}
            {` · ${t('ageValue', { n: ch.age })}`}
          </Small>
        </View>
      </Row>

      <Row style={{ marginTop: space.lg, flexWrap: 'wrap' }}>
        <Button
          title={`${t('notifications')}${me.data!.unreadNotifications ? ` (${me.data!.unreadNotifications})` : ''}`}
          small
          variant="secondary"
          onPress={() => router.push('/notifications')}
        />
        <Button
          title={me.data!.unreadMessages ? t('messagesN', { n: me.data!.unreadMessages }) : t('messages')}
          small
          variant="secondary"
          onPress={() => router.push({ pathname: '/chat', params: { channel: 'dm' } })}
        />
        <Button title={t('friendsAndMessages')} small variant="secondary" onPress={() => router.push('/friends')} />
        <Button
          title={me.data!.pendingTrades ? t('tradesN', { n: me.data!.pendingTrades }) : t('trades')}
          small
          variant={me.data!.pendingTrades ? 'primary' : 'secondary'}
          onPress={() => router.push('/trades')}
        />
        <Button title={t('leaderboard')} small variant="secondary" onPress={() => router.push('/leaderboard')} />
        <Button
          title={`${t('achievements')} · ${t('achievementPointsN', { n: ch.achievementPoints })}`}
          small
          variant="secondary"
          onPress={() => router.push('/achievements')}
        />
        <Button title={me.data!.user.isVip ? `${t('vip')} ✓` : t('vip')} small variant={me.data!.user.isVip ? 'primary' : 'secondary'} onPress={() => router.push('/vip')} />
      </Row>

      <Heading>{t('career')}</Heading>
      {ch.profession && PROFESSION_BY_ID[ch.profession.id] ? (
        <ListRow
          title={p(PROFESSION_BY_ID[ch.profession.id].name)}
          subtitle={p(PROFESSION_BY_ID[ch.profession.id].ranks[ch.profession.rank])}
          right="›"
          onPress={() => router.push('/careers')}
          last
        />
      ) : (
        <ListRow title={t('careers')} subtitle={t('noCareer')} right="›" onPress={() => router.push('/careers')} last />
      )}
      <ListRow
        title={t('home')}
        subtitle={
          ch.home && HOME_BY_ID[ch.home.homeId]
            ? `${p(HOME_BY_ID[ch.home.homeId].name)}, ${p(CITY_BY_ID[ch.home.cityId].name)} · ${t('perWeek', { money: money(ch.home.rent) })}`
            : t('noHome')
        }
        right="›"
        onPress={ch.cityId ? () => router.push(`/location/${ch.cityId}-real_estate`) : undefined}
        last
      />
      <ListRow
        title={t('myBusiness')}
        subtitle={
          ch.business && LOCATION_BY_ID[ch.business.locationId]
            ? `${p(CITY_BY_ID[LOCATION_BY_ID[ch.business.locationId].cityId].name)} · ${ch.business.role === 'owner' ? t('ownedBy', { name: ch.name }) : t('staff')}`
            : t('noBusiness')
        }
        right={ch.business ? '›' : undefined}
        onPress={ch.business ? () => router.push(`/location/${ch.business!.locationId}`) : undefined}
        last
      />
      <ListRow
        title={t('bankRow')}
        subtitle={t('inBank', { money: money(ch.bank) })}
        right={ch.cityId ? '›' : undefined}
        onPress={ch.cityId ? () => router.push(`/location/${ch.cityId}-bank`) : undefined}
        last
      />
      {ch.offices.map((o) => (
        <ListRow
          key={`${o.cityId}-${o.office}`}
          title={OFFICE_BY_ID[o.office] ? p(OFFICE_BY_ID[o.office].name) : o.office}
          subtitle={p(CITY_BY_ID[o.cityId].name)}
          last
        />
      ))}

      {/* Nitelikler: kim olduğun (attributes.ts). Ayrıntı ve XP harcama /attributes ekranında. */}
      <Heading>{t('attributes')}</Heading>
      {ATTRIBUTE_DEFS.map((def) => (
        <TierMeter key={def.id} label={p(def.name)} scale="attribute" value={ch.attributes?.[def.id] ?? 0} />
      ))}
      <Button
        title={ch.xp > 0 ? `${t('attrOpen')} · ${t('attrPendingXp', { n: ch.xp })}` : t('attrOpen')}
        variant={ch.xp > 0 ? 'primary' : 'secondary'}
        small
        onPress={() => router.push('/attributes')}
        style={{ alignSelf: 'flex-start' }}
      />

      <SkillList skills={ch.skills} onlyKnown />
      <Row style={{ marginTop: space.sm }}>
        <Button title={t('practiceShort')} variant="secondary" onPress={() => router.push('/study')} disabled={!!me.data!.action} style={{ flex: 1 }} />
        <Button title={t('allSkills')} variant="secondary" onPress={() => router.push('/skills')} style={{ flex: 1 }} />
      </Row>

      <Heading>{t('songs')}</Heading>
      {mySongs.length ? (
        mySongs.map((s, i) => (
          <ListRow
            key={s.id}
            title={s.title}
            subtitle={s.inBand ? band?.name : undefined}
            right={<TierText scale="quality" value={s.quality} />}
            last={i === mySongs.length - 1}
          />
        ))
      ) : (
        <Empty text={t('noSongs')} />
      )}
      <Button title={t('writeSong')} variant="secondary" onPress={() => router.push('/write-song')} disabled={!!me.data!.action} style={{ marginTop: space.sm }} />

      <Heading>{t('inventory')}</Heading>
      {inv.data?.length ? (
        <>
          <Small style={{ marginBottom: space.xs }}>{t('itemsTapHint')}</Small>
          {invRows.map((it, i) => {
            const def = ITEM_BY_ID[it.itemId];
            if (!def) return null;
            const n = def.stackable ? (inv.data ?? []).filter((x) => x.itemId === it.itemId && !x.listed).length : 1;
            return (
              <ListRow
                key={it.id}
                left={<ItemArt itemId={it.itemId} color={it.color} legendary={!!it.legendary} size={40} />}
                title={`${itemDisplayName(def, p, it)}${n > 1 ? ` ×${n}` : ''}`}
                subtitle={`${it.listed ? `${t('listedBadge')} · ` : ''}${itemBonusText(def, t, p, it.bonus)}`}
                onPress={() => router.push(`/item/${it.id}`)}
                right={
                  isEquippable(def.slot) && !it.listed ? (
                    <Button
                      title={it.equipped ? t('unequip') : t('equip')}
                      small
                      variant={it.equipped ? 'ghost' : 'secondary'}
                      disabled={pending}
                      onPress={() => run(() => api.post(`/inventory/${it.id}/${it.equipped ? 'unequip' : 'equip'}`), { invalidate: ['inventory'] })}
                    />
                  ) : (
                    '›'
                  )
                }
                last={i === invRows.length - 1}
              />
            );
          })}
        </>
      ) : (
        <Empty text={t('noItems')} />
      )}

      <View style={{ height: space.xl }} />
      <ProfileEditor />
      <Button title={t('profile')} variant="ghost" small style={{ alignSelf: 'flex-start', paddingHorizontal: 0, marginTop: space.sm }} onPress={() => router.push(`/character/${ch.id}`)} />

      <Heading>{t('settings')}</Heading>
      <Small color={c.ink} style={{ marginBottom: space.xs }}>{t('language')}</Small>
      <Choice<Lang>
        options={[
          { value: 'tr', label: 'Türkçe' },
          { value: 'en', label: 'English' },
        ]}
        value={lang}
        onChange={changeLang}
      />
      <AccountSettings />
      <Button
        title={t('logout')}
        variant="ghost"
        style={{ alignSelf: 'flex-start', marginTop: space.xl, paddingHorizontal: 0 }}
        onPress={async () => {
          await logout();
          qc.clear();
          router.replace('/login');
        }}
      />
    </Screen>
  );
}
