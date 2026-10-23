import { Stack } from 'expo-router';
import { useGate } from '@/components/gate';
import { SkillList } from '@/components/skill-list';
import { Body, Screen } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

export default function Skills() {
  const gate = useGate();
  if (gate) return gate;
  return <SkillsScreen />;
}

function SkillsScreen() {
  const { t } = useI18n();
  const c = useColors();
  const me = useMe();
  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('allSkills') }} />
      <Body color={c.inkSoft} style={{ marginTop: space.lg }}>
        {t('skillsIntro')}
      </Body>
      <SkillList skills={me.data!.character!.skills} />
    </Screen>
  );
}
