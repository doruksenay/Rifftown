import { HOUR_OPTIONS, SKILL_CATEGORIES, SKILL_CATEGORY_NAMES, SKILL_DEFS, type SkillCategory, knows, tierName } from '@rifftown/shared';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { HoursAction } from '@/components/action-form';
import { useGate } from '@/components/gate';
import { Button, Choice, Heading, Screen, Small } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { space } from '@/theme';

const CATEGORIES: readonly SkillCategory[] = SKILL_CATEGORIES;

export default function Study() {
  const gate = useGate();
  if (gate) return gate;
  return <StudyScreen />;
}

function StudyScreen() {
  const { t, p, lang } = useI18n();
  const params = useLocalSearchParams<{ skill?: string }>();
  const me = useMe();
  const skills = me.data!.character!.skills;
  const known = SKILL_DEFS.filter((d) => knows(skills, d.id));
  const [skill, setSkill] = useState<string>(
    params.skill && knows(skills, params.skill) ? params.skill : known.find((d) => d.category === 'instruments')?.id ?? known[0]?.id,
  );

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('practice') }} />
      <Heading>{t('studyTitle')}</Heading>
      {CATEGORIES.map((cat) => {
        const defs = known.filter((d) => d.category === cat);
        if (!defs.length) return null;
        return (
          <View key={cat} style={{ marginBottom: space.md }}>
            <Small style={{ marginBottom: space.xs }}>{p(SKILL_CATEGORY_NAMES[cat])}</Small>
            <Choice
              options={defs.map((d) => ({ value: d.id, label: p(d.name), hint: tierName('skill', skills[d.id], lang) }))}
              value={skill}
              onChange={setSkill}
            />
          </View>
        );
      })}
      <Button title={t('allSkills')} variant="ghost" small style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }} onPress={() => router.push('/skills')} />
      <Small style={{ marginVertical: space.lg }}>{t('practiceIntro')}</Small>
      <HoursAction options={HOUR_OPTIONS.study} build={(hours) => ({ kind: 'study', skill, hours })} label={t('start')} />
    </Screen>
  );
}
