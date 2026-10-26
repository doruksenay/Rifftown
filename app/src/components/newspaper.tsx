// Şehir gazetesi: haberler, basın toplantısı ve röportaj, gazeteciler için haber yazma.

import { ARTICLE_BODY_MAX, ARTICLE_TITLE_MAX, ARTICLE_TONES, type ArticleTone, CITY_BY_ID, LOCATION_BY_ID, PRESS_RULES, priceFor, tierName } from '@rifftown/shared';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { HoursAction } from '@/components/action-form';
import { Body, Button, Card, Choice, Empty, Field, Heading, Row, Small, Strong } from '@/components/ui';
import { api } from '@/lib/api';
import { dateTime, money } from '@/lib/format';
import { useBand, useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

export interface ArticleDto {
  id: number;
  kind: 'news' | 'blog' | 'board';
  cityId: string;
  title: string;
  body: string;
  tone: ArticleTone;
  npc: boolean;
  author: { characterId: number; name: string } | null;
  band: { id: number; name: string } | null;
  createdAt: string;
  mine: boolean;
}

export function ArticleCard({ a, onReport }: { a: ArticleDto; onReport?: () => void }) {
  const { t, locale } = useI18n();
  const c = useColors();
  return (
    <Card style={{ marginBottom: space.sm }}>
      <Strong>{a.title}</Strong>
      <Small>
        {[a.npc ? t('npcReporter') : a.author?.name, a.band?.name, dateTime(a.createdAt, locale)].filter(Boolean).join(' · ')}
      </Small>
      <Body style={{ marginTop: space.sm }}>{a.body}</Body>
      <Row style={{ marginTop: space.sm, justifyContent: 'flex-end' }}>
        {a.author && !a.mine ? <Button title={t('profile')} small variant="ghost" onPress={() => router.push(`/character/${a.author!.characterId}`)} /> : null}
        {onReport && !a.mine && !a.npc ? <Button title={t('report')} small variant="ghost" onPress={onReport} /> : null}
      </Row>
      {a.tone !== 'neutral' ? <Small color={a.tone === 'positive' ? c.blue : c.pink}>{t(`tone_${a.tone}`)}</Small> : null}
    </Card>
  );
}

export function NewsFeed({ cityId, kind = 'news' }: { cityId: string; kind?: 'news' | 'blog' | 'board' }) {
  const { t } = useI18n();
  const { run } = useRun();
  const q = useQuery({
    queryKey: ['news', cityId, kind],
    queryFn: () => api.get<{ articles: ArticleDto[] }>(`/cities/${cityId}/news?kind=${kind}`).then((r) => r.articles),
    refetchInterval: 60000,
  });
  const report = (id: number) => run(() => api.post('/reports', { kind: 'article', targetId: id, text: '' }), { success: t('reported'), invalidate: [] });
  if (!q.data?.length) return <Empty text={t('noNews')} />;
  return (
    <View>
      {q.data.map((a) => (
        <ArticleCard key={a.id} a={a} onReport={() => report(a.id)} />
      ))}
    </View>
  );
}

export function Newspaper({ locationId }: { locationId: string }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const band = useBand();
  const loc = LOCATION_BY_ID[locationId];
  const city = CITY_BY_ID[loc.cityId];
  const ch = me.data?.character;
  const isLeader = !!me.data?.band?.isLeader;
  const press = band.data?.press?.[loc.cityId];
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tone, setTone] = useState<ArticleTone>('neutral');
  const [aboutBand, setAboutBand] = useState('');
  const bandSearch = useQuery({
    queryKey: ['leaderboard', loc.cityId],
    queryFn: () => api.get<{ bands: { id: number; name: string }[] }>(`/leaderboard?cityId=${loc.cityId}`).then((r) => r.bands),
    enabled: ch?.profession?.id === 'journalist',
  });
  const target = bandSearch.data?.find((b) => b.name.toLowerCase() === aboutBand.trim().toLowerCase());

  return (
    <View style={{ marginTop: space.lg }}>
      <Body color={c.inkSoft}>{t('newspaperIntro')}</Body>

      {band.data ? (
        <>
          <Heading>{t('pressTitle')}</Heading>
          <Card>
            <Body>{t('pressHere', { city: p(city.name), tier: tierName('press', press ?? 20, lang) })}</Body>
            <Small>{t('pressHint')}</Small>
          </Card>
          <View style={{ marginTop: space.md, gap: space.md }}>
            {isLeader ? (
              <HoursAction
                options={[PRESS_RULES.conference.hours]}
                build={() => ({ kind: 'press', mode: 'conference', locationId })}
                price={() => priceFor(PRESS_RULES.conference.price, city, 1)}
                label={t('pressConference')}
                goHome={false}
              />
            ) : (
              <Small>{t('pressConferenceLeader')}</Small>
            )}
            <HoursAction options={[PRESS_RULES.interview.hours]} build={() => ({ kind: 'press', mode: 'interview', locationId })} label={t('pressInterview')} goHome={false} />
          </View>
        </>
      ) : null}

      {ch?.profession?.id === 'journalist' ? (
        <>
          <Heading>{t('writeArticle')}</Heading>
          <Small style={{ marginBottom: space.sm }}>{t('writeArticleHint')}</Small>
          <Field label={t('articleTitle')} value={title} onChangeText={setTitle} maxLength={ARTICLE_TITLE_MAX} />
          <Field label={t('articleBody')} value={body} onChangeText={setBody} maxLength={ARTICLE_BODY_MAX} multiline />
          <Field label={t('articleBand')} value={aboutBand} onChangeText={setAboutBand} hint={aboutBand && !target ? t('articleBandUnknown') : undefined} />
          <Choice options={ARTICLE_TONES.map((x) => ({ value: x, label: t(`tone_${x}`) }))} value={tone} onChange={setTone} />
          <View style={{ height: space.md }} />
          <HoursAction
            options={[2]}
            build={() => ({ kind: 'write_article', locationId, title: title.trim(), body: body.trim(), bandId: target?.id ?? null, tone })}
            label={t('publishArticle')}
            disabled={title.trim().length < 3 || body.trim().length < 20}
            goHome={false}
          />
        </>
      ) : null}

      <Heading>{t('cityNews')}</Heading>
      <NewsFeed cityId={loc.cityId} />
      <Small style={{ marginTop: space.sm }}>{t('pressPrice', { money: money(priceFor(PRESS_RULES.conference.price, city, 1)) })}</Small>
    </View>
  );
}

/** Profilde oyuncunun blog yazıları */
export function BlogList({ id }: { id: number }) {
  const { t } = useI18n();
  const { run } = useRun();
  const q = useQuery({ queryKey: ['blog', id], queryFn: () => api.get<{ posts: ArticleDto[] }>(`/characters/${id}/blog`).then((r) => r.posts) });
  if (!q.data?.length) return null;
  return (
    <View>
      <Heading>{t('blogTitle')}</Heading>
      {q.data.map((a) =>
        a.mine ? (
          <View key={a.id}>
            <ArticleCard a={a} />
            <Button title={t('delete')} small variant="ghost" onPress={() => run(() => api.del(`/posts/${a.id}`), { invalidate: ['blog'] })} />
          </View>
        ) : (
          <ArticleCard key={a.id} a={a} onReport={() => run(() => api.post('/reports', { kind: 'article', targetId: a.id, text: '' }), { success: t('reported'), invalidate: [] })} />
        ),
      )}
    </View>
  );
}
