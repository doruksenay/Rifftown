// Eşya ayrıntısı: kuşan, sprey boyayla boya, isim ver, arkadaşa hediye et.

import { type FriendsResponse, ITEM_BY_ID, PAINT_COLORS, isEquippable, isPaintable } from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useGate } from '@/components/gate';
import { ColorDot } from '@/components/market';
import { LegendaryBadge } from '@/components/tier';
import { Avatar, Body, Button, Card, Empty, Field, Heading, ListRow, Loading, Row, Screen, Small, Strong, Title } from '@/components/ui';
import { api } from '@/lib/api';
import { useInventory, useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { itemBonusText, itemDisplayName } from '@/lib/item-text';
import { useMe } from '@/lib/session';
import { space, useColors } from '@/theme';
import { ItemArt } from '@/components/art/items';

export default function ItemDetail() {
  const gate = useGate();
  if (gate) return gate;
  return <ItemScreen />;
}

function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, p } = useI18n();
  const c = useColors();
  const me = useMe();
  const inv = useInventory();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const item = inv.data?.find((i) => String(i.id) === id);
  const [nick, setNick] = useState('');
  useEffect(() => setNick(item?.nickname ?? ''), [item?.nickname]);
  const friends = useQuery({ queryKey: ['friends'], queryFn: () => api.get<FriendsResponse>('/friends') });

  if (inv.isLoading) return <Loading />;
  const def = item ? ITEM_BY_ID[item.itemId] : null;
  if (!item || !def) {
    return (
      <Screen edges={[]}>
        <Stack.Screen options={{ title: t('itemTitle') }} />
        <Empty text={t('noItems')} action={<Button title={t('back')} variant="secondary" onPress={() => router.back()} />} />
      </Screen>
    );
  }
  const refresh = () => qc.invalidateQueries({ queryKey: ['inventory'] });
  const sprays = (inv.data ?? []).filter((i) => ITEM_BY_ID[i.itemId]?.slot === 'spray' && !i.listed);
  const kits = (inv.data ?? []).filter((i) => i.itemId === 'repair_kit' && !i.listed);
  const nameable = isPaintable(def.slot) || def.slot === 'pet' || def.slot === 'art';
  const city = me.data?.character?.cityId;
  const here = (friends.data?.friends ?? []).filter((f) => f.cityId && f.cityId === city);
  const locked = item.listed || !!me.data?.character?.jailedUntil;

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('itemTitle') }} />
      <View style={{ paddingTop: space.xl, gap: space.xs }}>
        <ItemArt itemId={item.itemId} color={item.color} legendary={!!item.legendary} size={112} />
        <Row style={{ alignItems: 'center', marginTop: space.sm }}>
          <ColorDot color={item.color} />
          <Title style={{ flex: 1 }}>{itemDisplayName(def, p, item)}</Title>
        </Row>
        <Body color={c.inkSoft}>{itemBonusText(def, t, p, item.bonus)}</Body>
        {item.craftedBy ? <Small>{t('craftedByName', { name: item.craftedBy })}</Small> : null}
        {item.legendary ? (
          <Row style={{ marginTop: space.xs }}>
            <LegendaryBadge />
            <Small style={{ flex: 1 }}>{t('legendaryItemLine', { band: item.legendary.bandName ?? '' })}</Small>
          </Row>
        ) : null}
        {item.listed ? <Small color={c.pink}>{t('listedBadge')}</Small> : null}
        {item.wear > 0 ? <Small color={item.wear >= 50 ? c.danger : c.inkSoft}>{t('wearLine', { n: item.wear })}</Small> : null}
      </View>
      {item.wear > 0 && kits.length ? (
        <Button
          title={t('repairWithKit')}
          variant="secondary"
          style={{ marginTop: space.md }}
          disabled={pending || locked}
          onPress={() => run(() => api.post('/repair', { kitId: kits[0].id, targetId: item.id }), { success: t('repaired'), invalidate: ['inventory', 'me'] })}
        />
      ) : null}

      {isEquippable(def.slot) ? (
        <Button
          title={item.equipped ? t('unequip') : t('equip')}
          variant={item.equipped ? 'secondary' : 'primary'}
          style={{ marginTop: space.lg }}
          disabled={pending || item.listed}
          onPress={() => run(() => api.post(`/inventory/${item.id}/${item.equipped ? 'unequip' : 'equip'}`), { invalidate: ['inventory', 'me'] })}
        />
      ) : null}

      {isPaintable(def.slot) ? (
        <>
          <Heading>{t('paint')}</Heading>
          {sprays.length ? (
            <>
              <Small style={{ marginBottom: space.sm }}>{t('paintWith')}</Small>
              <Row style={{ flexWrap: 'wrap' }}>
                {sprays
                  .filter((s, i, arr) => arr.findIndex((x) => x.itemId === s.itemId) === i)
                  .map((s) => {
                    const color = ITEM_BY_ID[s.itemId].color!;
                    const count = sprays.filter((x) => x.itemId === s.itemId).length;
                    return (
                      <Button
                        key={s.id}
                        title={`${p(PAINT_COLORS[color].name)}${count > 1 ? ` ×${count}` : ''}`}
                        small
                        variant="secondary"
                        disabled={pending || locked}
                        onPress={async () => {
                          if (await run(() => api.post(`/inventory/${item.id}/paint`, { sprayId: s.id }), { success: t('painted', { color: p(PAINT_COLORS[color].name) }), invalidate: ['inventory'] })) refresh();
                        }}
                      />
                    );
                  })}
              </Row>
            </>
          ) : (
            <Small>{t('noSpray')}</Small>
          )}
        </>
      ) : null}

      {nameable ? (
        <>
          <Heading>{t('rename')}</Heading>
          <Field label={t('nicknameLabel')} hint={t('nicknameHint')} value={nick} onChangeText={setNick} maxLength={24} />
          <Button
            title={t('save')}
            small
            variant="secondary"
            style={{ alignSelf: 'flex-start' }}
            disabled={pending || locked || nick.trim() === (item.nickname ?? '')}
            onPress={() => run(() => api.post(`/inventory/${item.id}/name`, { name: nick.trim() || null }), { success: t('saved'), invalidate: ['inventory'] })}
          />
        </>
      ) : null}

      <Heading>{t('giftTo')}</Heading>
      <Small style={{ marginBottom: space.sm }}>{t('giftHint')}</Small>
      {here.length ? (
        <Card>
          {here.map((f, i) => (
            <ListRow
              key={f.characterId}
              left={<Avatar name={f.name} color={f.avatarColor} uri={f.avatarUrl} size={32} />}
              title={f.name}
              right={
                <Button
                  title={t('giftTo')}
                  small
                  variant="secondary"
                  disabled={pending || locked}
                  onPress={async () => {
                    if (await run(() => api.post('/gifts', { toId: f.characterId, inventoryId: item.id }), { success: t('gifted', { name: f.name }), invalidate: ['inventory', 'me'] })) router.back();
                  }}
                />
              }
              last={i === here.length - 1}
            />
          ))}
        </Card>
      ) : (
        <Strong color={c.inkSoft}>{t('noFriendsHere')}</Strong>
      )}
    </Screen>
  );
}
