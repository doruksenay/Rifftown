// İkinci el pazarı: oyuncuların sattığı eşyalar, ilanlarım, ilan verme.

import { ITEM_BY_ID, type ListingDto, MARKET_FEE, PAINT_COLORS, maxResalePrice } from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { View } from 'react-native';
import { Body, Button, Choice, Empty, Field, Heading, ListRow, Small, Strong } from '@/components/ui';
import { api } from '@/lib/api';
import { money } from '@/lib/format';
import { useInventory, useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { itemBonusText, itemDisplayName } from '@/lib/item-text';
import { useIsVip, useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

export function ColorDot({ color }: { color: string | null | undefined }) {
  if (!color || !(color in PAINT_COLORS)) return null;
  return <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: PAINT_COLORS[color as keyof typeof PAINT_COLORS].hex, borderWidth: 1, borderColor: '#0003' }} />;
}

export function FleaMarket({ locationId }: { locationId: string }) {
  const { t, p } = useI18n();
  const c = useColors();
  const me = useMe();
  const vip = useIsVip();
  const inv = useInventory();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const [tab, setTab] = useState<'sale' | 'mine' | 'new'>('sale');
  const [picked, setPicked] = useState<number | null>(null);
  const [price, setPrice] = useState('');
  const q = useQuery({ queryKey: ['market'], queryFn: () => api.get<{ listings: ListingDto[] }>('/market').then((r) => r.listings) });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['market'] });
    qc.invalidateQueries({ queryKey: ['inventory'] });
  };
  const busy = !!me.data?.action || !!me.data?.character?.jailedUntil;
  const listings = (q.data ?? []).filter((l) => (tab === 'mine' ? l.mine : !l.mine));
  const sellable = (inv.data ?? []).filter((i) => !i.listed && ITEM_BY_ID[i.itemId]);
  const n = Number.parseInt(price, 10) || 0;
  const pickedItem = sellable.find((i) => i.id === picked);
  const cap = pickedItem ? maxResalePrice(ITEM_BY_ID[pickedItem.itemId].price, !!pickedItem.legendary) : null;

  return (
    <View style={{ marginTop: space.lg }}>
      <Body color={c.inkSoft}>{t('marketIntro')}</Body>
      <View style={{ height: space.md }} />
      <Choice
        options={[
          { value: 'sale', label: t('forSale') },
          { value: 'mine', label: t('myListings') },
          { value: 'new', label: t('newListing') },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'new' ? (
        <View style={{ marginTop: space.lg }}>
          <Heading>{t('chooseItem')}</Heading>
          {sellable.length ? (
            sellable.map((i, idx) => {
              const def = ITEM_BY_ID[i.itemId];
              return (
                <ListRow
                  key={i.id}
                  left={<ColorDot color={i.color} />}
                  title={itemDisplayName(def, p, i)}
                  subtitle={itemBonusText(def, t, p, i.bonus)}
                  right={<Body color={picked === i.id ? c.pink : c.inkSoft}>{picked === i.id ? '●' : '○'}</Body>}
                  onPress={() => setPicked(i.id)}
                  last={idx === sellable.length - 1}
                />
              );
            })
          ) : (
            <Empty text={t('noItems')} />
          )}
          <View style={{ height: space.md }} />
          <Field
            label={t('price')}
            hint={cap ? t('maxPriceHint', { money: money(cap) }) : undefined}
            value={price}
            onChangeText={(v) => setPrice(v.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            inputMode="numeric"
          />
          {n > 0 ? <Small style={{ marginTop: -space.sm, marginBottom: space.md }}>{t('youWillGet', { money: money(n - Math.ceil(n * MARKET_FEE)) })}</Small> : null}
          <Button
            title={t('listIt')}
            disabled={!picked || n < 1 || (cap !== null && n > cap) || busy || pending}
            onPress={async () => {
              const r = await run(() => api.post('/market', { locationId, inventoryId: picked, price: n }), { success: t('listed'), invalidate: ['me'] });
              if (r) {
                setPicked(null);
                setPrice('');
                setTab('mine');
                refresh();
              }
            }}
          />
        </View>
      ) : listings.length ? (
        <View style={{ marginTop: space.md }}>
          {listings.map((l, i) => {
            const def = ITEM_BY_ID[l.itemId];
            if (!def) return null;
            return (
              <ListRow
                key={l.id}
                left={<ColorDot color={l.color} />}
                title={itemDisplayName(def, p, l)}
                subtitle={`${itemBonusText(def, t, p, l.bonus)}${l.craftedBy ? ` · ${t('craftedByName', { name: l.craftedBy })}` : ''} · ${t('sellerName', { name: l.seller.name })}`}
                right={
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Strong>{money(l.price)}</Strong>
                    {l.mine ? (
                      <Button title={t('withdraw')} small variant="ghost" disabled={pending} onPress={async () => {
                        if (await run(() => api.del(`/market/${l.id}`))) refresh();
                      }} />
                    ) : (
                      <Button
                        title={t('buy')}
                        small
                        variant="secondary"
                        disabled={busy || pending || (me.data?.character?.money ?? 0) < l.price || (!!def.vip && !vip)}
                        onPress={async () => {
                          if (await run(() => api.post(`/market/${l.id}/buy`, { locationId }), { success: t('bought'), invalidate: ['me'] })) refresh();
                        }}
                      />
                    )}
                  </View>
                }
                last={i === listings.length - 1}
              />
            );
          })}
        </View>
      ) : (
        <Empty text={t('noListings')} />
      )}
    </View>
  );
}
