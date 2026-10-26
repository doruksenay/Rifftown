// İlerleme: konser raporundaki "neden böyle geçti", sıradaki sahne çubuğu ve rehber sonrası hedef kartı.

import {
  CITY_BY_ID,
  type GigDto,
  type GigFactorId,
  type GigFactorRating,
  LOCATION_TYPE_NAMES,
  type NextGoal,
  nextVenue,
  tierName,
  venueProgress,
} from '@rifftown/shared';
import { type Href, router } from 'expo-router';
import { View } from 'react-native';
import { Body, Button, Card, Heading, Meter, Row, Small, Strong } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import type { StringKey } from '@/lib/strings';
import { space, useColors } from '@/theme';

const FACTOR_ORDER: GigFactorId[] = ['songs', 'familiarity', 'skill', 'stage', 'setLength', 'presence', 'energy', 'mood'];

/** Öneriye göre gidilecek ekran */
function adviceTarget(f: GigFactorId, cityId: string): { label: StringKey; href: Href } | null {
  switch (f) {
    case 'setLength':
    case 'songs':
      return { label: 'adviceGo_write', href: '/write-song' };
    case 'familiarity':
      return { label: 'adviceGo_rehearse', href: `/location/${cityId}-studio` as Href };
    case 'skill':
    case 'stage':
      return { label: 'adviceGo_school', href: `/location/${cityId}-school` as Href };
    case 'energy':
    case 'mood':
      return { label: 'adviceGo_rest', href: '/rest' };
    default:
      return null;
  }
}

/** Konser raporu: etkenler ve sıradaki konser için öneriler (önerileri sadece grubun üyeleri görür) */
export function GigExplain({ result, cityId, isMember }: { result: NonNullable<GigDto['result']>; cityId: string; isMember: boolean }) {
  const { t } = useI18n();
  const c = useColors();
  const factors = result.factors;
  if (!factors) return null;
  const color = (r: GigFactorRating) => (r === 'weak' ? c.danger : r === 'strong' ? c.blue : c.inkSoft);
  const advice = result.advice ?? [];
  return (
    <View>
      <Heading>{t('whyTitle')}</Heading>
      {FACTOR_ORDER.filter((f) => factors[f]).map((f) => (
        <Row key={f} style={{ justifyContent: 'space-between', paddingVertical: 3 }}>
          <Body style={{ flex: 1 }}>{t(`factor_${f}` as StringKey)}</Body>
          <Small color={color(factors[f]!)} style={{ fontWeight: '700' }}>
            {t(`rating_${factors[f]}` as StringKey)}
          </Small>
        </Row>
      ))}
      <Small style={{ marginTop: space.sm }}>{t('fameRuleNote')}</Small>
      {isMember ? (
        <>
          <Heading>{t('nextStepsTitle')}</Heading>
          {advice.length ? (
            advice.map((f) => {
              const target = adviceTarget(f, cityId);
              return (
                <Card key={f} style={{ marginBottom: space.sm }}>
                  <Body>{t(`advice_${f}` as StringKey)}</Body>
                  {target ? (
                    <Button
                      title={t(target.label)}
                      small
                      variant="secondary"
                      style={{ alignSelf: 'flex-start', marginTop: space.sm }}
                      onPress={() => router.push(target.href)}
                    />
                  ) : null}
                </Card>
              );
            })
          ) : (
            <Body color={c.inkSoft}>{t('adviceAllGood')}</Body>
          )}
          {typeof result.fame === 'number' ? <VenueProgress fame={result.fame} /> : null}
        </>
      ) : null}
    </View>
  );
}

/** Bir şehirde sıradaki sahneye ne kaldığı */
export function VenueProgress({ fame, label }: { fame: number; label?: string }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const next = nextVenue(fame);
  if (!next) return <Small style={{ marginTop: space.sm }}>{label ? `${label}: ` : ''}{t('allVenuesOpen')}</Small>;
  const pct = venueProgress(fame);
  return (
    <View style={{ marginTop: space.sm }}>
      <Meter
        label={`${label ? `${label} · ` : ''}${t('venueProgress', { venue: p(LOCATION_TYPE_NAMES[next.venue]) })}`}
        value={pct * 100}
        right={`${tierName('fame', fame, lang)} → ${tierName('fame', next.minFame, lang)}`}
        color={c.blue}
      />
    </View>
  );
}

function goalHref(g: NextGoal, cityId: string): Href {
  const city = g.cityId && CITY_BY_ID[g.cityId] ? g.cityId : cityId;
  switch (g.id) {
    case 'band':
      return '/band';
    case 'songs':
      return '/write-song';
    case 'club':
      return `/location/${city}-bar` as Href;
    case 'hall':
      return `/location/${city}-club` as Href;
    case 'stadium':
      return `/location/${city}-hall` as Href;
    case 'tour':
      return '/travel';
    default:
      return '/charts';
  }
}

/** Rehber bittikten sonra ana ekranda: tek, somut bir hedef */
export function GoalCard({ goal, cityId }: { goal: NextGoal; cityId: string }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const city = goal.cityId && CITY_BY_ID[goal.cityId] ? p(CITY_BY_ID[goal.cityId].name) : '';
  const about = t(`goal_${goal.id}_about` as StringKey, {
    n: goal.n ?? 0,
    total: goal.total ?? 0,
    city,
    tier: goal.target !== undefined ? tierName('fame', goal.target, lang) : '',
  });
  const pct =
    goal.fame !== undefined && goal.target
      ? venueProgress(goal.fame)
      : goal.n !== undefined && goal.total
        ? goal.n / goal.total
        : null;
  return (
    <Card style={{ marginTop: space.lg, borderColor: c.purple, borderWidth: 1.5 }}>
      <Small color={c.purple}>{t('goalTitle')}</Small>
      <Strong style={{ marginTop: space.xs }}>{t(`goal_${goal.id}_title` as StringKey)}</Strong>
      <Body color={c.inkSoft} style={{ marginTop: space.xs }}>
        {about}
      </Body>
      {pct !== null ? (
        <View style={{ height: 6, backgroundColor: c.line, borderRadius: 3, overflow: 'hidden', marginTop: space.md }}>
          <View style={{ width: `${Math.round(pct * 100)}%`, height: '100%', backgroundColor: c.purple }} />
        </View>
      ) : null}
      <Row style={{ marginTop: space.md, justifyContent: 'flex-end' }}>
        <Button title={t('goalGo')} small variant="secondary" onPress={() => router.push(goalHref(goal, cityId))} />
      </Row>
    </Card>
  );
}
