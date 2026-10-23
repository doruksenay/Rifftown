// Ana sayfadaki haftalık görev kartı.

import { MISSION_BY_ID, type MissionsResponse } from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { View } from 'react-native';
import { Button, Card, Heading, Meter, Row, Small, Strong } from '@/components/ui';
import { api } from '@/lib/api';
import { duration, money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { space, useColors } from '@/theme';

export function MissionsCard() {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const q = useQuery({ queryKey: ['missions'], queryFn: () => api.get<MissionsResponse>('/missions'), refetchInterval: 60000 });
  const data = q.data;
  if (!data) return null;

  return (
    <>
      <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Heading>{t('missions')}</Heading>
        {data.endsAt ? <Small>{t('missionsEnd', { time: duration(new Date(data.endsAt).getTime() - Date.now(), lang) })}</Small> : null}
      </Row>
      {!data.weekId || !data.missions.length ? (
        <Small>{t('missionsNone')}</Small>
      ) : (
        <Card style={{ gap: space.md }}>
          {data.missions.map((m) => {
            const def = MISSION_BY_ID[m.id];
            if (!def) return null;
            const done = m.progress >= m.target;
            return (
              <View key={m.id}>
                <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Strong color={m.claimed ? c.inkSoft : c.ink}>{p(def.title)}</Strong>
                    <Small>{t('missionReward', { money: money(m.reward) })}</Small>
                  </View>
                  {m.claimed ? (
                    <Small color={c.blue}>{`${t('claimed')} ✓`}</Small>
                  ) : done ? (
                    <Button
                      title={t('claim')}
                      small
                      disabled={pending}
                      onPress={async () => {
                        if (await run(() => api.post<{ reward: number }>(`/missions/${m.id}/claim`), { success: `+${money(m.reward)}` })) {
                          qc.invalidateQueries({ queryKey: ['missions'] });
                        }
                      }}
                    />
                  ) : null}
                </Row>
                {!m.claimed ? <Meter label="" value={Math.min(m.progress, m.target)} max={m.target} right={`${Math.min(m.progress, m.target)}/${m.target}`} /> : null}
              </View>
            );
          })}
        </Card>
      )}
    </>
  );
}
