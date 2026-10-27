// Özel ders: okulda ve üniversitede profesörler ve oyuncu öğretmenler; profilde arkadaştan öğren / arkadaşa öğret.
// Kurallar: packages/shared/src/lessons.ts. Ders yalnızca bilinen beceriyi geliştirir.

import { FRIEND_FORBIDDEN_CATEGORIES, HOUR_OPTIONS, SKILL_BY_ID, SKILL_CATEGORY_NAMES, type L, type SkillCategory, TEACHER_PRICE_RANGE, knows, tierName } from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { View } from 'react-native';
import { HoursAction } from '@/components/action-form';
import { Button, Card, Choice, Field, Heading, Row, Small, Strong } from '@/components/ui';
import { api } from '@/lib/api';
import { money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

interface LessonsResponse {
  professors: { id: string; name: string; category: SkillCategory; about: L; maxLevel: number; pricePerHour: number; lessonRate: number }[];
  teachers: { id: number; name: string; pricePerHour: number; lessonRate: number }[];
  hoursLeftToday: number;
  myLessonPrice: number | null;
  canTeach: boolean;
}

/** Okul ya da üniversite mekânında: seçili beceri için profesör veya orada bulunan öğretmenden özel ders */
export function PrivateLessons({ locationId, skill }: { locationId: string; skill: string | undefined }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const q = useQuery({ queryKey: ['lessons', locationId], queryFn: () => api.get<LessonsResponse>(`/lessons?locationId=${encodeURIComponent(locationId)}`) });
  const [tutor, setTutor] = useState<string>('professor');
  const [price, setPrice] = useState('');
  const skills = me.data?.character?.skills ?? {};
  const def = skill ? SKILL_BY_ID[skill] : undefined;
  const prof = def ? q.data?.professors.find((x) => x.category === def.category) : undefined;
  const teachers = def && def.category !== 'career' ? q.data?.teachers ?? [] : [];
  const chosenTeacher = teachers.find((x) => String(x.id) === tutor);
  const known = !!skill && knows(skills, skill);
  return (
    <View style={{ marginTop: space.lg }}>
      <Heading>{t('privateLessons')}</Heading>
      <Small style={{ marginBottom: space.sm }}>{t('privateLessonsIntro', { n: q.data?.hoursLeftToday ?? 0 })}</Small>
      {!known ? (
        <Small>{t('privateLessonsNeedSkill')}</Small>
      ) : (
        <>
          <Choice
            options={[
              ...(prof ? [{ value: 'professor', label: prof.name, hint: `${money(prof.pricePerHour)}/${t('hourShort')} · ${t('lessonUpTo', { tier: tierName('skill', prof.maxLevel, lang) })}` }] : []),
              ...teachers.map((x) => ({ value: String(x.id), label: x.name, hint: `${money(x.pricePerHour)}/${t('hourShort')}` })),
            ]}
            value={tutor}
            onChange={setTutor}
          />
          {prof && tutor === 'professor' ? <Small color={c.inkSoft}>{p(prof.about)}</Small> : null}
          <HoursAction
            options={HOUR_OPTIONS.lesson}
            build={(hours) =>
              chosenTeacher
                ? { kind: 'lesson', tutor: 'teacher', tutorId: chosenTeacher.id, skill: skill!, hours, locationId }
                : { kind: 'lesson', tutor: 'professor', skill: skill!, hours, locationId }
            }
            price={(h) => (chosenTeacher ? chosenTeacher.pricePerHour : prof?.pricePerHour ?? 0) * h}
            label={t('takeLesson')}
            disabled={!prof && !chosenTeacher}
          />
        </>
      )}
      {q.data?.canTeach ? (
        <Card style={{ marginTop: space.md, gap: space.xs }}>
          <Strong>{t('teachHere')}</Strong>
          <Small>{q.data.myLessonPrice ? t('myLessonPrice', { money: money(q.data.myLessonPrice) }) : t('notTeaching')}</Small>
          <Field label={t('lessonPriceLabel', { a: TEACHER_PRICE_RANGE[0], b: TEACHER_PRICE_RANGE[1] })} value={price} onChangeText={setPrice} keyboardType="number-pad" />
          <Row>
            <Button
              small
              title={t('save')}
              disabled={pending || !Number(price)}
              onPress={async () => {
                if (await run(() => api.post('/lessons/price', { price: Math.floor(Number(price)) }))) qc.invalidateQueries({ queryKey: ['lessons', locationId] });
              }}
            />
            <Button
              small
              variant="ghost"
              title={t('stopTeaching')}
              disabled={pending}
              onPress={async () => {
                if (await run(() => api.post('/lessons/price', { price: null }))) qc.invalidateQueries({ queryKey: ['lessons', locationId] });
              }}
            />
          </Row>
        </Card>
      ) : null}
    </View>
  );
}

/** Profilde: aynı şehirdeki arkadaştan ya da sevgiliden ders al, ya da ona öğretmeyi öner */
export function FriendLessons({ otherId, sameCity }: { otherId: number; sameCity: boolean }) {
  const { t, p, lang } = useI18n();
  const me = useMe();
  const { run, pending } = useRun();
  const info = useQuery({ queryKey: ['friendLesson', otherId], queryFn: () => api.get<{ lessonRate: number; available: boolean }>(`/characters/${otherId}/lesson`) });
  const skills = me.data?.character?.skills ?? {};
  const mine = Object.keys(skills).filter((id) => SKILL_BY_ID[id] && !FRIEND_FORBIDDEN_CATEGORIES.includes(SKILL_BY_ID[id].category));
  const [skill, setSkill] = useState<string>(mine[0] ?? '');
  if (!info.data?.available || !sameCity || !mine.length) return null;
  return (
    <View style={{ marginTop: space.md }}>
      <Heading>{t('friendLessons')}</Heading>
      <Small style={{ marginBottom: space.sm }}>{t('friendLessonsIntro')}</Small>
      <Choice
        options={mine.map((id) => ({ value: id, label: p(SKILL_BY_ID[id].name), hint: `${p(SKILL_CATEGORY_NAMES[SKILL_BY_ID[id].category])} · ${tierName('skill', skills[id], lang)}` }))}
        value={skill}
        onChange={setSkill}
      />
      <HoursAction options={[1, 2]} build={(hours) => ({ kind: 'lesson', tutor: 'friend', tutorId: otherId, skill, hours })} label={t('learnFrom')} disabled={!skill} goHome={false} />
      <Button
        small
        variant="secondary"
        title={t('teachThem')}
        disabled={pending || !skill}
        style={{ marginTop: space.sm }}
        onPress={() => run(() => api.post('/lessons/invite', { toId: otherId, skill }), { success: t('lessonInviteSent') })}
      />
    </View>
  );
}
