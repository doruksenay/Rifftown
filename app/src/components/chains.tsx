// Görev zincirleri kartı: sırayla açılan kısa hikâyeler (veri: packages/shared/src/content/progress.ts)

import { CHAIN_BY_ID } from '@rifftown/shared';
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
}

export function ChainsCard() {
  const { t, p } = useI18n();
  const c = useColors();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const q = useQuery({ queryKey: ['chains'], queryFn: () => api.get<{ chains: ChainState[] }>('/chains').then((r) => r.chains), refetchInterval: 120000 });
  const open = (q.data ?? []).filter((x) => x.step !== null);
  if (!open.length) return null;
  return (
    <>
      <Heading>{t('chainsTitle')}</Heading>
      <Card style={{ gap: space.md }}>
        {open.map((ch) => {
          const def = CHAIN_BY_ID[ch.id];
          const step = def?.steps[ch.step!];
          if (!def || !step) return null;
          return (
            <View key={ch.id}>
              <Small color={c.purple}>{`${p(def.name)} · ${ch.completed + 1}/${ch.total}`}</Small>
              <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Strong>{p(step.title)}</Strong>
                  <Small>{t('missionReward', { money: money(ch.reward) })}</Small>
                </View>
                {ch.done ? (
                  <Button
                    title={t('claim')}
                    small
                    disabled={pending}
                    onPress={async () => {
                      if (await run(() => api.post(`/chains/${ch.id}/claim`), { success: `+${money(ch.reward)}` })) qc.invalidateQueries({ queryKey: ['chains'] });
                    }}
                  />
                ) : null}
              </Row>
              <Meter label="" value={ch.progress} max={ch.target} right={`${ch.progress}/${ch.target}`} />
            </View>
          );
        })}
      </Card>
    </>
  );
}
