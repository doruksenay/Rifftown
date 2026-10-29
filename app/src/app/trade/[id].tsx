// Yeni takas teklifi: karşı tarafın ve kendi eşyalarından seç, istersen üstüne para ekle.

import { type InventoryItemDto, ITEM_BY_ID, MAX_TRADE_ITEMS, MAX_TRADE_MONEY, type PublicCharacterDto, tradeMoneyValue } from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useGate } from '@/components/gate';
import { Body, Button, Choice, Empty, Field, Heading, Loading, Row, Screen, Small } from '@/components/ui';
import { api } from '@/lib/api';
import { money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { itemBonusText, itemDisplayName } from '@/lib/item-text';
import { useMe } from '@/lib/session';
import { space, useColors } from '@/theme';
import { ItemArt } from '@/components/art/items';

export default function NewTrade() {
  const gate = useGate();
  if (gate) return gate;
  return <NewTradeScreen />;
}

function NewTradeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const me = useMe();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const myId = me.data?.character?.id;
  const them = useQuery({
    queryKey: ['character', id],
    queryFn: () => api.get<{ character: PublicCharacterDto }>(`/characters/${id}`).then((r) => r.character),
  });
  const theirItems = useQuery({
    queryKey: ['tradeItems', id],
    queryFn: () => api.get<{ items: InventoryItemDto[] }>(`/characters/${id}/items`).then((r) => r.items),
  });
  const myItems = useQuery({
    queryKey: ['tradeItems', String(myId)],
    enabled: !!myId,
    queryFn: () => api.get<{ items: InventoryItemDto[] }>(`/characters/${myId}/items`).then((r) => r.items),
  });
  const [give, setGive] = useState<number[]>([]);
  const [want, setWant] = useState<number[]>([]);
  const [moneyDir, setMoneyDir] = useState<'none' | 'give' | 'want'>('none');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  if (them.isLoading || theirItems.isLoading || myItems.isLoading) return <Loading />;
  const name = them.data?.name ?? '';
  // Para tavanı: karşılığında alınan eşyaların dükkân değeri (sunucudaki kuralın aynısı, tradeMoneyValue)
  const worth = (list: InventoryItemDto[] | undefined, ids: number[]) =>
    (list ?? []).filter((x) => ids.includes(x.id)).reduce((sum, x) => sum + tradeMoneyValue(ITEM_BY_ID[x.itemId]?.price ?? 0, !!x.legendary), 0);
  const moneyCap = Math.min(MAX_TRADE_MONEY, moneyDir === 'give' ? worth(theirItems.data, want) : worth(myItems.data, give));
  const n = Math.min(moneyCap, Number.parseInt(amount, 10) || 0);
  const toggle = (list: number[], set: (v: number[]) => void, itemId: number) =>
    set(list.includes(itemId) ? list.filter((x) => x !== itemId) : list.length >= MAX_TRADE_ITEMS ? list : [...list, itemId]);

  const send = async () => {
    const r = await run(
      () =>
        api.post('/trades', {
          toId: Number(id),
          give,
          want,
          giveMoney: moneyDir === 'give' ? n : 0,
          wantMoney: moneyDir === 'want' ? n : 0,
          note: note.trim(),
        }),
      { success: t('offerSent'), invalidate: [] },
    );
    if (r) {
      qc.invalidateQueries({ queryKey: ['trades'] });
      router.replace('/trades');
    }
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('tradeWith', { name }) }} />
      <Small style={{ marginTop: space.lg }}>{t('tradeRule')}</Small>

      <Heading>{t('youGet')}</Heading>
      <Picker items={theirItems.data ?? []} selected={want} onToggle={(x) => toggle(want, setWant, x)} />

      <Heading>{t('youGive')}</Heading>
      <Picker items={myItems.data ?? []} selected={give} onToggle={(x) => toggle(give, setGive, x)} />

      <Heading>{t('money')}</Heading>
      <Choice
        options={[
          { value: 'none', label: '—' },
          { value: 'give', label: t('addMoney', { money: money(MAX_TRADE_MONEY) }) },
          { value: 'want', label: t('askMoney', { money: money(MAX_TRADE_MONEY) }) },
        ]}
        value={moneyDir}
        onChange={setMoneyDir}
      />
      {moneyDir !== 'none' ? (
        <View style={{ marginTop: space.md }}>
          <Field label={t('amountLabel')} hint={t('maxPriceHint', { money: money(moneyCap) })} value={amount} onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" inputMode="numeric" />
        </View>
      ) : null}
      <View style={{ height: space.md }} />
      <Field label={t('tradeNote')} value={note} onChangeText={setNote} maxLength={200} />
      <Button title={t('sendOffer')} onPress={send} loading={pending} disabled={!give.length || !want.length || (moneyDir !== 'none' && n < 1)} />
    </Screen>
  );
}

function Picker({ items, selected, onToggle }: { items: InventoryItemDto[]; selected: number[]; onToggle: (id: number) => void }) {
  const { t, p } = useI18n();
  const c = useColors();
  if (!items.length) return <Empty text={t('noItems')} />;
  return (
    <View>
      {items.map((it, i) => {
        const def = ITEM_BY_ID[it.itemId];
        if (!def) return null;
        const on = selected.includes(it.id);
        return (
          <Pressable
            key={it.id}
            onPress={() => onToggle(it.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            style={{ paddingVertical: space.sm, borderBottomWidth: i === items.length - 1 ? 0 : 1, borderBottomColor: c.line }}
          >
            <Row>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  borderWidth: 1.5,
                  borderColor: on ? c.blue : c.line,
                  backgroundColor: on ? c.blue : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {on ? <Small color={c.onBlue}>✓</Small> : null}
              </View>
              <ItemArt itemId={it.itemId} color={it.color} legendary={!!it.legendary} size={36} />
              <View style={{ flex: 1 }}>
                <Body numberOfLines={1}>{itemDisplayName(def, p, it)}</Body>
                <Small numberOfLines={1}>{`${itemBonusText(def, t, p, it.bonus)}${it.equipped ? ` · ${t('equipped')}` : ''}`}</Small>
              </View>
            </Row>
          </Pressable>
        );
      })}
    </View>
  );
}
