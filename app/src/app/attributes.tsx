// Nitelikler ve XP harcama ekranı. Kurallar packages/shared/src/attributes.ts; sunucu her harcamayı yeniden denetler.
// VIP olmayanlar nitelikleri kelimeyle görür (sunucu bulanık değer gönderir). Bir puanın bedeli kelime
// basamağına bağlı olduğu için bulanık değerle hesaplanan bedel de doğrudur.

import { ATTR_MAX, ATTRIBUTE_DEFS, attrPointCost } from '@rifftown/shared';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useGate } from '@/components/gate';
import { TierMeter } from '@/components/tier';
import { Body, Button, Card, ErrorView, Loading, Row, Screen, Small, Strong } from '@/components/ui';
import { api } from '@/lib/api';
import { useAttributes, useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { space, useColors } from '@/theme';

export default function Attributes() {
  const gate = useGate();
  if (gate) return gate;
  return <AttributesScreen />;
}

function AttributesScreen() {
  const { t, p } = useI18n();
  const c = useColors();
  const q = useAttributes();
  const { run, pending } = useRun();

  if (q.isLoading) return <Loading />;
  if (q.error || !q.data) return <ErrorView error={q.error} onRetry={() => q.refetch()} />;
  const s = q.data;

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('attributes') }} />
      <Body color={c.inkSoft} style={{ marginTop: space.lg }}>
        {t('attributesIntro')}
      </Body>

      <Card style={{ marginTop: space.md }}>
        <Strong>{t('xpBalance', { n: s.xp })}</Strong>
        <Small>{t('xpProgress', { d: s.xpDay, dcap: s.xpDayCap, w: s.xpWeek, wcap: s.xpWeekCap })}</Small>
        {s.newAccount ? <Small color={c.ink}>{t('xpNewAccount')}</Small> : null}
        <Small style={{ marginTop: space.xs }}>{s.attributeRoom > 0 ? t('attrRoom', { n: s.attributeRoom }) : t('attrRoomFull')}</Small>
      </Card>

      <View style={{ marginTop: space.lg }}>
        {ATTRIBUTE_DEFS.map((def) => {
          const value = s.attributes[def.id] ?? 0;
          const maxed = value >= ATTR_MAX;
          const cost = attrPointCost(value);
          return (
            <View key={def.id} style={{ marginBottom: space.lg }}>
              <TierMeter label={p(def.name)} scale="attribute" value={value} />
              <Small>{p(def.about)}</Small>
              <Row style={{ marginTop: space.xs, alignItems: 'center', justifyContent: 'space-between' }}>
                <Small color={c.ink}>{maxed ? t('attrMaxed') : t('attrCost', { n: cost })}</Small>
                <Button
                  title={t('attrRaise')}
                  small
                  variant="secondary"
                  accessibilityLabel={`${p(def.name)} ${t('attrRaise')}`}
                  disabled={pending || maxed || s.xp < cost}
                  onPress={() =>
                    run(() => api.post('/attributes/spend', { attribute: def.id, points: 1 }), {
                      success: t('attrRaised', { name: p(def.name) }),
                      invalidate: ['attributes', 'me'],
                    })
                  }
                />
              </Row>
            </View>
          );
        })}
      </View>

      <Small style={{ marginBottom: space.xl }}>{t('xpHowTo')}</Small>
    </Screen>
  );
}
