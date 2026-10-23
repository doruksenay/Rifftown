import { VIP_BENEFITS, VIP_PLANS } from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useGate } from '@/components/gate';
import { GradientBadge } from '@/components/brand';
import { Body, Button, Card, Heading, ListRow, Screen, Small, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { type VipOffer, buyVip, loadVipOffers, restoreVip, storeAvailable } from '@/lib/purchases';
import { useMe } from '@/lib/session';
import type { MeResponse } from '@rifftown/shared';
import { space, useColors } from '@/theme';

export default function Vip() {
  const gate = useGate();
  if (gate) return gate;
  return <VipScreen />;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function VipScreen() {
  const { t, p, lang, locale } = useI18n();
  const c = useColors();
  const me = useMe();
  const qc = useQueryClient();
  const toast = useToast();
  const user = me.data!.user;
  const [busy, setBusy] = useState<string | null>(null);
  const offers = useQuery({ queryKey: ['vip-offers', user.id], queryFn: loadVipOffers, staleTime: 5 * 60 * 1000 });

  /** VIP'i sunucu açar (mağaza bildirimiyle). Ödemeden sonra profil açılana kadar birkaç kez yenilenir. */
  const waitForVip = async (before: string | null) => {
    for (const ms of [1500, 2500, 4000, 6000, 8000]) {
      await sleep(ms);
      const fresh = await api.get<MeResponse>('/me').catch(() => null);
      if (fresh?.user.isVip && fresh.user.vipUntil !== before) {
        qc.setQueryData(['me'], fresh);
        await qc.invalidateQueries();
        return true;
      }
    }
    return false;
  };

  const buy = async (offer: VipOffer) => {
    if (!storeAvailable || !offer.pkg) {
      toast(t('vipStoreSoon'));
      return;
    }
    setBusy(offer.productId);
    const before = user.vipUntil;
    const outcome = await buyVip(offer);
    if (outcome === 'purchased') {
      toast(t('vipPurchased'));
      toast((await waitForVip(before)) ? t('vipActivated') : t('vipPending'));
    } else if (outcome === 'failed') {
      toast(t('vipPurchaseFailed'), 'error');
    }
    setBusy(null);
  };

  const restore = async () => {
    setBusy('restore');
    const ok = await restoreVip();
    await qc.invalidateQueries({ queryKey: ['me'] });
    toast(ok ? t('vipRestored') : t('vipStoreSoon'));
    setBusy(null);
  };

  const list = offers.data ?? VIP_PLANS.map((pl) => ({ productId: pl.productId, days: pl.days, price: null, pkg: null }));

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('vipTitle') }} />
      <View style={{ paddingTop: space.xl }}>
        <GradientBadge text="VIP" size={64} />
      </View>
      <Card style={{ marginTop: space.lg, borderColor: user.isVip ? c.pink : c.line }}>
        <Body>
          {user.isVip && user.vipUntil
            ? t('vipActiveUntil', { date: new Date(user.vipUntil).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) })
            : t('vipInactive')}
        </Body>
      </Card>
      <Body color={c.inkSoft} style={{ marginTop: space.lg }}>
        {t('vipIntro')}
      </Body>
      <View style={{ marginTop: space.md, gap: space.sm }}>
        {VIP_BENEFITS.map((b, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' }}>
            <Body color={c.pink}>✓</Body>
            <Body style={{ flex: 1 }}>{p(b)}</Body>
          </View>
        ))}
      </View>

      <Heading>{t('vipPlans')}</Heading>
      {list.map((offer, i) => {
        // Mağazanın verdiği yerel fiyat esastır; mağazaya ulaşılamazsa listedeki tahmini fiyat gösterilir
        const fallbackPrice = VIP_PLANS.find((pl) => pl.productId === offer.productId)?.price[lang];
        return (
          <ListRow
            key={offer.productId}
            title={t('vipDays', { n: offer.days })}
            subtitle={offer.price ?? fallbackPrice}
            right={
              <Button
                title={t('vipBuy')}
                small
                variant={i === 1 ? 'primary' : 'secondary'}
                loading={busy === offer.productId}
                disabled={!!busy || !storeAvailable || !offer.pkg}
                onPress={() => buy(offer)}
              />
            }
            last={i === list.length - 1}
          />
        );
      })}
      {storeAvailable ? (
        <>
          <Small style={{ marginTop: space.md }}>{t('vipRenewNote')}</Small>
          <Button
            title={t('vipRestore')}
            variant="ghost"
            small
            loading={busy === 'restore'}
            disabled={!!busy}
            style={{ alignSelf: 'flex-start', paddingHorizontal: 0, marginTop: space.sm }}
            onPress={restore}
          />
        </>
      ) : (
        <Small style={{ marginTop: space.md }}>{t('vipStoreSoon')}</Small>
      )}
    </Screen>
  );
}
