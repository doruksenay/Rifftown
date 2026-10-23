import {
  SKILL_BY_ID,
  SKILL_CATEGORIES,
  SKILL_CATEGORY_NAMES,
  SKILL_DEFS,
  type SkillCategory,
  type Skills,
  knows,
  tierName,
} from '@rifftown/shared';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { TierMeter } from '@/components/tier';
import { Heading, Small } from '@/components/ui';
import { money } from '@/lib/format';
import { useI18n } from '@/lib/i18n';
import { fonts, space, useColors } from '@/theme';

const CATEGORIES: readonly SkillCategory[] = SKILL_CATEGORIES;

/** Beceri ağacı: bilinen beceriler seviyesiyle, bilinmeyenler nasıl açılacağıyla gösterilir. */
export function SkillList({ skills, onlyKnown = false }: { skills: Skills; onlyKnown?: boolean }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  return (
    <View>
      {CATEGORIES.map((cat) => {
        const defs = SKILL_DEFS.filter((d) => d.category === cat && (!onlyKnown || knows(skills, d.id)));
        if (!defs.length) return null;
        return (
          <View key={cat}>
            <Heading>{p(SKILL_CATEGORY_NAMES[cat])}</Heading>
            {defs.map((d) => {
              if (knows(skills, d.id)) {
                return (
                  <Pressable
                    key={d.id}
                    accessibilityRole="button"
                    accessibilityHint={t('practiceThis')}
                    onPress={() => router.push({ pathname: '/study', params: { skill: d.id } })}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                  >
                    <TierMeter label={p(d.name)} scale="skill" value={skills[d.id]} />
                  </Pressable>
                );
              }
              const pre = d.prereq ? SKILL_BY_ID[d.prereq.skill] : null;
              return (
                <View key={d.id} style={{ marginBottom: space.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.sm }}>
                    <Small color={c.inkSoft} style={{ flexShrink: 1, fontFamily: fonts.bodyMedium }}>{p(d.name)}</Small>
                    <Small>{t('notLearned')}</Small>
                  </View>
                  <Small>
                    {d.learn === 'book'
                      ? t('learnAtBookstore', { price: money(d.bookPrice ?? 0) })
                      : d.learn === 'university'
                        ? t('err_learn_at_university')
                        : d.learn === 'gym'
                          ? t('learnAtGym')
                          : t('learnAtSchool')}
                    {d.vip ? ` ${t('vipOnly')}.` : ''}
                  </Small>
                  {pre ? <Small>{t('requires', { skill: p(pre.name), tier: tierName('skill', d.prereq!.min, lang) })}</Small> : null}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
