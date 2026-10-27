// Görev zincirleri kartı: sırayla açılan kısa hikâyeler (veri: packages/shared/src/content/progress.ts).
// Karakterli zincirlerde hikâye cümlesi, seçimli adımlar ve para dışı ödüller (eşya, ünvan) gösterilir.

import { CHAIN_BY_ID, ITEM_BY_ID, TITLE_BY_ID } from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { View } from 'react-native';
import { Button, Card, Heading, Meter, Row, Small, Strong } from '@/components/ui';
import { api } from '@/lib/api';
import { money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { space, useColors } from '@/theme';

interface ChainState {
  id: string;
  step: number | null;
  progress: number;
  target: number;
  reward: number;
  done: boolean;
  completed: number;
  total: number;
  choice?: boolean;
  choices?: Record<number, string>;
}

export function ChainsCard() {
  const { t, p } = useI18n();
  const c = useColors();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const q = useQuery({ queryKey: ['chains'], queryFn: () => api.get<{ chains: ChainState[] }>('/chains').then((r) => r.chains), refetchInterval: 120000 });
  const open = (q.data ?? []).filter((x) => x.step !== null);
  if (!open.length) return null;
  const claim = async (id: string, choice?: string, success?: string) => {
    if (await run(() => api.post(`/chains/${id}/claim`, choice ? { choice } : {}), { success, invalidate: ['me', 'inventory'] })) qc.invalidateQueries({ queryKey: ['chains'] });
  };
  return (
    <>
      <Heading>{t('chainsTitle')}</Heading>
      <Card style={{ gap: space.md }}>
        {open.map((ch) => {
          const def = CHAIN_BY_ID[ch.id];
          const step = def?.steps[ch.step!];
          if (!def || !step) return null;
          const itemName = step.item && ITEM_BY_ID[step.item] ? p(ITEM_BY_ID[step.item].name) : null;
          const titleName = step.titleId && TITLE_BY_ID[step.titleId] ? p(TITLE_BY_ID[step.titleId].name) : null;
          return (
            <View key={ch.id}>
              <Small color={c.purple}>{`${p(def.name)} · ${ch.completed + 1}/${ch.total}${def.npc ? ` · ${def.npc.name}, ${p(def.npc.role)}` : ''}`}</Small>
              {step.story ? <Small style={{ fontStyle: 'italic', marginVertical: space.xs }}>{p(step.story)}</Small> : null}
              {step.choice ? (
                <View style={{ gap: space.xs }}>
                  <Strong>{p(step.title)}</Strong>
                  <Small>{t('chainChoose')}</Small>
                  <Row style={{ flexWrap: 'wrap' }}>
                    {step.choice.map((o) => (
                      <Button key={o.id} small variant="secondary" title={p(o.label)} disabled={pending} onPress={() => claim(ch.id, o.id, p(o.result))} />
                    ))}
                  </Row>
                </View>
              ) : (
                <>
                  <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Strong>{p(step.title)}</Strong>
                      {ch.reward > 0 ? <Small>{t('missionReward', { money: money(ch.reward) })}</Small> : null}
                      {itemName ? <Small>{t('chainRewardItem', { item: itemName })}</Small> : null}
                      {titleName ? <Small>{t('chainRewardTitle', { title: titleName })}</Small> : null}
                    </View>
                    {ch.done ? <Button title={t('claim')} small disabled={pending} onPress={() => claim(ch.id, undefined, ch.reward ? `+${money(ch.reward)}` : undefined)} /> : null}
                  </Row>
                  <Meter label="" value={ch.progress} max={ch.target} right={`${ch.progress}/${ch.target}`} />
                </>
              )}
            </View>
          );
        })}
      </Card>
    </>
  );
}
