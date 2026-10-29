import { CITY_BY_ID, LOCATION_BY_ID, LOW_MOOD_THRESHOLD, MIN_HEALTH_FOR_ACTIVITY } from '@rifftown/shared';

/** Bu enerjinin altında ana ekran dinlenmeyi önerir (moodlet "Yorgun" eşiğiyle aynı) */
const TIRED_ENERGY = 40;
import { type Href, router } from 'expo-router';
import { RefreshControl, View } from 'react-native';
import { GuideCard } from '@/components/guide';
import { JailBanner } from '@/components/justice';
import { MissionsCard } from '@/components/missions';
import { ChainsCard } from '@/components/chains';
import { MoodletList } from '@/components/moodlets';
import { ActionTicket } from '@/components/ticket';
import { TierMeter } from '@/components/tier';
import { Body, Button, Card, Display, Heading, ListRow, Meter, Row, Screen, Small } from '@/components/ui';
import { money } from '@/lib/format';
import { useNotifications } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { notificationHref, notificationText } from '@/lib/notify-text';
import { useMe } from '@/lib/session';
import { fonts, space, type, useColors } from '@/theme';
import { CityHero } from '@/components/art/hero';

export default function Home() {
  const me = useMe();
  const notes = useNotifications();
  const { t, p, locale, lang } = useI18n();
  const c = useColors();
  const data = me.data!;
  const ch = data.character!;
  const city = ch.cityId ? CITY_BY_ID[ch.cityId] : null;
  const loc = ch.locationId ? LOCATION_BY_ID[ch.locationId] : null;
  const jailed = !!ch.jailedUntil;
  const busy = !!data.action || jailed;

  return (
    <Screen
      refreshing={
        <RefreshControl
          refreshing={me.isRefetching}
          onRefresh={() => {
            me.refetch();
            notes.refetch();
          }}
          tintColor={c.pink}
        />
      }
    >
      <CityHero
        cityId={ch.cityId}
        name={ch.name}
        color={ch.avatarColor}
        avatarUrl={ch.avatarUrl}
        lines={[city ? t('inCity', { city: p(city.name) }) : t('traveling'), ...(loc ? [t('atLocation', { place: p(loc.name) })] : [])]}
      />

      {jailed && !data.action ? null : <ActionTicket action={data.action} />}
      <JailBanner />
      <GuideCard />

      {ch.health < MIN_HEALTH_FOR_ACTIVITY ? (
        <Card style={{ marginTop: space.lg, borderColor: c.danger }}>
          <Body color={c.danger}>{t('tooSickWarning')}</Body>
        </Card>
      ) : !data.action && (ch.mood < LOW_MOOD_THRESHOLD + 5 || ch.energy < TIRED_ENERGY) ? (
        // Yorgun ya da keyifsiz: uyarının yanında dinlen ve ye düğmeleri (playtest Y-3: yalnızca metin vardı)
        <Card style={{ marginTop: space.lg }}>
          <Body>{ch.mood < LOW_MOOD_THRESHOLD ? t('lowMoodWarning') : t('tiredHint')}</Body>
          <Row style={{ marginTop: space.sm, gap: space.sm }}>
            <Button title={t('rest')} small onPress={() => router.push('/rest')} />
            {ch.cityId ? <Button title={t('eatSomething')} small variant="secondary" onPress={() => router.push(`/location/${ch.cityId}-restaurant`)} /> : null}
          </Row>
        </Card>
      ) : null}
      {ch.addicted ? (
        <Card style={{ marginTop: space.lg, borderColor: c.danger }}>
          <Body color={c.danger}>{t('addictedWarning')}</Body>
        </Card>
      ) : null}

      {data.pendingInvites > 0 ? (
        <Card style={{ marginTop: space.lg, borderColor: c.pink }}>
          <ListRow title={t('pendingInvites', { n: data.pendingInvites })} onPress={() => router.push('/band')} right="›" last />
        </Card>
      ) : null}

      <Row style={{ marginTop: space.xl, alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <Small>{t('money')}</Small>
          <Body style={{ fontFamily: fonts.display, fontSize: type.display, lineHeight: type.display * 1.15 }}>{money(ch.money)}</Body>
        </View>
      </Row>
      <View style={{ marginTop: space.lg }}>
        <TierMeter label={t('mood')} scale="mood" value={ch.mood} whole />
        <MoodletList moodlets={ch.moodlets ?? []} />
        <TierMeter label={t('health')} scale="health" value={ch.health} whole />
        <TierMeter label={t('energy')} scale="energy" value={ch.energy ?? 100} whole />
        <TierMeter label={t('inspiration')} scale="inspiration" value={ch.inspiration ?? 0} whole />
      </View>

      <Heading>{t('quickActions')}</Heading>
      <View style={{ gap: space.sm }}>
        <Row>
          <Button title={t('rest')} variant="secondary" onPress={() => router.push('/rest')} disabled={!!data.action || !city} style={{ flex: 1 }} />
          <Button title={t('practiceShort')} variant="secondary" onPress={() => router.push('/study')} disabled={busy || !city} style={{ flex: 1 }} />
        </Row>
        <Row>
          <Button title={t('writeSong')} variant="secondary" onPress={() => router.push('/write-song')} disabled={busy || !city} style={{ flex: 1 }} />
          <Button title={t('travel')} variant="secondary" onPress={() => router.push('/travel')} disabled={busy || !city} style={{ flex: 1 }} />
        </Row>
      </View>

      <MissionsCard />
      <ChainsCard />

      <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Heading>{t('recent')}</Heading>
        <Button title={t('seeAll')} variant="ghost" small onPress={() => router.push('/notifications')} />
      </Row>
      {(notes.data ?? []).slice(0, 4).map((n, i, arr) => {
        const href = notificationHref(n, me.data?.character?.id);
        return (
          <ListRow
            key={n.id}
            title={notificationText(n, t, p, lang)}
            subtitle={new Date(n.createdAt).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            onPress={href ? () => router.push(href as Href) : undefined}
            left={!n.read ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.pink }} /> : <View style={{ width: 8 }} />}
            last={i === arr.length - 1}
          />
        );
      })}
    </Screen>
  );
}
