// Topluluk: şehir panosu, bloglar ve haftalık dergi. İçerik küfür filtresinden geçer; engellenenler görünmez; şikâyet edilebilir.

import { BLOG_BODY_MAX, BLOG_TITLE_MAX, BOARD_MAX, CITY_BY_ID } from '@rifftown/shared';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useGate } from '@/components/gate';
import { type ArticleDto, ArticleCard, NewsFeed } from '@/components/newspaper';
import { Body, Button, Choice, Empty, Field, Heading, Screen, Small } from '@/components/ui';
import { api } from '@/lib/api';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

type Tab = 'board' | 'blog' | 'magazine';

export default function CommunityScreen() {
  const gate = useGate();
  if (gate) return gate;
  return <Community />;
}

function Community() {
  const { t, p } = useI18n();
  const c = useColors();
  const me = useMe();
  const { run, pending } = useRun();
  const cityId = me.data?.character?.cityId ?? 'istanbul';
  const [tab, setTab] = useState<Tab>('board');
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const mag = useQuery({
    queryKey: ['magazine', cityId],
    queryFn: () => api.get<{ articles: ArticleDto[] }>(`/cities/${cityId}/magazine`).then((r) => r.articles),
    enabled: tab === 'magazine',
  });
  const report = (id: number) => run(() => api.post('/reports', { kind: 'article', targetId: id, text: '' }), { success: t('reported'), invalidate: [] });
  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('communityTitle') }} />
      <Body color={c.inkSoft} style={{ marginTop: space.lg }}>{t('communityIntro', { city: p(CITY_BY_ID[cityId].name) })}</Body>
      <View style={{ marginTop: space.md }}>
        <Choice<Tab> options={(['board', 'blog', 'magazine'] as const).map((x) => ({ value: x, label: t(`community_${x}`) }))} value={tab} onChange={setTab} />
      </View>

      {tab === 'board' ? (
        <>
          <Heading>{t('community_board')}</Heading>
          <Field label={t('boardNote')} value={note} onChangeText={setNote} maxLength={BOARD_MAX} multiline />
          <Button
            title={t('postNote')}
            small
            loading={pending}
            disabled={!note.trim()}
            onPress={async () => {
              if (await run(() => api.post(`/cities/${cityId}/board`, { text: note.trim() }), { invalidate: ['news'] })) setNote('');
            }}
          />
          <View style={{ height: space.md }} />
          <NewsFeed cityId={cityId} kind="board" />
        </>
      ) : tab === 'blog' ? (
        <>
          <Heading>{t('writeBlog')}</Heading>
          <Field label={t('articleTitle')} value={title} onChangeText={setTitle} maxLength={BLOG_TITLE_MAX} />
          <Field label={t('blogBody')} value={body} onChangeText={setBody} maxLength={BLOG_BODY_MAX} multiline />
          <Button
            title={t('publishBlog')}
            small
            loading={pending}
            disabled={title.trim().length < 3 || body.trim().length < 20}
            onPress={async () => {
              if (await run(() => api.post('/blog', { title: title.trim(), body: body.trim() }), { invalidate: ['news'] })) {
                setTitle('');
                setBody('');
              }
            }}
          />
          <View style={{ height: space.md }} />
          <NewsFeed cityId={cityId} kind="blog" />
        </>
      ) : (
        <>
          <Heading>{t('magazineTitle', { city: p(CITY_BY_ID[cityId].name) })}</Heading>
          <Small style={{ marginBottom: space.sm }}>{t('magazineHint')}</Small>
          {mag.data?.length ? mag.data.map((a) => <ArticleCard key={a.id} a={a} onReport={() => report(a.id)} />) : <Empty text={t('noNews')} />}
        </>
      )}
    </Screen>
  );
}
