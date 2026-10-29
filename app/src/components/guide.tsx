// Rehber görevler: ana ekrandaki "sıradaki adım" kartı.

import { TUTORIAL, TUTORIAL_BY_ID, type TutorialResponse } from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type Href, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GoalCard } from '@/components/progress';
import { Body, Button, Card, Row, Small, Strong } from '@/components/ui';
import { api } from '@/lib/api';
import { money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { storage } from '@/lib/storage';
import { space, useColors } from '@/theme';

export function useTutorial() {
  return useQuery({ queryKey: ['tutorial'], queryFn: () => api.get<TutorialResponse>('/tutorial'), refetchInterval: 30000 });
}

export function GuideCard() {
  const { t, p } = useI18n();
  const c = useColors();
  const me = useMe();
  const q = useTutorial();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const [hidden, setHidden] = useState<boolean | null>(null);
  useEffect(() => {
    storage.get('guideHidden').then((v) => setHidden(v === '1'));
  }, []);

  const current = q.data?.current ? TUTORIAL_BY_ID[q.data.current] : null;
  // Rehber bitti: sıradaki büyük hedef
  const goal = q.data?.next ? <GoalCard goal={q.data.next} cityId={me.data?.character?.cityId ?? 'istanbul'} /> : null;
  if (!current) return goal;
  if (hidden === null) return null;
  const n = q.data!.steps.filter((s) => s.claimed).length;
  if (hidden) {
    // Rehber gizliyse hedef kartı gösterilir; rehberi geri açma düğmesi altında
    return (
      <>
        {goal}
        <Button title={t('guideShow')} variant="ghost" small style={{ alignSelf: 'flex-start', marginTop: space.md, paddingHorizontal: 0 }} onPress={() => {
        setHidden(false);
        storage.set('guideHidden', null);
      }} />
      </>
    );
  }
  const state = q.data!.steps.find((s) => s.id === current.id)!;
  const city = me.data?.character?.cityId ?? 'istanbul';
  const href = current.href.replace('{city}', city) as Href;

  return (
    <Card style={{ marginTop: space.lg, borderColor: c.blue, borderWidth: 1.5 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Small color={c.blue}>{`${t('guideTitle')} · ${t('guideProgress', { n: Math.min(n + 1, TUTORIAL.length), total: TUTORIAL.length })}`}</Small>
        <Button title={t('guideHide')} variant="ghost" small style={{ paddingHorizontal: 0, paddingVertical: 0 }} onPress={() => {
          setHidden(true);
          storage.set('guideHidden', '1');
        }} />
      </Row>
      {/* Süren eylemin adımı (ör. şarkı yazılıyor): kart beklemede kalmaz, bu arada yapılacak adımı gösterir */}
      {q.data!.waiting && TUTORIAL_BY_ID[q.data!.waiting] && !state.done ? (
        <Small color={c.inkSoft} style={{ marginTop: space.xs }}>{t('guideWhileWaiting', { step: p(TUTORIAL_BY_ID[q.data!.waiting].title) })}</Small>
      ) : null}
      <Strong style={{ marginTop: space.xs }}>{p(current.title)}</Strong>
      <Body color={c.inkSoft} style={{ marginTop: space.xs }}>
        {state.done ? t('guideDoneHere') : p(current.about)}
      </Body>
      <View style={{ height: 6, backgroundColor: c.line, borderRadius: 3, overflow: 'hidden', marginTop: space.md }}>
        <View style={{ width: `${(n / TUTORIAL.length) * 100}%`, height: '100%', backgroundColor: c.blue }} />
      </View>
      <Row style={{ marginTop: space.md, justifyContent: 'space-between' }}>
        <Small color={c.ink}>{t('guideReward', { money: money(current.reward) })}</Small>
        {state.done ? (
          <Button
            title={t('guideClaim', { money: money(current.reward) })}
            small
            loading={pending}
            onPress={async () => {
              const r = await run(() => api.post<{ reward: number }>(`/tutorial/${current.id}/claim`), {
                success: t('guideClaimed', { money: money(current.reward) }),
                invalidate: ['me'],
              });
              if (r) qc.invalidateQueries({ queryKey: ['tutorial'] });
            }}
          />
        ) : (
          <Button title={t('guideGo')} small variant="secondary" onPress={() => router.push(href)} />
        )}
      </Row>
    </Card>
  );
}
