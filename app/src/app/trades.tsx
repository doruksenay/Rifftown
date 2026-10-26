// Takaslar: gelen ve gönderilen teklifler, geçmiş.

import { ITEM_BY_ID, type TradeDto, type TradeItemDto, type TradesResponse } from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useGate } from '@/components/gate';
import { ColorDot } from '@/components/market';
import { Avatar, Body, Button, Card, Empty, ErrorView, Heading, Loading, Row, Screen, Small, Strong } from '@/components/ui';
import { api } from '@/lib/api';
import { dateTime, money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { itemDisplayName } from '@/lib/item-text';
import type { StringKey } from '@/lib/strings';
import { space, useColors } from '@/theme';

export default function Trades() {
  const gate = useGate();
  if (gate) return gate;
  return <TradesScreen />;
}

function TradesScreen() {
  const { t } = useI18n();
  const q = useQuery({ queryKey: ['trades'], queryFn: () => api.get<TradesResponse>('/trades'), refetchInterval: 15000 });
  if (q.isLoading) return <Loading />;
  if (!q.data) return <ErrorView error={q.error} onRetry={() => q.refetch()} />;
  const { incoming, outgoing, history } = q.data;
  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('trades') }} />
      <Small style={{ marginTop: space.lg }}>{t('tradeRule')}</Small>
      {!incoming.length && !outgoing.length && !history.length ? <Empty text={t('noTrades')} /> : null}
      {incoming.length ? (
        <>
          <Heading>{t('incomingTrades')}</Heading>
          {incoming.map((x) => (
            <TradeCard key={x.id} trade={x} />
          ))}
        </>
      ) : null}
      {outgoing.length ? (
        <>
          <Heading>{t('outgoingTrades')}</Heading>
          {outgoing.map((x) => (
            <TradeCard key={x.id} trade={x} />
          ))}
        </>
      ) : null}
      {history.length ? (
        <>
          <Heading>{t('tradeHistory')}</Heading>
          {history.map((x) => (
            <TradeCard key={x.id} trade={x} />
          ))}
        </>
      ) : null}
    </Screen>
  );
}

function ItemLine({ it }: { it: TradeItemDto }) {
  const { p } = useI18n();
  const def = ITEM_BY_ID[it.itemId];
  if (!def) return null;
  return (
    <Row style={{ gap: space.xs }}>
      <ColorDot color={it.color} />
      <Body numberOfLines={1} style={{ flexShrink: 1 }}>
        {itemDisplayName(def, p, it)}
      </Body>
    </Row>
  );
}

export function TradeCard({ trade }: { trade: TradeDto }) {
  const { t, locale } = useI18n();
  const c = useColors();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const other = trade.mine ? trade.to : trade.from;
  // Bakan kişinin gözünden: ne veriyor, ne alıyor
  const iGive = trade.mine ? trade.give : trade.want;
  const iGet = trade.mine ? trade.want : trade.give;
  const iGiveMoney = trade.mine ? trade.giveMoney : trade.wantMoney;
  const iGetMoney = trade.mine ? trade.wantMoney : trade.giveMoney;
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['trades'] });
    qc.invalidateQueries({ queryKey: ['inventory'] });
  };
  const open = trade.status === 'open';
  return (
    <Card style={{ marginBottom: space.md, borderColor: open && !trade.mine ? c.pink : c.line }}>
      <Pressable onPress={() => router.push(`/character/${other.characterId}`)} accessibilityRole="link">
        <Row>
          <Avatar name={other.name} color={other.avatarColor} uri={other.avatarUrl} size={32} />
          <View style={{ flex: 1 }}>
            <Strong>{other.name}</Strong>
            <Small>{`${dateTime(trade.createdAt, locale)}${open ? '' : ` · ${t(`tradeStatus_${trade.status}` as StringKey)}`}`}</Small>
          </View>
        </Row>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.md }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Small color={c.danger}>{t('youGive')}</Small>
          {iGive.map((it) => (
            <ItemLine key={it.id} it={it} />
          ))}
          {iGiveMoney ? <Strong>{t('plusMoney', { money: money(iGiveMoney) })}</Strong> : null}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Small color={c.blue}>{t('youGet')}</Small>
          {iGet.map((it) => (
            <ItemLine key={it.id} it={it} />
          ))}
          {iGetMoney ? <Strong>{t('plusMoney', { money: money(iGetMoney) })}</Strong> : null}
        </View>
      </View>
      {trade.note ? <Small style={{ marginTop: space.sm }}>{`“${trade.note}”`}</Small> : null}
      {open ? (
        <Row style={{ marginTop: space.md, justifyContent: 'flex-end' }}>
          {trade.mine ? (
            <Button title={t('cancelTrade')} small variant="ghost" disabled={pending} onPress={async () => {
              if (await run(() => api.del(`/trades/${trade.id}`), { invalidate: [] })) refresh();
            }} />
          ) : (
            <>
              <Button title={t('declineTrade')} small variant="ghost" disabled={pending} onPress={async () => {
                if (await run(() => api.post(`/trades/${trade.id}/decline`), { invalidate: [] })) refresh();
              }} />
              <Button title={t('acceptTrade')} small disabled={pending} onPress={async () => {
                await run(() => api.post(`/trades/${trade.id}/accept`), { success: t('tradeDone'), invalidate: ['me'] });
                refresh();
              }} />
            </>
          )}
        </Row>
      ) : null}
    </Card>
  );
}
